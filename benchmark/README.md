# BrandGuard AI — Compliance Benchmark Dataset

## Overview
90 labelled items for evaluating brand compliance review: 63 `dev` items for development and tuning, 27 `test` items frozen for final evaluation.

## Labelling Rules
- **violation**: text breaches at least one policy (banned phrase, non-standard terminology, missing disclaimer, unsupported claim, bad citation, or inappropriate tone).
- **compliant**: text satisfies all policies; `categories` is `[]`.
- **hard_case**: `true` if the item is a hard negative (compliant but superficially risky) or hard positive (violation but obfuscated).

## Banned Phrases
`guaranteed returns`, `risk-free investment`, `instant wealth`, `100% profit`, `crypto moon`

## Required Disclaimer
All investment-product copy must include: *"Investments are subject to market risk."*

## Preferred Terminology
Use `digital financial services` (not `money app`) and `secure transactions` (not `unhackable transfers`).

## Test Split — FROZEN
The `test` split **must not** be used for model tuning, threshold selection, or feature engineering. Reserve it for final, one-shot evaluation only.

## Provenance
Items were drafted with AI assistance and then reviewed by the team. Unicode lookalike characters in hard positives are intentional and machine-detectable.

## How to Run
```bash
python -m benchmark.run --split dev
python -m benchmark.run --split test --confirm-final  # frozen final evaluation only
```

## Results

All metrics below are generated directly from benchmark result JSON files (`benchmark/results/*.json`).

### Dev Baseline (Pre-Tuning)
- **Split**: `dev` (N = 63)

#### Metric Summary
| Mode | N | TP | FP | TN | FN | Precision | Recall | F1 | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | 63 | 17 | 11 | 20 | 15 | 0.607 | 0.531 | 0.567 | [0.42, 0.76] | [0.36, 0.69] |
| `semantic_fallback` | 63 | 1 | 1 | 30 | 31 | 0.500 | 0.031 | 0.059 | [0.09, 0.91] | [0.01, 0.16] |
| `combined` | 63 | 17 | 11 | 20 | 15 | 0.607 | 0.531 | 0.567 | [0.42, 0.76] | [0.36, 0.69] |

#### Misclassified Item IDs per Mode
- **`rules_only`** (26 items): `d006, d008, d009, d015, d017, d020, d021, d022, d023, d024, d025, d026, d028, d030, d032, d034, d046, d048, d049, d050, d051, d052, d053, d054, d056, d062`
- **`semantic_fallback`** (32 items): `d001, d002, d003, d005, d006, d007, d008, d009, d010, d011, d012, d013, d014, d015, d016, d017, d018, d019, d020, d021, d022, d023, d024, d025, d026, d027, d028, d029, d030, d031, d032, d053`
- **`combined`** (26 items): `d006, d008, d009, d015, d017, d020, d021, d022, d023, d024, d025, d026, d028, d030, d032, d034, d046, d048, d049, d050, d051, d052, d053, d054, d056, d062`

### Dev Tuned (Pre-Grounding)
- **Split**: `dev` (N = 63)

#### Metric Summary
| Mode | N | TP | FP | TN | FN | Precision | Recall | F1 | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | 63 | 19 | 1 | 30 | 13 | 0.950 | 0.594 | 0.731 | [0.76, 0.99] | [0.42, 0.74] |
| `semantic_fallback` | 63 | 18 | 1 | 30 | 14 | 0.947 | 0.562 | 0.706 | [0.75, 0.99] | [0.39, 0.72] |
| `combined` | 63 | 30 | 1 | 30 | 2 | 0.968 | 0.938 | 0.952 | [0.84, 0.99] | [0.80, 0.98] |

#### Misclassified Item IDs per Mode
- **`rules_only`** (14 items): `d006, d008, d009, d017, d020, d021, d022, d023, d024, d025, d027, d028, d030, d054`
- **`semantic_fallback`** (15 items): `d002, d003, d009, d010, d011, d012, d013, d014, d015, d016, d018, d019, d028, d032, d054`
- **`combined`** (3 items): `d009, d028, d054`

### Dev After Grounding v2
- **Split**: `dev` (N = 63)

#### Metric Summary (CONFIRMED view)
| Mode | N | TP | FP | TN | FN | Precision | Recall | F1 | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | 63 | 19 | 1 | 30 | 13 | 0.950 | 0.594 | 0.731 | [0.76, 0.99] | [0.42, 0.74] |
| `semantic_fallback` | 63 | 16 | 1 | 30 | 16 | 0.941 | 0.500 | 0.653 | [0.73, 0.99] | [0.34, 0.66] |
| `combined` | 63 | 28 | 1 | 30 | 4 | 0.966 | 0.875 | 0.918 | [0.83, 0.99] | [0.72, 0.95] |

