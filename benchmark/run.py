import argparse
import asyncio
import datetime
import hashlib
import json
import math
import os
import subprocess
import sys
from pathlib import Path

# Insert backend directory into sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.session import Base
from app.database.init_db import init_db
from app.ai_engine.rule_engine import RuleEngine
from app.ai_engine.llm_engine import LLMEngine
from app.ai_engine.review_pipeline import AIReviewPipeline
from app.ai_engine.grounding import validate_finding
from app.models.guideline import BrandGuideline, ApprovedFact, ApprovedSource
from app.core.config import settings


def wilson_score_interval(k: int, n: int, confidence: float = 0.95):
    if n <= 0:
        return (0.0, 0.0)
    z = 1.959963984540054  # 95% confidence
    p = k / n
    denom = 1 + (z ** 2) / n
    center = (p + (z ** 2) / (2 * n)) / denom
    margin = (z / denom) * math.sqrt((p * (1 - p) / n) + (z ** 2) / (4 * (n ** 2)))
    lower = max(0.0, center - margin)
    upper = min(1.0, center + margin)
    return (round(lower, 4), round(upper, 4))


def compute_metrics(items, predictions):
    tp = fp = tn = fn = 0
    misclassified = []
    category_counts = {}
    category_detected = {}

    for item, pred in zip(items, predictions):
        label = item["label"]
        item_id = item["id"]
        if label == "violation" and pred == "violation":
            tp += 1
        elif label == "compliant" and pred == "violation":
            fp += 1
            misclassified.append(item_id)
        elif label == "compliant" and pred == "compliant":
            tn += 1
        elif label == "violation" and pred == "compliant":
            fn += 1
            misclassified.append(item_id)

        for cat in item.get("categories", []):
            category_counts[cat] = category_counts.get(cat, 0) + 1
            if pred == "violation":
                category_detected[cat] = category_detected.get(cat, 0) + 1

    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    fnr = fn / (tp + fn) if (tp + fn) > 0 else 0.0

    cat_recall = {}
    for cat in sorted(category_counts.keys()):
        tot = category_counts[cat]
        det = category_detected.get(cat, 0)
        cat_recall[cat] = round(det / tot, 4) if tot > 0 else 0.0

    return {
        "tp": tp,
        "fp": fp,
        "tn": tn,
        "fn": fn,
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1": round(f1, 4),
        "fpr": round(fpr, 4),
        "fnr": round(fnr, 4),
        "precision_wilson_95": wilson_score_interval(tp, tp + fp),
        "recall_wilson_95": wilson_score_interval(tp, tp + fn),
        "per_category_recall": cat_recall,
        "misclassified_ids": misclassified,
    }


def get_git_commit() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=str(REPO_ROOT), text=True
        ).strip()
    except Exception:
        return "unknown"


def get_file_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()


