'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, ArrowLeft, Sparkles, 
  RefreshCw, Check, X, Edit3, History, BookOpen, Search, Send
} from 'lucide-react';
import { api, getCurrentUser } from '../../../lib/api';
import { StatusBadge, SeverityBadge, ConfidenceBadge } from '../../../components/Badges';

export default function AIReviewResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const contentId = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [manualText, setManualText] = useState<Record<number, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cData, rData, revsData] = await Promise.all([
        api.getContentById(contentId),
        api.getLatestReview(contentId),
        api.getContentRevisions(contentId)
      ]);
      setContent(cData);
      setReview(rData);
      setRevisions(revsData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const curUser = getCurrentUser();
    if (!curUser) {
      router.push('/login');
      return;
    }
    setUser(curUser);
    loadAll();
  }, [contentId, router]);

  const handleSuggestion = async (
    suggestionId: number,
    action: 'accept' | 'reject' | 'manual',
    customText?: string
  ) => {
    setActionLoading(suggestionId);
    setMessage(null);
    try {
      await api.handleSuggestion(suggestionId, action, customText);
      setMessage({
        type: 'success',
        text: `Suggestion ${action === 'accept' ? 'accepted and applied to text' : action === 'reject' ? 'rejected / overridden' : 'manually applied'}.`
      });
      setEditingId(null);
      await loadAll();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResubmit = async () => {
    setResubmitting(true);
    setMessage(null);
    try {
      await api.reviseContent(contentId, {
        current_body: content.current_body,
        change_summary: `Revision applied with AI corrections by ${user?.full_name}`
      });
      setMessage({
        type: 'success',
        text: 'New revision saved and re-audited by BrandGuard AI successfully!'
      });
      await loadAll();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Resubmission failed.' });
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading AI Compliance Review...</p>
      </div>
    );
  }

  if (!content || !review) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Review Not Available</h2>
        <p className="text-xs text-slate-400">No review results found for this content submission.</p>
        <Link href="/dashboard/creator" className="text-xs text-indigo-400 font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const score = review.overall_score || 0;
  const isPassing = score >= 80;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/creator"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Submission #{content.id}</span>
              <StatusBadge status={content.status} />
              <span className="text-xs text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                v{revisions.length}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {content.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh review"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleResubmit}
            disabled={resubmitting}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{resubmitting ? 'Saving Revision...' : 'Save & Submit Revised v' + (revisions.length + 1)}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950 border border-rose-800 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Compliance Score Gauge & Executive Summary */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-xl">
        <div className="text-center md:border-r border-slate-800 pr-4">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Brand Compliance Score
          </span>
          <div
            className={`text-5xl font-black tracking-tight mt-2 ${
              score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {score}%
          </div>
          <span
            className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isPassing
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}
          >
            {isPassing ? 'Passing Standard' : 'Changes Mandated'}
          </span>
        </div>

        <div className="md:col-span-3 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">AI Executive Audit Summary</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {review.summary || 'Content audited against FinNova regulatory framework and brand voice rules.'}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-mono">
            <span>Violations Detected: <strong className="text-white">{review.findings?.length || 0}</strong></span>
            <span>•</span>
            <span>Auditor Pipeline: <strong className="text-slate-200">{review.provider}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Review Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Content Body Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Current Campaign Copy
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Audience: {content.target_audience}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono space-y-4 shadow-inner">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              <strong>Channel:</strong> {content.channel}
            </div>
            <div className="whitespace-pre-wrap">{content.current_body}</div>
          </div>

          {/* Revisions History Accordion */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Revision Audit Trail ({revisions.length} versions)</span>
            </div>
            <div className="space-y-2 text-xs">
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-400"
                >
                  <div>
                    <span className="font-bold text-indigo-300">v{rev.version}</span>
                    <span className="text-slate-500 ml-2">({rev.change_summary || 'Draft'})</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Findings & One-Click Corrections */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Explainable AI Findings &amp; Grounding Evidence</span>
            </h2>
            <span className="text-xs text-slate-500">
              {review.findings?.length || 0} Issue(s)
            </span>
          </div>

          {review.findings?.length === 0 ? (
            <div className="p-12 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-emerald-300 text-sm">Perfect Compliance</h3>
              <p className="text-xs text-slate-400">No violations detected against FinNova brand guidelines.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {review.findings.map((f: any, idx: number) => {
                const suggestion = f.suggestions?.[0];
                const isResolved = f.status === 'Resolved' || suggestion?.status === 'Accepted';
                const isOverridden = f.status === 'Overridden' || suggestion?.status === 'Rejected';

                return (
                  <div
                    key={f.id || idx}
                    className={`p-5 rounded-2xl border transition-all space-y-4 ${
                      isResolved
                        ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                        : isOverridden
                        ? 'bg-slate-900/40 border-slate-800'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg'
                    }`}
                  >
                    {/* Finding Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{f.category}</span>
                        <SeverityBadge severity={f.severity} />
                      </div>
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge confidence={f.confidence} />
                        <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-950">
                          {f.engine_source}
                        </span>
                      </div>
                    </div>

                    {/* Matched Snippet */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="text-slate-500 block mb-1 font-semibold uppercase text-[10px]">
                        Problematic Text Detected:
                      </span>
                      <span className="font-mono font-bold text-rose-300 text-sm">
                        &quot;{f.matched_text}&quot;
                      </span>
                    </div>

                    {/* Explanation & Guideline Reference */}
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300 leading-relaxed">{f.explanation}</p>
                      {f.guideline_reference && (
                        <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span>Policy Reference: {f.guideline_reference}</span>
                        </div>
                      )}
                    </div>

                    {/* Source Evidence */}
                    {f.evidence && f.evidence.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                        <span className="font-semibold text-slate-400 flex items-center gap-1">
                          <Search className="w-3 h-3 text-blue-400" />
                          <span>Supporting Source Grounding:</span>
                        </span>
                        {f.evidence.map((ev: any, evIdx: number) => (
                          <div key={evIdx} className="text-slate-400 font-mono">
                            • {typeof ev === 'string' ? ev : `${ev.source || ev.rule || 'Evidence'}: ${ev.text || ev.note || ev.requirement || ''}`}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Correction & Action Controls */}
                    {suggestion && (
                      <div className="pt-2 border-t border-slate-800 space-y-3">
                        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/60 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                            AI Suggested Correction:
                          </span>
                          <span className="font-mono text-emerald-300 font-bold block text-sm">
                            &quot;{suggestion.suggested_text}&quot;
                          </span>
                        </div>

                        {/* Status tag if already handled */}
                        {isResolved && (
                          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accepted and applied to current copy</span>
                          </div>
                        )}

                        {isOverridden && (
                          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            <span>Suggestion rejected (manual override)</span>
                          </div>
                        )}

                        {/* Action buttons if pending */}
                        {!isResolved && !isOverridden && (
                          <div className="space-y-3">
                            {editingId === suggestion.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={manualText[suggestion.id] ?? suggestion.suggested_text}
                                  onChange={(e) =>
                                    setManualText({ ...manualText, [suggestion.id]: e.target.value })
                                  }
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                                  placeholder="Type custom text..."
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleSuggestion(
                                        suggestion.id,
                                        'manual',
                                        manualText[suggestion.id] ?? suggestion.suggested_text
                                      )
                                    }
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white"
                                  >
                                    Apply Custom Edit
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => handleSuggestion(suggestion.id, 'accept')}
                                  disabled={actionLoading === suggestion.id}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Accept Suggestion</span>
                                </button>

                                <button
                                  onClick={() => handleSuggestion(suggestion.id, 'reject')}
                                  disabled={actionLoading === suggestion.id}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>

                                <button
                                  onClick={() => setEditingId(suggestion.id)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Manually</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