#### Metric Summary (SURFACED view)
| Mode | N | TP | FP | TN | FN | Precision | Recall | F1 | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | 63 | 19 | 1 | 30 | 13 | 0.950 | 0.594 | 0.731 | [0.76, 0.99] | [0.42, 0.74] |
| `semantic_fallback` | 63 | 18 | 1 | 30 | 14 | 0.947 | 0.562 | 0.706 | [0.75, 0.99] | [0.39, 0.72] |
| `combined` | 63 | 30 | 1 | 30 | 2 | 0.968 | 0.938 | 0.952 | [0.84, 0.99] | [0.80, 0.98] |

#### Misclassified Item IDs per Mode
- **`rules_only`** (14 items): `d006, d008, d009, d017, d020, d021, d022, d023, d024, d025, d027, d028, d030, d054`
- **`semantic_fallback`** (17 items): `d002, d003, d009, d010, d011, d012, d013, d014, d015, d016, d018, d019, d023, d025, d028, d032, d054`
- **`combined`** (5 items): `d009, d023, d025, d028, d054`

### Test Baseline Code (Pre-Tuning Code on Test Split)
- **Split**: `test` (N = 27)

#### Metric Summary
| Mode | N | TP | FP | TN | FN | Precision | Recall | F1 | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | 27 | 10 | 7 | 6 | 4 | 0.588 | 0.714 | 0.645 | [0.36, 0.78] | [0.45, 0.88] |
| `semantic_fallback` | 27 | 1 | 1 | 12 | 13 | 0.500 | 0.071 | 0.125 | [0.09, 0.91] | [0.01, 0.31] |
| `combined` | 27 | 10 | 7 | 6 | 4 | 0.588 | 0.714 | 0.645 | [0.36, 0.78] | [0.45, 0.88] |

#### Misclassified Item IDs per Mode
- **`rules_only`** (11 items): `t010, t011, t012, t014, t017, t018, t019, t020, t021, t025, t027`
- **`semantic_fallback`** (14 items): `t001, t002, t003, t005, t006, t007, t008, t009, t010, t011, t012, t013, t014, t020`
- **`combined`** (11 items): `t010, t011, t012, t014, t017, t018, t019, t020, t021, t025, t027`

### Test Final (Frozen Test Split on HEAD)
- **Split**: `test` (N = 27)

#### Metric Summary (CONFIRMED view)
| Mode | N | TP | FP | TN | FN | Precision | Recall | F1 | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | 27 | 9 | 0 | 13 | 5 | 1.000 | 0.643 | 0.783 | [0.70, 1.00] | [0.39, 0.84] |
| `semantic_fallback` | 27 | 6 | 0 | 13 | 8 | 1.000 | 0.429 | 0.600 | [0.61, 1.00] | [0.21, 0.67] |
| `combined` | 27 | 12 | 0 | 13 | 2 | 1.000 | 0.857 | 0.923 | [0.76, 1.00] | [0.60, 0.96] |

#### Metric Summary (SURFACED view)
| Mode | N | TP | FP | TN | FN | Precision | Recall | F1 | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | 27 | 9 | 0 | 13 | 5 | 1.000 | 0.643 | 0.783 | [0.70, 1.00] | [0.39, 0.84] |
| `semantic_fallback` | 27 | 7 | 0 | 13 | 7 | 1.000 | 0.500 | 0.667 | [0.65, 1.00] | [0.27, 0.73] |
| `combined` | 27 | 13 | 1 | 12 | 1 | 0.929 | 0.929 | 0.929 | [0.69, 0.99] | [0.69, 0.99] |

#### Misclassified Item IDs per Mode
- **`rules_only`** (5 items): `t010, t011, t012, t013, t014`
- **`semantic_fallback`** (8 items): `t002, t003, t006, t007, t008, t009, t010, t014`
- **`combined`** (2 items): `t010, t014`

### Holdout v2 (40 New Unseen Items)
- **Dataset**: `benchmark/holdout_v2.json` (N = 40; 20 violations, 20 compliant; 20 hard cases)
- Evaluated strictly once without any rule tuning or parameter adjustments.