async def run_evaluation(split: str, confirm_final: bool = False, save_baseline: bool = False, save_tuned: bool = False):
    if split == "test" and not confirm_final:
        print("ERROR: Refusing to evaluate test split without --confirm-final. The test split is frozen.", file=sys.stderr)
        sys.exit(1)

    dataset_path = REPO_ROOT / "benchmark" / "dataset.json"
    if not dataset_path.exists():
        print(f"ERROR: Dataset not found at {dataset_path}", file=sys.stderr)
        sys.exit(1)

    with open(dataset_path, "r", encoding="utf-8") as f:
        full_dataset = json.load(f)

    items = [x for x in full_dataset if x.get("split") == split]
    if not items:
        print(f"ERROR: No items found for split '{split}'", file=sys.stderr)
        sys.exit(1)

    print(f"Loaded {len(items)} items for split '{split}' from {dataset_path.name}")

    # Set up in-memory fixture database
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    init_db(db)

    rule_engine = RuleEngine(db)
    llm_engine = LLMEngine(db)
    pipeline = AIReviewPipeline(db)
    guidelines = db.query(BrandGuideline).filter(BrandGuideline.is_active == True).all()
    facts = db.query(ApprovedFact).filter(ApprovedFact.is_active == True).all()
    sources = db.query(ApprovedSource).all()
    retrieved_knowledge = {
        "guideline_ids": {g.id for g in guidelines},
        "fact_ids": {f.id for f in facts},
        "source_ids": {s.id for s in sources},
        "guidelines": guidelines,
        "facts": facts,
        "sources": sources
    }

    # Determine modes
    modes = ["rules_only", "semantic_fallback", "combined"]
    has_llm_key = False
    if (settings.OPENAI_API_KEY and settings.AI_PROVIDER == "openai") or (
        settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini"
    ):
        has_llm_key = True
        modes.append("llm")
    else:
        print("LLM mode skipped: no key")

    results_by_mode = {}

    for mode in modes:
        preds = []
        total_needs_review = 0
        for item in items:
            text = item["text"]
            if mode == "rules_only":
                findings = rule_engine.analyze(text)
                for f in findings:
                    validate_finding(f, text, retrieved_knowledge)
            elif mode == "semantic_fallback":
                findings = llm_engine._semantic_fallback_analysis(text, guidelines)
                for f in findings:
                    validate_finding(f, text, retrieved_knowledge)
            elif mode == "combined":
                res = await pipeline.execute_review(text)
                findings = res.get("findings", [])
            elif mode == "llm":
                findings = await llm_engine.analyze(text)
                for f in findings:
                    validate_finding(f, text, retrieved_knowledge)
            else:
                findings = []

            # Document-level prediction uses GROUNDED findings only
            grounded_findings = [f for f in findings if f.get("grounding_status") == "GROUNDED"]
            needs_review_count = sum(1 for f in findings if f.get("grounding_status") == "NEEDS_HUMAN_REVIEW")
            total_needs_review += needs_review_count

            pred = "violation" if len(grounded_findings) > 0 else "compliant"
            preds.append(pred)

        # Metrics on all split items
        all_metrics = compute_metrics(items, preds)

        # Metrics on hard cases only
        hard_items = [it for it in items if it.get("hard_case", False)]
        hard_preds = [p for it, p in zip(items, preds) if it.get("hard_case", False)]
        hard_metrics = compute_metrics(hard_items, hard_preds) if hard_items else {}

        results_by_mode[mode] = {
            "all": all_metrics,
            "hard_cases": hard_metrics,
            "misclassified_ids": all_metrics["misclassified_ids"],
            "needs_human_review_count": total_needs_review
        }

    # Format Markdown Table
    print("\n### Benchmark Results Summary (" + split.upper() + " split, N=" + str(len(items)) + ")")
    headers = ["Mode", "Subset", "N", "TP", "FP", "TN", "FN", "Prec", "Rec", "F1", "FPR", "FNR", "Prec 95% CI", "Rec 95% CI"]
    print("| " + " | ".join(headers) + " |")
    print("|" + "|".join(["---"] * len(headers)) + "|")

    for mode in modes:
        m_all = results_by_mode[mode]["all"]
        m_hard = results_by_mode[mode]["hard_cases"]
        n_all = len(items)
        n_hard = sum(1 for it in items if it.get("hard_case", False))

        row_all = [
            mode, "All", str(n_all),
            str(m_all["tp"]), str(m_all["fp"]), str(m_all["tn"]), str(m_all["fn"]),
            f"{m_all['precision']:.3f}", f"{m_all['recall']:.3f}", f"{m_all['f1']:.3f}",
            f"{m_all['fpr']:.3f}", f"{m_all['fnr']:.3f}",
            f"[{m_all['precision_wilson_95'][0]:.2f}, {m_all['precision_wilson_95'][1]:.2f}]",
            f"[{m_all['recall_wilson_95'][0]:.2f}, {m_all['recall_wilson_95'][1]:.2f}]"
        ]
        print("| " + " | ".join(row_all) + " |")

        if m_hard:
            row_hard = [
                mode, "Hard Cases", str(n_hard),
                str(m_hard["tp"]), str(m_hard["fp"]), str(m_hard["tn"]), str(m_hard["fn"]),
                f"{m_hard['precision']:.3f}", f"{m_hard['recall']:.3f}", f"{m_hard['f1']:.3f}",
                f"{m_hard['fpr']:.3f}", f"{m_hard['fnr']:.3f}",
                f"[{m_hard['precision_wilson_95'][0]:.2f}, {m_hard['precision_wilson_95'][1]:.2f}]",
                f"[{m_hard['recall_wilson_95'][0]:.2f}, {m_hard['recall_wilson_95'][1]:.2f}]"
            ]
            print("| " + " | ".join(row_hard) + " |")

    print("\n### Per-Category Recall")
    all_cats = sorted({cat for it in items for cat in it.get("categories", [])})
    cat_headers = ["Mode"] + all_cats
    print("| " + " | ".join(cat_headers) + " |")
    print("|" + "|".join(["---"] * len(cat_headers)) + "|")
    for mode in modes:
        row = [mode]
        for c in all_cats:
            val = results_by_mode[mode]["all"]["per_category_recall"].get(c, 0.0)
            row.append(f"{val:.3f}")
        print("| " + " | ".join(row) + " |")

    print("\n### Needs Human Review Counts")
    for mode in modes:
        print(f"- {mode}: {results_by_mode[mode]['needs_human_review_count']} item(s)")

    # Save Results
    results_dir = REPO_ROOT / "benchmark" / "results"
    results_dir.mkdir(parents=True, exist_ok=True)

    payload = {
        "split": split,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "git_commit": get_git_commit(),
        "dataset_sha256": get_file_sha256(dataset_path),
        "total_items": len(items),
        "modes": results_by_mode,
    }

    if save_baseline:
        baseline_path = results_dir / "baseline_dev.json"
        with open(baseline_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"Dev baseline saved to: {baseline_path}")
    elif save_tuned:
        tuned_path = results_dir / "tuned_dev.json"
        with open(tuned_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"Tuned dev results saved to: {tuned_path}")
    else:
        # Default dev run saves to after_grounding_dev.json without overwriting baseline or tuned
        grounding_path = results_dir / "after_grounding_dev.json"
        with open(grounding_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"After-grounding dev results saved to: {grounding_path}")

    db.close()


def main():
    parser = argparse.ArgumentParser(description="BrandGuard AI Benchmark Evaluation Runner")
    parser.add_argument("--split", choices=["dev", "test"], required=True, help="Dataset split to evaluate")
    parser.add_argument("--confirm-final", action="store_true", help="Confirmation required to evaluate frozen test split")
    parser.add_argument("--save-baseline", action="store_true", help="Explicitly save output as baseline_dev.json")
    parser.add_argument("--save-tuned", action="store_true", help="Save output as tuned_dev.json")
    args = parser.parse_args()

    asyncio.run(run_evaluation(args.split, args.confirm_final, args.save_baseline, args.save_tuned))


if __name__ == "__main__":
    main()

