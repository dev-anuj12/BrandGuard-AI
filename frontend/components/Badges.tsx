import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Clock;

  switch (status) {
    case 'Approved':
      color = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      Icon = CheckCircle2;
      break;
    case 'Verified':
    case 'Pending Manager Approval':
      color = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      Icon = ShieldCheck;
      break;
    case 'Pending Reviewer Verification':
    case 'Resubmitted':
      color = 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
      Icon = Clock;
      break;
    case 'Changes Required':
      color = 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      Icon = AlertTriangle;
      break;
    case 'Rejected':
      color = 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      Icon = XCircle;
      break;
    case 'AI Review Completed':
      color = 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      Icon = AlertCircle;
      break;
    default:
      color = 'bg-slate-900 text-slate-300 border-slate-800';
      Icon = Clock;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{status}</span>
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (severity) {
    case 'Critical':
      color = 'bg-rose-950 text-rose-300 border-rose-800/80 animate-pulse';
      break;
    case 'High':
      color = 'bg-amber-950 text-amber-300 border-amber-800/80';
      break;
    case 'Medium':
      color = 'bg-blue-950 text-blue-300 border-blue-800/80';
      break;
    case 'Low':
      color = 'bg-emerald-950 text-emerald-300 border-emerald-800/80';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${color}`}>
      {severity}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  let tier = 'High Confidence';
  let color = 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50';

  if (confidence < 0.75) {
    tier = 'Low Confidence';
    color = 'text-amber-400 bg-amber-950/50 border-amber-800/50';
  } else if (confidence < 0.90) {
    tier = 'Medium Confidence';
    color = 'text-blue-400 bg-blue-950/50 border-blue-800/50';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>
      <span>{tier}</span>
      <span className="font-bold">({pct}%)</span>
    </span>
  );
}