#### Metric Summary (CONFIRMED view)
| Mode | Subset | N | TP | FP | TN | FN | Prec | Rec | F1 | FPR | FNR | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | All | 40 | 13 | 6 | 14 | 7 | 0.684 | 0.650 | 0.667 | 0.300 | 0.350 | [0.46, 0.85] | [0.43, 0.82] |
| `rules_only` | Hard Cases | 20 | 4 | 6 | 4 | 6 | 0.400 | 0.400 | 0.400 | 0.600 | 0.600 | [0.17, 0.69] | [0.17, 0.69] |
| `semantic_fallback` | All | 40 | 8 | 1 | 19 | 12 | 0.889 | 0.400 | 0.552 | 0.050 | 0.600 | [0.56, 0.98] | [0.22, 0.61] |
| `semantic_fallback` | Hard Cases | 20 | 4 | 1 | 9 | 6 | 0.800 | 0.400 | 0.533 | 0.100 | 0.600 | [0.38, 0.96] | [0.17, 0.69] |
| `combined` | All | 40 | 15 | 6 | 14 | 5 | 0.714 | 0.750 | 0.732 | 0.300 | 0.250 | [0.50, 0.86] | [0.53, 0.89] |
| `combined` | Hard Cases | 20 | 6 | 6 | 4 | 4 | 0.500 | 0.600 | 0.545 | 0.600 | 0.400 | [0.25, 0.75] | [0.31, 0.83] |

#### Metric Summary (SURFACED view)
| Mode | Subset | N | TP | FP | TN | FN | Prec | Rec | F1 | FPR | FNR | Prec 95% CI | Rec 95% CI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `rules_only` | All | 40 | 13 | 6 | 14 | 7 | 0.684 | 0.650 | 0.667 | 0.300 | 0.350 | [0.46, 0.85] | [0.43, 0.82] |
| `rules_only` | Hard Cases | 20 | 4 | 6 | 4 | 6 | 0.400 | 0.400 | 0.400 | 0.600 | 0.600 | [0.17, 0.69] | [0.17, 0.69] |
| `semantic_fallback` | All | 40 | 10 | 1 | 19 | 10 | 0.909 | 0.500 | 0.645 | 0.050 | 0.500 | [0.62, 0.98] | [0.30, 0.70] |
| `semantic_fallback` | Hard Cases | 20 | 5 | 1 | 9 | 5 | 0.833 | 0.500 | 0.625 | 0.100 | 0.500 | [0.44, 0.97] | [0.24, 0.76] |
| `combined` | All | 40 | 17 | 6 | 14 | 3 | 0.739 | 0.850 | 0.791 | 0.300 | 0.150 | [0.54, 0.87] | [0.64, 0.95] |
| `combined` | Hard Cases | 20 | 7 | 6 | 4 | 3 | 0.538 | 0.700 | 0.609 | 0.600 | 0.300 | [0.29, 0.77] | [0.40, 0.89] |

#### Misclassified Item IDs per Mode (Confirmed View)
- **`rules_only`** (13 items): `h009, h011, h014, h016, h017, h018, h020, h031, h032, h034, h035, h036, h037`
- **`semantic_fallback`** (13 items): `h002, h003, h006, h007, h008, h009, h011, h013, h014, h017, h018, h019, h034`
- **`combined`** (11 items): `h009, h011, h014, h017, h018, h031, h032, h034, h035, h036, h037`

## Limitations

The benchmark dataset was written with AI assistance and only partly reviewed by the team. Due to the small sample size (N=63 for dev, N=27 for frozen test, N=40 for holdout_v2), confidence intervals are wide. During evaluation development, dev-specific phrases were found in initial rules and replaced by general patterns to avoid overfitting. The `semantic_fallback` mode is a local deterministic heuristics engine, not an actual LLM inference model. No real-LLM benchmark was run unless an API key is configured (currently no external LLM key, `OPENAI_API_KEY` or `GEMINI_API_KEY`, was active, so the evaluation executed using the deterministic fallback engine). On Holdout v2, hard negative disclaimers (e.g. `h031-h037` where banned phrases appear within negation or cautionary advice) remain challenging for exact string rules, highlighting the value of semantic grounding and human review.

## Holdout Provenance & Limitations

- Items in holdout_v2.json were AI-assisted drafts (source: ai_drafted). The agent had read 
ule_engine.py, llm_engine.py, and 
ormalizer.py prior to authoring items; contamination cannot be fully excluded.
- Baseline-code evaluation (commit 6c4234a) used a one-off worktree run; results stored in enchmark/results/holdout_v2_baseline_code.json.
- N=40 holdout items; 95% Wilson CIs are wide — treat point estimates with caution.
- No live-LLM benchmark has been run; semantic_fallback mode uses deterministic heuristics only.
- Do not use holdout_v2.json for rule tuning. It is a held-out evaluation set.
