'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Columns,
  FileText,
  History,
  Info,
  Lightbulb,
  Loader2,
  Save,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { api, getCurrentUser } from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuickFinding {
  matched_text: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  suggestion: string;
}

interface QuickCheckResult {
  findings: QuickFinding[];
  violation_count: number;
  severity_counts: { HIGH: number; MEDIUM: number; LOW: number };
}

interface FullFinding {
  id: number;
  category: string;
  severity: string;
  matched_text: string;
  explanation: string;
  suggested_correction?: string;
  status: string;
  engine_source: string;
}

interface FullReview {
  id: number;
  overall_score: number;
  overall_status: string;
  summary: string;
  findings: FullFinding[];
}

interface Revision {
  id: number;
  version: number;
  body: string;
  change_summary: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNELS = [
  'Website/Blog',
  'Social Media',
  'Press Release',
  'Email',
  'Ad Campaign',
  'Email Marketing',
  'Blog Post',
  'Product Page',
  'Internal Communication',
  'Advertisement',
  'Website Copy',
  'Video Script',
];

const TARGET_AUDIENCES = [
  'General Public',
  'B2B Enterprise',
  'Retail Investors',
  'High Net Worth Individuals',
  'SME Business Owners',
  'Financial Advisors',
  'Young Professionals',
  'Existing Customers',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function severityColor(sev: string) {
  const s = sev.toUpperCase();
  if (s === 'HIGH' || s === 'CRITICAL')
    return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60';
  if (s === 'MEDIUM')
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
  return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60';
}

function severityDot(sev: string) {
  const s = sev.toUpperCase();
  if (s === 'HIGH' || s === 'CRITICAL') return 'bg-red-500';
  if (s === 'MEDIUM') return 'bg-amber-500';
  return 'bg-blue-500';
}

/** Wraps occurrences of matchedText in the body with <mark> tags for the preview. */
function buildHighlightedHtml(body: string, findings: QuickFinding[]): string {
  if (!findings.length) return escapeHtml(body).replace(/\n/g, '<br/>');

  // Build an array of char-level severity markers
  const chars = body.split('');
  const marks: (string | null)[] = new Array(chars.length).fill(null);

  for (const f of findings) {
    if (!f.matched_text) continue;
    const escaped = f.matched_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) {
        const prio = f.severity === 'HIGH' ? 3 : f.severity === 'MEDIUM' ? 2 : 1;
        const existing = marks[i];
        const existingPrio = existing === 'HIGH' ? 3 : existing === 'MEDIUM' ? 2 : existing === 'LOW' ? 1 : 0;
        if (prio > existingPrio) marks[i] = f.severity;
      }
    }
  }

