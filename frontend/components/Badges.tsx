'use client';

import React from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, Clock, 
  CheckCircle2, XCircle, FileEdit 
} from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let Icon = Clock;

  switch (status) {
    case 'Approved':
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60';
      Icon = CheckCircle2;
      break;
    case 'Verified':
    case 'Pending Manager Approval':
      color = 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60';
      Icon = ShieldCheck;
      break;
    case 'Pending Reviewer Verification':
    case 'Resubmitted':
      color = 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60';
      Icon = Clock;
      break;
    case 'Changes Required':
      color = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
      Icon = AlertTriangle;
      break;
    case 'Rejected':
      color = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60';
      Icon = XCircle;
      break;
    case 'AI Review Completed':
      color = 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60';
      Icon = AlertCircle;
      break;
    case 'Draft':
      color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      Icon = FileEdit;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{status}</span>
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  switch (severity) {
    case 'Critical':
      color = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800/80';
      break;
    case 'High':
      color = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800/80';
      break;
    case 'Medium':
      color = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800/80';
      break;
    case 'Low':
      color = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/80';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${color}`}>
      {severity}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence?: number | null }) {
  if (confidence === null || confidence === undefined || isNaN(confidence)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700">
        <span>Confidence:</span>
        <span className="font-semibold">N/A</span>
      </span>
    );
  }
  const pct = Math.round(confidence * 100);
  let tier = 'High Confidence';
  let color = 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/60';

  if (confidence < 0.75) {
    tier = 'Low Confidence';
    color = 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/60';
  } else if (confidence < 0.90) {
    tier = 'Medium Confidence';
    color = 'text-blue-800 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/60 dark:border-blue-800/60';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>
      <span>{tier}</span>
      <span className="font-bold">({pct}%)</span>
    </span>
  );
}

export function ThreatStatusBadge({ status }: { status: string }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  switch (status) {
    case 'New':
      color = 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60';
      break;
    case 'Under Investigation':
      color = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
      break;
    case 'Verified Threat':
      color = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60';
      break;
    case 'False Positive':
      color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      break;
    case 'Resolved':
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
}

export function ThreatRiskBadge({ risk }: { risk: string }) {
  let color = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  switch (risk?.toUpperCase()) {
    case 'CRITICAL':
      color = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800';
      break;
    case 'HIGH':
      color = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
      break;
    case 'MEDIUM':
      color = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      break;
    case 'LOW':
      color = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase tracking-wider ${color}`}>
      {risk}
    </span>
  );
}

