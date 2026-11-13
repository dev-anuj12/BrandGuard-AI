'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, ArrowLeft, Sparkles, 
  RefreshCw, Check, X, Edit3, History, BookOpen, Search, Send, FileCheck,
  Download, UserCheck, CheckSquare, MessageSquare
} from 'lucide-react';
import AppLayout from '../../../components/AppLayout';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';
import { StatusBadge, SeverityBadge, ConfidenceBadge } from '../../../components/Badges';
import { Badge } from '../../../components/ui/Badge';
import { CardSkeleton } from '../../../components/ui/Skeleton';
import { api, getCurrentUser } from '../../../lib/api';

export default function AIReviewResultsPage({ params }: { params: { id: string } }) {
  const contentId = params.id;
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [review, setReview] = useState<any>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [manualText, setManualText] = useState<Record<number, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [govComments, setGovComments] = useState('');
  const [govLoading, setGovLoading] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cData, rData, revsData, decsData] = await Promise.all([
        api.getContentById(contentId),
        api.getLatestReview(contentId).catch(() => null),
        api.getContentRevisions(contentId).catch(() => []),
        api.getContentDecisions(contentId).catch(() => []),
      ]);
      setContent(cData);
      setReview(rData);
      setRevisions(revsData);
      setDecisions(decsData || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load review data', 'error');
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
    try {
      await api.handleSuggestion(suggestionId, action, customText);
      showToast(
        `Suggestion ${action === 'accept' ? 'accepted and applied' : action === 'reject' ? 'rejected' : 'custom edited'}.`,
        'success'
      );
      setEditingId(null);
      await loadAll();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      await api.reviseContent(contentId, {
        current_body: content.current_body,
        change_summary: `Revision applied with AI corrections by ${user?.full_name}`
      });
      showToast('New revision saved and re-audited successfully!', 'success');
      await loadAll();
    } catch (err: any) {
      showToast(err.message || 'Resubmission failed', 'error');
    } finally {
      setResubmitting(false);
    }
  };

  const handleDownloadAuditCSV = async () => {
    setDownloadingCSV(true);
    try {
      const csvText = await api.exportContentAuditCsv(contentId);
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `brandguard_audit_content_${contentId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Audit CSV report downloaded successfully.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to download audit CSV', 'error');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const handleReviewerAction = async (action: 'verify' | 'request_changes') => {
    if (action === 'request_changes' && govComments.trim().length < 10) {
      showToast('Minimum 10 characters comment required to request changes.', 'error');
      return;
    }
    setGovLoading(action);
    try {
      await api.verifyContent(contentId, { action, comments: govComments });
      showToast(action === 'verify' ? 'Content verified by reviewer.' : 'Change request submitted.', 'success');
      setGovComments('');
      await loadAll();
    } catch (err: any) {
      showToast(err?.message || 'Reviewer action failed.', 'error');
    } finally {
      setGovLoading(null);
    }
  };

  const handleManagerAction = async (action: 'Approved' | 'Rejected' | 'Changes Requested') => {
    if ((action === 'Rejected' || action === 'Changes Requested') && govComments.trim().length < 10) {
      showToast('Minimum 10 characters decision reason required.', 'error');
      return;
    }
    setGovLoading(action);
    try {
      await api.managerDecision(contentId, { action, comments: govComments });
      showToast(`Manager decision '${action}' recorded successfully.`, 'success');
      setGovComments('');
      await loadAll();
    } catch (err: any) {
      showToast(err?.message || 'Manager decision failed.', 'error');
    } finally {
      setGovLoading(null);
    }
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Compliance Review" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/creator' }, { label: 'Review' }]}>
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <CardSkeleton />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <CardSkeleton />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!content || !review) {
    return (
      <AppLayout pageTitle="Review Not Found" breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/creator' }, { label: 'Review' }]}>
        <div className="py-16 text-center text-slate-500 space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review Not Available</h2>
          <p className="text-xs text-slate-500">No review results found for this content submission.</p>
          <Link href="/dashboard/creator">
            <Button size="sm" variant="outline">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const score = review.overall_score || 0;
  const isPassing = score >= 80;

  return (
    <AppLayout 
      pageTitle={`Review: ${content.title}`} 
      breadcrumbs={[
        { label: 'Submissions', href: '/approvals' },
        { label: `#${content.id}` },
        { label: 'AI Review' }
      ]}
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Submission #{content.id}</span>
                <StatusBadge status={content.status} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  v{revisions.length}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                {content.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAuditCSV}
              isLoading={downloadingCSV}
              leftIcon={<Download className="w-3.5 h-3.5 text-indigo-500" />}
            >
              Export CSV Report
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadAll}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={handleResubmit}
              isLoading={resubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              {`Save & Submit v${revisions.length + 1}`}
            </Button>
          </div>
        </div>

        {/* Compliance Score Gauge & Executive Summary */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-sm">
          <div className="text-center md:border-r border-slate-200 dark:border-slate-700 pr-4">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              Brand Compliance Score
            </span>
            <div
              className={`text-5xl font-black tracking-tight mt-2 ${
                score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'
              }`}
            >
              {score}%
            </div>
            <span
              className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isPassing
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {isPassing ? 'Passing Standard' : 'Changes Mandated'}
            </span>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Executive Audit Summary</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {review.summary || 'Content audited against brand guidelines, banned expression databases, and regulatory disclosures.'}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400 font-mono">
              <span>Violations Detected: <strong className="text-slate-700 dark:text-white">{review.findings?.length || 0}</strong></span>
              <span>•</span>
              <span>Auditor Engine: <strong className="text-slate-700 dark:text-slate-200">{review.provider}</strong></span>
              <span>•</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                review.analysis_mode === 'ai'
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : review.analysis_mode === 'combined'
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                {review.analysis_mode === 'ai' ? '🤖 AI Mode' : review.analysis_mode === 'combined' ? '⚡ Combined' : '📋 Rules Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Human-Controlled Governance Decision Panel (Reviewer & Manager Roles) */}
        {(user?.role === 'REVIEWER' || user?.role === 'MANAGER') && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/60 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Human Governance Gate — {user.role === 'REVIEWER' ? 'Reviewer Verification' : 'Manager Final Sign-off'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Current Status: <strong className="text-slate-800 dark:text-slate-200">{content.status}</strong>
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Decision Notes / Rationale{' '}
                <span className="text-amber-600 dark:text-amber-400 font-normal">
                  (min 10 characters required for change requests &amp; rejections)
                </span>
              </label>
              <textarea
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder={
                  user.role === 'REVIEWER'
                    ? 'Provide compliance verification comments or specific feedback for changes requested…'
                    : 'Provide formal managerial justification for final approval, changes requested, or rejection…'
                }
                value={govComments}
                onChange={(e) => setGovComments(e.target.value)}
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {user.role === 'REVIEWER' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleReviewerAction('verify')}
                      isLoading={govLoading === 'verify'}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Verify Content
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReviewerAction('request_changes')}
                      isLoading={govLoading === 'request_changes'}
                      leftIcon={<X className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Request Changes
                    </Button>
                  </>
                )}

                {user.role === 'MANAGER' && (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleManagerAction('Approved')}
                      isLoading={govLoading === 'Approved'}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve &amp; Sign-Off
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManagerAction('Changes Requested')}
                      isLoading={govLoading === 'Changes Requested'}
                      leftIcon={<Edit3 className="w-3.5 h-3.5 text-amber-500" />}
                    >
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManagerAction('Rejected')}
                      isLoading={govLoading === 'Rejected'}
                      leftIcon={<X className="w-3.5 h-3.5 text-rose-500" />}
                    >
                      Reject Submission
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Review Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Copy & Revisions */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Campaign Copy
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                Audience: {content.target_audience}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono space-y-3 shadow-inner">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                <strong>Channel:</strong> {content.channel}
              </div>
              <div className="whitespace-pre-wrap">{content.current_body}</div>
            </div>

            {/* Revisions History */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <History className="w-4 h-4 text-indigo-500" />
                <span>Revision Audit Trail ({revisions.length} versions)</span>
              </div>
              <div className="space-y-2 text-xs">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-600 dark:text-slate-400"
                  >
                    <div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">v{rev.version}</span>
                      <span className="text-slate-500 ml-2">({rev.change_summary || 'Draft'})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision History */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span>Decision History ({decisions.length} events)</span>
              </div>
              <div className="space-y-2 text-xs">
                {decisions.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No workflow decision records yet.</p>
                ) : (
                  decisions.map((dec) => (
                    <div
                      key={dec.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {dec.action}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(dec.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                          {new Date(dec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {(dec.previous_status || dec.new_status) && (
                        <div className="text-[10px] font-mono flex items-center gap-1.5 text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {dec.previous_status || 'Draft'}
                          </span>
                          <span>&rarr;</span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold">
                            {dec.new_status || dec.action}
                          </span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{dec.actor_name} {dec.role ? `(${dec.role})` : ''}</span>
                        {dec.revision_id && <span className="font-mono text-[10px]">rev #{dec.revision_id}</span>}
                      </div>
                      {dec.reason && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                          {dec.reason}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Findings & Remediations */}
          <div className="lg:col-span-7 space-y-6">
            {(() => {
              const groundedFindings = (review.findings || []).filter((f: any) => f.grounding_status !== 'NEEDS_HUMAN_REVIEW');
              const needsReviewFindings = (review.findings || []).filter((f: any) => f.grounding_status === 'NEEDS_HUMAN_REVIEW');

              return (
                <>
                  {/* Confirmed Grounded Findings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-emerald-500" />
                        <span>Confirmed Grounded Findings ({groundedFindings.length})</span>
                      </h2>
                      <span className="text-xs text-slate-400">
                        {groundedFindings.length} Verified Issue(s)
                      </span>
                    </div>

                    {groundedFindings.length === 0 ? (
                      <div className="p-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">No Confirmed Violations</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">All content statements adhere to grounded brand rules.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groundedFindings.map((f: any, idx: number) => {
                          const suggestion = f.suggestions?.[0];
                          const suggestedCorrectionText = suggestion?.suggested_text || f.suggested_correction;
                          const isResolved = f.status === 'Resolved' || suggestion?.status === 'Accepted';
                          const isOverridden = f.status === 'Overridden' || suggestion?.status === 'Rejected';
                          const isAIEngine = f.engine_source?.toLowerCase().includes('llm') || f.engine_source?.toLowerCase().includes('ai');

                          return (
                            <div
                              key={f.id || idx}
                              className={`p-4 rounded-xl border transition-all space-y-3 ${
                                isResolved
                                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                                  : isOverridden
                                  ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
                              }`}
                            >
                              {/* Finding Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">{f.category}</span>
                                  <SeverityBadge severity={f.severity} />
                                  <Badge variant="success" size="sm">Grounded</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ConfidenceBadge confidence={f.confidence} />
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                    isAIEngine
                                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                  }`}>
                                    {isAIEngine ? '🤖 LLM Engine' : '📋 Rule Engine'}
                                  </span>
                                </div>
                              </div>

                              {/* Matched Snippet */}
                              <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 text-xs">
                                <span className="text-rose-600 dark:text-rose-400 block mb-0.5 font-semibold uppercase text-[10px]">
                                  Exact Flagged Text:
                                </span>
                                <span className="font-mono font-bold text-rose-700 dark:text-rose-300 text-sm">
                                  &quot;{f.matched_text}&quot;
                                </span>
                              </div>

                              {/* Explanation & Guideline Reference */}
                              <div className="space-y-1.5 text-xs">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                  <strong className="text-slate-700 dark:text-slate-200">Reason: </strong>
                                  {f.explanation}
                                </p>
                                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                  <span>Policy Reference: {f.guideline_reference || f.category || 'Brand Governance Standard'}</span>
                                </div>
                              </div>

                              {/* Source Evidence */}
                              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                                <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <Search className="w-3 h-3 text-blue-500" />
                                  <span>Supporting Evidence:</span>
                                </span>
                                {f.evidence && f.evidence.length > 0 ? (
                                  f.evidence.map((ev: any, evIdx: number) => (
                                    <div key={evIdx} className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                                      • {typeof ev === 'string' ? ev : `${ev.source || ev.rule || 'Evidence'}: ${ev.text || ev.note || ev.requirement || ''}`}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-400 dark:text-slate-500 text-[10px] italic">
                                    Direct pattern rule match; no external citation database entry required.
                                  </div>
                                )}
                              </div>

                              {/* Suggested Correction */}
                              {suggestedCorrectionText && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2.5">
                                  <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                                      {isAIEngine ? 'AI Suggested Correction:' : 'Recommended Correction:'}
                                    </span>
                                    <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold block text-sm">
                                      &quot;{suggestedCorrectionText}&quot;
                                    </span>
                                  </div>

                                  {isResolved && (
                                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Accepted and applied to current copy</span>
                                    </div>
                                  )}
                                  {isOverridden && (
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                      <X className="w-3.5 h-3.5" />
                                      <span>Rejected/Overridden</span>
                                    </div>
                                  )}

                                  {!isResolved && !isOverridden && suggestion && (
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleSuggestion(suggestion.id, 'accept')}
                                        loading={actionLoading === suggestion.id}
                                      >
                                        <Check className="w-3.5 h-3.5 mr-1" />
                                        Accept Suggestion
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSuggestion(suggestion.id, 'reject')}
                                        loading={actionLoading === suggestion.id}
                                      >
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        Reject
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditingId(editingId === suggestion.id ? null : suggestion.id)}
                                      >
                                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                                        Custom Edit
                                      </Button>
                                    </div>
                                  )}

                                  {editingId === suggestion.id && (
                                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                                      <textarea
                                        className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        rows={2}
                                        value={manualText[suggestion.id] ?? suggestion.suggested_text}
                                        onChange={(e) => setManualText({ ...manualText, [suggestion.id]: e.target.value })}
                                      />
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleSuggestion(suggestion.id, 'manual', manualText[suggestion.id] ?? suggestion.suggested_text)}
                                        loading={actionLoading === suggestion.id}
                                      >
                                        Apply Custom Fix
                                      </Button>
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

                  {/* Separate Section: Needs Human Review */}
                  {needsReviewFindings.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>Needs Human Review ({needsReviewFindings.length})</span>
                        </h2>
                        <span className="text-xs text-amber-500 font-medium">Ungrounded / Unverified Evidence</span>
                      </div>

                      <div className="space-y-4">
                        {needsReviewFindings.map((f: any, idx: number) => {
                          const evidenceState = f.evidence_state || 'unverified_source';
                          const isAIEngine = f.engine_source?.toLowerCase().includes('llm') || f.engine_source?.toLowerCase().includes('ai');
                          const badgeVariant =
                            evidenceState === 'verified'
                              ? 'success'
                              : evidenceState === 'missing_citation' || evidenceState === 'unsupported_claim'
                              ? 'danger'
                              : 'warning';

                          return (
                            <div
                              key={`needs-review-${f.id || idx}`}
                              className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/10 space-y-3 shadow-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 dark:border-amber-900/40 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">{f.category}</span>
                                  <SeverityBadge severity={f.severity} />
                                  <Badge variant={badgeVariant} size="sm">
                                    Evidence: {evidenceState}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ConfidenceBadge confidence={f.confidence} />
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                    isAIEngine
                                      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                  }`}>
                                    {isAIEngine ? '🤖 LLM Engine' : '📋 Rule Engine'}
                                  </span>
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                <span className="text-slate-500 block mb-0.5 font-semibold uppercase text-[10px]">
                                  Candidate Text Flagged for Review:
                                </span>
                                <span className="font-mono text-slate-700 dark:text-slate-300 text-sm">
                                  &quot;{f.matched_text}&quot;
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                <strong className="text-slate-700 dark:text-slate-200">Reason: </strong>
                                {f.explanation}
                              </p>

                              {f.guideline_reference && (
                                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                  <span>Policy Reference: {f.guideline_reference}</span>
                                </div>
                              )}

                              {f.grounding_reasons && (
                                <div className="p-2 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium">
                                  <strong>Grounding Status:</strong> {f.grounding_reasons}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
