"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { apiClient } from "@/lib/api";

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

function pct(v?: number) {
  if (v === undefined || v === null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function ci(pair?: [number, number]) {
  if (!pair) return "";
  return ` [${pct(pair[0])}, ${pct(pair[1])}]`;
}

function MetricsRow({ label, m }: { label: string; m?: ModeMetrics }) {
  if (!m) return <tr><td colSpan={6} className="text-muted-foreground px-3 py-1 text-sm italic">No data</td></tr>;
  return (
    <tr className="border-t">
      <td className="px-3 py-2 font-medium text-sm">{label}</td>
      <td className="px-3 py-2 text-sm tabular-nums">{pct(m.precision)}{ci(m.precision_wilson_95)}</td>
      <td className="px-3 py-2 text-sm tabular-nums">{pct(m.recall)}{ci(m.recall_wilson_95)}</td>
      <td className="px-3 py-2 text-sm tabular-nums">{pct(m.fpr)}</td>
      <td className="px-3 py-2 text-sm tabular-nums">{pct(m.fnr)}</td>
      <td className="px-3 py-2 text-sm tabular-nums text-muted-foreground">
        TP={m.tp} FP={m.fp} TN={m.tn} FN={m.fn}
      </td>
    </tr>
  );
}

function ModeCard({ title, badge, data }: { title: string; badge: string; data?: ModeResult }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {title}
          <Badge variant="outline" className="text-xs">{badge}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2 text-left font-medium text-xs">View</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Precision (95% CI)</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Recall (95% CI)</th>
                <th className="px-3 py-2 text-left font-medium text-xs">FPR</th>
                <th className="px-3 py-2 text-left font-medium text-xs">FNR</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Counts</th>
              </tr>
            </thead>
            <tbody>
              <MetricsRow label="Confirmed" m={data?.confirmed?.all} />
              <MetricsRow label="Surfaced" m={data?.surfaced?.all} />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BenchmarkPage() {
  const [data, setData] = useState<BenchmarkResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/analytics/benchmark")
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((e) => { setError(e.message || "Failed to load"); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Benchmark Results</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Precision / Recall / FPR / FNR on the frozen test split.
          Results loaded from <code>benchmark/results/final_test.json</code> — no live rerun.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive border border-destructive/30 rounded p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {data?.error && (
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700 rounded p-3 bg-yellow-50 dark:bg-yellow-950">
          <Info className="h-4 w-4 shrink-0" />
          <span className="text-sm">{data.error}</span>
        </div>
      )}

      {data && !data.error && (
        <>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {data.split && <span>Split: <strong className="text-foreground">{data.split}</strong></span>}
            {data.total_items && <span>N: <strong className="text-foreground">{data.total_items}</strong></span>}
            {data.git_commit && <span>Commit: <code className="text-xs">{data.git_commit.slice(0, 8)}</code></span>}
          </div>

          <div className="space-y-4">
            <ModeCard title="Rules Only" badge="Deterministic" data={data.modes?.rules_only} />
            <ModeCard title="Semantic Fallback" badge="Heuristic (not LLM)" data={data.modes?.semantic_fallback} />
            <ModeCard title="Combined" badge="Rules + Heuristic" data={data.modes?.combined} />
          </div>

          <div className="rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
            <div className="flex gap-2 items-start">
              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <p className="font-medium">Limitations</p>
                <ul className="list-disc pl-4 space-y-0.5 text-xs">
                  <li>Dataset was written with AI assistance and only partly reviewed by the team.</li>
                  <li>Small N — confidence intervals are wide; treat point estimates as indicative only.</li>
                  <li>&ldquo;Semantic Fallback&rdquo; is a deterministic heuristic engine, not a live LLM call.</li>
                  <li>No real-LLM benchmark was run; configure <code>OPENAI_API_KEY</code> or <code>GEMINI_API_KEY</code> to enable AI mode.</li>
                  <li>Dev-specific phrases were found in rules during tuning and replaced with general patterns.</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