  // Build HTML
  let html = '';
  let i = 0;
  while (i < chars.length) {
    if (marks[i]) {
      const sev = marks[i] as string;
      const cls =
        sev === 'HIGH'
          ? 'bg-red-200 dark:bg-red-900/60 rounded'
          : sev === 'MEDIUM'
          ? 'bg-amber-200 dark:bg-amber-900/60 rounded'
          : 'bg-blue-200 dark:bg-blue-900/60 rounded';
      html += `<mark class="${cls} px-0.5">`;
      while (i < chars.length && marks[i] === sev) {
        html += escapeHtml(chars[i]);
        i++;
      }
      html += '</mark>';
    } else {
      if (chars[i] === '\n') html += '<br/>';
      else html += escapeHtml(chars[i]);
      i++;
    }
  }
  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border px-3 py-2.5 pr-10 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-slate-200 dark:border-slate-700 transition"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${severityColor(
        severity
      )}`}
    >
      {severity.toUpperCase() === 'HIGH' || severity.toUpperCase() === 'CRITICAL' ? (
        <AlertCircle className="w-3 h-3" />
      ) : severity.toUpperCase() === 'MEDIUM' ? (
        <AlertTriangle className="w-3 h-3" />
      ) : (
        <Info className="w-3 h-3" />
      )}
      {severity.toUpperCase()}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [body, setBody] = useState('');

  // Content ID (set after first save)
  const [contentId, setContentId] = useState<number | null>(null);

  // Loading states
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [quickChecking, setQuickChecking] = useState(false);

  // Quick-check (debounced rules-only)
  const [quickResult, setQuickResult] = useState<QuickCheckResult | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Full AI analysis result
  const [fullReview, setFullReview] = useState<FullReview | null>(null);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [originalSnapshot, setOriginalSnapshot] = useState('');

  // Version history
  const [historyOpen, setHistoryOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ── Load existing content by ?id= param ───────────────────────────────────
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const numId = parseInt(id, 10);
      setContentId(numId);
      api.getContentById(numId).then((c) => {
        setTitle(c.title || '');
        setChannel(c.channel || '');
        setTargetAudience(c.target_audience || '');
        setBody(c.current_body || '');
        setOriginalSnapshot(c.current_body || '');
      }).catch(() => {});
    }
  }, [searchParams]);

  // ── Debounced quick-check on typing ───────────────────────────────────────
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!body.trim() || body.trim().length < 20) {
      setQuickResult(null);
      return;
    }
    debounceTimer.current = setTimeout(async () => {
      setQuickChecking(true);
      try {
        const result = await api.quickCheck(body);
        setQuickResult(result);
      } catch {
        // silent — don't interrupt typing
      } finally {
        setQuickChecking(false);
      }
    }, 2000);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [body]);

  // ── Save Draft ─────────────────────────────────────────────────────────────
  async function handleSaveDraft() {
    if (!title.trim() || !body.trim()) {
      showToast('Please add a title and content body before saving.', 'error');
      return;
    }
    setSavingDraft(true);
    try {
      if (contentId) {
        await api.reviseContent(contentId, {
          current_body: body,
          change_summary: 'Draft auto-save',
        });
        showToast('Draft updated.', 'success');
      } else {
        const result = await api.submitContent(
          { title, original_body: body, channel: channel || 'Website/Blog', target_audience: targetAudience || 'General Public' },
          false
        );
        setContentId(result.id);
        setOriginalSnapshot(body);
        showToast('Draft saved.', 'success');
        router.replace(`/editor?id=${result.id}`);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save draft.', 'error');
    } finally {
      setSavingDraft(false);
    }
  }

  // ── Full AI Analysis ───────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!body.trim()) {
      showToast('Please enter content to analyse.', 'error');
      return;
    }
    setAnalyzing(true);
    setFullReview(null);
    try {
      // Save/update the content first so we have an ID
      let cid = contentId;
      if (!cid) {
        const result = await api.submitContent(
          { title: title || 'Untitled Draft', original_body: body, channel: channel || 'Website/Blog', target_audience: targetAudience || 'General Public' },
          false
        );
        cid = result.id;
        setContentId(cid);
        setOriginalSnapshot(body);
        router.replace(`/editor?id=${cid}`);
      }
      const review = await api.triggerReview(cid!);
      setFullReview(review);
      showToast('Full AI analysis complete.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Submit for Review ──────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!title.trim() || !channel || !body.trim()) {
      showToast('Title, channel, and content are required to submit.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let cid = contentId;
      if (!cid) {
        const result = await api.submitContent(
          { title, original_body: body, channel, target_audience: targetAudience || 'General Public' },
          true
        );
        cid = result.id;
      } else {
        await api.reviseContent(cid, { current_body: body, change_summary: 'Submitted for review' });
        await api.triggerReview(cid);
      }
      showToast('Content submitted for review.', 'success');
      router.push(`/review/${cid}`);
    } catch (err: any) {
      showToast(err?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Version history ────────────────────────────────────────────────────────
  async function loadHistory() {
    if (!contentId) return;
    setLoadingHistory(true);
    try {
      const revs = await api.getContentRevisions(contentId);
      setRevisions(revs);
    } catch {
      showToast('Could not load revision history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }

  function toggleHistory() {
    if (!historyOpen && contentId) loadHistory();
    setHistoryOpen((v) => !v);
  }

  function restoreRevision(rev: Revision) {
    setBody(rev.body);
    showToast(`Restored to version ${rev.version}.`, 'success');
    setHistoryOpen(false);
  }

  // ── Derived display data ───────────────────────────────────────────────────
  const wordCount = countWords(body);
  const charCount = body.length;
  const isLoading = savingDraft || submitting || analyzing;

  // Violation badge for toolbar
  const violationCount = quickResult?.violation_count ?? 0;
  const highCount = quickResult?.severity_counts.HIGH ?? 0;
  const medCount = quickResult?.severity_counts.MEDIUM ?? 0;

  // Findings to show (prefer full review when available, fall back to quick)
  const displayFindings: Array<{ matched_text: string; category: string; severity: string; explanation: string; suggestion: string }> =
    fullReview
      ? fullReview.findings.map((f) => ({
          matched_text: f.matched_text,
          category: f.category,
          severity: f.severity,
          explanation: f.explanation,
          suggestion: f.suggested_correction || '',
        }))
      : (quickResult?.findings ?? []);

  const highlightedHtml = buildHighlightedHtml(body, quickResult?.findings ?? []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout
      pageTitle="AI Content Editor"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/creator' },
        { label: 'AI Content Editor' },
      ]}
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Content Editor</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time compliance checking as you type
              </p>
            </div>
          </div>

          {/* Violation badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {quickChecking && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking…
              </span>
            )}
            {!quickChecking && violationCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800/60 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                ⚠️ {violationCount} violation{violationCount !== 1 ? 's' : ''}
                {highCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-[10px]">
                    {highCount} HIGH
                  </span>
                )}
              </span>
            )}
            {!quickChecking && violationCount === 0 && body.trim().length >= 20 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> No rule violations
              </span>
            )}
          </div>
        </div>

        {/* ── Main two-column layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* ── Left: Editor (2 cols) ── */}
          <div className="xl:col-span-2 space-y-4">

            {/* Metadata fields */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 space-y-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Investment Newsletter — October 2024"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 border-slate-200 dark:border-slate-700 transition"
                />
              </div>

              {/* Channel + Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  id="channel"
                  label="Channel"
                  value={channel}
                  onChange={setChannel}
                  options={CHANNELS}
                  placeholder="Select channel…"
                  required
                />
                <SelectField
                  id="target_audience"
                  label="Target Audience"
                  value={targetAudience}
                  onChange={setTargetAudience}
                  options={TARGET_AUDIENCES}
                  placeholder="Select audience…"
                />
              </div>
            </div>

            {/* Editor toolbar + textarea */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{wordCount} words / {charCount} chars</span>
                  {quickChecking && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                </div>
                <div className="flex items-center gap-2">
                  {/* Violation severity pills */}
                  {!quickChecking && quickResult && (
                    <div className="flex items-center gap-1.5">
                      {highCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800/60">
                          {highCount} HIGH
                        </span>
                      )}
                      {medCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          {medCount} MED
                        </span>
                      )}
                    </div>
                  )}
                  {/* Compare toggle */}
                  <button
                    onClick={() => setCompareMode((v) => !v)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      compareMode
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title="Toggle side-by-side compare view"
                  >
                    <Columns className="w-3 h-3" />
                    Compare
                  </button>
                </div>
              </div>

              {/* Editor body */}
              <div className={`${compareMode ? 'grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700' : ''}`}>
                {/* Textarea (always left / full) */}
                <div className="relative">
                  <textarea
                    id="content-body"
                    rows={18}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Paste or type your content here. Compliance violations will appear as coloured markers after 2 seconds…"
                    className="w-full px-4 py-3 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none resize-y leading-relaxed font-mono"
                    spellCheck
                  />
                </div>

                {/* Compare: highlighted preview (right) */}
                {compareMode && (
                  <div className="relative">
                    <div className="px-1 py-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 text-center">
                      Highlighted Preview
                    </div>
                    <div
                      className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 leading-relaxed overflow-auto max-h-80"
                      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                {savingDraft ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                {savingDraft ? 'Saving…' : 'Save Draft'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                {analyzing ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Zap className="w-4 h-4 mr-1.5" />}
                {analyzing ? 'Analysing…' : 'Full AI Analysis'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={isLoading}
                className="ml-auto"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </Button>
            </div>

            {/* Full review summary */}
            {fullReview && (
              <div
                className={`rounded-xl border p-4 ${
                  fullReview.overall_score >= 80
                    ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    AI Review Complete
                  </span>
                  <span
                    className={`text-lg font-extrabold ${
                      fullReview.overall_score >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {fullReview.overall_score}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{fullReview.summary}</p>
              </div>
            )}
          </div>

          {/* ── Right: Violations + History (1 col) ── */}
          <div className="xl:col-span-1 space-y-4">

            {/* Real-time violations panel */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {fullReview ? 'AI Findings' : 'Rule Violations'}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {displayFindings.length} issue{displayFindings.length !== 1 ? 's' : ''}
                </span>
              </div>

              {displayFindings.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  {body.trim().length < 20
                    ? 'Start typing to see compliance indicators…'
                    : quickChecking
                    ? 'Checking compliance…'
                    : '✅ No violations detected'}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-[480px] overflow-y-auto">
                  {displayFindings.map((f, i) => (
                    <li key={i} className="px-4 py-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <SeverityBadge severity={f.severity} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                          {f.category.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {f.matched_text && (
                        <div className="flex items-start gap-1.5">
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${severityDot(f.severity)}`}
                          />
                          <code className="text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 line-clamp-2">
                            "{f.matched_text}"
                          </code>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {f.explanation}
                      </p>

                      {f.suggestion && (
                        <div className="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-2.5 py-1.5">
                          <Lightbulb className="w-3 h-3 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{f.suggestion}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Version history panel */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <button
                onClick={toggleHistory}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/40 transition rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  Version History
                </div>
                {historyOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {historyOpen && (
                <div className="border-t border-slate-100 dark:border-slate-700">
                  {!contentId ? (
                    <p className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                      Save a draft first to enable version history.
                    </p>
                  ) : loadingHistory ? (
                    <div className="flex items-center gap-2 px-4 py-4 text-xs text-slate-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                    </div>
                  ) : revisions.length === 0 ? (
                    <p className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                      No revisions yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-72 overflow-y-auto">
                      {revisions.map((rev) => (
                        <li
                          key={rev.id}
                          className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                v{rev.version}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDate(rev.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                              {rev.change_summary}
                            </p>
                          </div>
                          <button
                            onClick={() => restoreRevision(rev)}
                            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                          >
                            Restore
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Severity Legend
              </p>
              <div className="space-y-1.5">
                {[
                  { sev: 'HIGH', label: 'Critical / High — Immediate action needed', dot: 'bg-red-500' },
                  { sev: 'MEDIUM', label: 'Medium — Should be reviewed', dot: 'bg-amber-500' },
                  { sev: 'LOW', label: 'Low — Minor or advisory', dot: 'bg-blue-500' },
                ].map(({ sev, label, dot }) => (
                  <div key={sev} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
