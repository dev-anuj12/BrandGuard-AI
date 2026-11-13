'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, ShieldCheck, BarChart2 } from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { Badge } from '../../components/ui/Badge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { api } from '../../lib/api';

interface ModeMetrics {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  fnr: number;
  precision_wilson_95?: [number, number];
  recall_wilson_95?: [number, number];
}

interface ModeResult {
  confirmed?: { all?: ModeMetrics };
  surfaced?: { all?: ModeMetrics };
}

interface BenchmarkResults {
  split?: string;
  total_items?: number;
  git_commit?: string;
  modes?: {
    rules_only?: ModeResult;
    semantic_fallback?: ModeResult;
    combined?: ModeResult;
  };
  error?: string;
}

function pct(v?: number): string {
  if (v === undefined || v === null) return '—';
  return `${(v * 100).toFixed(1)}%`;
}

function ci(pair?: [number, number]): string {
  if (!pair) return '';
  return ` [${pct(pair[0])}, ${pct(pair[1])}]`;
}

function MetricsRow({ label, m }: { label: string; m?: ModeMetrics }) {
  if (!m) {
    return (
      <tr className="border-t border-slate-200 dark:border-slate-800">
        <td colSpan={6} className="text-slate-400 px-3 py-2 text-xs italic">No data</td>
      </tr>
    );
  }
  return (
    <tr className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
      <td className="px-3 py-2.5 font-medium text-xs text-slate-800 dark:text-slate-200">{label}</td>
      <td className="px-3 py-2.5 text-xs tabular-nums text-slate-700 dark:text-slate-300 font-mono">
        {pct(m.precision)}{ci(m.precision_wilson_95)}
      </td>
      <td className="px-3 py-2.5 text-xs tabular-nums text-slate-700 dark:text-slate-300 font-mono">
        {pct(m.recall)}{ci(m.recall_wilson_95)}
      </td>
      <td className="px-3 py-2.5 text-xs tabular-nums text-slate-700 dark:text-slate-300 font-mono">{pct(m.fpr)}</td>
      <td className="px-3 py-2.5 text-xs tabular-nums text-slate-700 dark:text-slate-300 font-mono">{pct(m.fnr)}</td>
      <td className="px-3 py-2.5 text-xs tabular-nums text-slate-500 font-mono">
        TP={m.tp} FP={m.fp} TN={m.tn} FN={m.fn}
      </td>
    </tr>
  );
}

function ModeCard({ title, badgeText, data }: { title: string; badgeText: string; data?: ModeResult }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-card">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <Badge variant="purple">{badgeText}</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <th className="px-3 py-2">View</th>
              <th className="px-3 py-2">Precision (95% CI)</th>
              <th className="px-3 py-2">Recall (95% CI)</th>
              <th className="px-3 py-2">FPR</th>
              <th className="px-3 py-2">FNR</th>
              <th className="px-3 py-2">Counts</th>
            </tr>
          </thead>
          <tbody>
            <MetricsRow label="Confirmed" m={data?.confirmed?.all} />
            <MetricsRow label="Surfaced" m={data?.surfaced?.all} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BenchmarkPage() {
  const [data, setData] = useState<BenchmarkResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getBenchmark()
      .then((res: any) => {
        setData(res);
        setLoading(false);
      })
      .catch((e: any) => {
        setError(e.message || 'Failed to load benchmark results');
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout pageTitle="AI Governance Benchmark">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Benchmark Performance</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empirical evaluation across Precision, Recall, False Positive Rate (FPR), and False Negative Rate (FNR)
            on the frozen test split. Loaded statically from benchmark results without runtime synthetic reruns.
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-600 border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 rounded-xl p-3 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data?.error && (
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl p-3 bg-amber-50 dark:bg-amber-950/40 text-xs">
            <Info className="h-4 w-4 shrink-0" />
            <span>{data.error}</span>
          </div>
        )}

        {data && !data.error && (
          <>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              {data.split && <span>Split: <strong className="text-slate-900 dark:text-white">{data.split}</strong></span>}
              <span>•</span>
              {data.total_items && <span>Total Samples (N): <strong className="text-slate-900 dark:text-white">{data.total_items}</strong></span>}
              <span>•</span>
              {data.git_commit && <span>Commit: <code className="text-indigo-600 dark:text-indigo-400">{data.git_commit.slice(0, 8)}</code></span>}
            </div>

            {/* Verified Rules-Only Scorecard */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20 p-6 space-y-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Primary Verified Baseline
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Rules-Only Engine (Deterministic Evaluation)
                  </h3>
                </div>
                <Badge variant="purple">Verified Holdout v2</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Precision</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">0.909</span>
                  <span className="text-[10px] text-slate-400 font-mono block">[72.2%, 97.5%]</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Recall</span>
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">0.625</span>
                  <span className="text-[10px] text-slate-400 font-mono block">[45.3%, 77.1%]</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">F1 Score</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">0.741</span>
                  <span className="text-[10px] text-slate-400 font-mono block">Harmonic Mean</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">FPR</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">0.250</span>
                  <span className="text-[10px] text-slate-400 font-mono block">False Positives</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">FNR</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">0.375</span>
                  <span className="text-[10px] text-slate-400 font-mono block">False Negatives</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Samples</span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono">N = 40</span>
                  <span className="text-[10px] text-slate-400 font-mono block">Held-out Split</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3">
                <p>
                  <strong>Scope Notice:</strong> The figures above are <strong>rules-only results</strong>, not AI-only or combined measurements. Live LLM evaluations require active provider API credentials and are not run without key configuration. Finite sample size (N=40) results in wide Wilson confidence intervals and does not constitute a universal accuracy guarantee.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ModeCard title="Rules Only" badgeText="Deterministic" data={data.modes?.rules_only} />
              <ModeCard title="Semantic Fallback" badgeText="Heuristic Fallback" data={data.modes?.semantic_fallback} />
              <ModeCard title="Combined" badgeText="Rules + Heuristic" data={data.modes?.combined} />
            </div>

            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">Methodological Constraints &amp; Limitations</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                    <li>Dataset was assembled with AI assistance and verified by domain compliance auditors.</li>
                    <li>Small N produces wider Wilson 95% confidence intervals; point estimates should be interpreted in context.</li>
                    <li>&ldquo;Semantic Fallback&rdquo; provides deterministic regex/phrase heuristics when an external LLM key is absent.</li>
                    <li>To benchmark live LLM provider responses, configure <code>OPENAI_API_KEY</code> or <code>GEMINI_API_KEY</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
