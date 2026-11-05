'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  RefreshCw,
  FileText,
  Eye,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Filter,
  Award,
} from 'lucide-react';

import AppLayout from '../../../components/AppLayout';
import { Button } from '../../../components/ui/Button';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/Modal';
import { StatusBadge, SeverityBadge } from '../../../components/Badges';
import { useToast } from '../../../components/ui/Toast';
import { api, getCurrentUser } from '../../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContentItem {
  id: string;
  title: string;
  status: string;
  channel?: string;
  compliance_score?: number | null;
  created_at?: string;
  submitted_at?: string;
  severity?: string;
  [key: string]: unknown;
}

type FilterTab = 'all' | 'pending' | 'verified' | 'decided';

type DecisionAction = 'Approved' | 'Changes Requested' | 'Rejected';

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}

function KpiCard({ label, value, icon, colorClass, bgClass }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex items-center gap-4 shadow-sm">
      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${bgClass}`}>
        <span className={colorClass}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function scoreColor(score?: number | null): string {
  if (score == null) return 'text-slate-400 dark:text-slate-500';
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function matchesFilter(item: ContentItem, tab: FilterTab): boolean {
  const s = item.status?.toLowerCase() ?? '';
  if (tab === 'pending') return s.includes('pending') && s.includes('manager');
  if (tab === 'verified') return s === 'verified';
  if (tab === 'decided')
    return s === 'approved' || s === 'rejected' || s.includes('changes requested');
  return true;
}

// ─── Row Action Panel ─────────────────────────────────────────────────────────

interface ActionPanelProps {
  item: ContentItem;
  onDecision: (id: string, action: DecisionAction, comments: string) => void;
  onRejectRequest: (id: string, comments: string) => void;
  loading: boolean;
}

function ActionPanel({ item, onDecision, onRejectRequest, loading }: ActionPanelProps) {
  const [comments, setComments] = useState('');

  const isDecided =
    item.status?.toLowerCase() === 'approved' ||
    item.status?.toLowerCase() === 'rejected' ||
    item.status?.toLowerCase().includes('changes requested');

  return (
    <div className="px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-3xl space-y-3">
        {/* Comment */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
            Manager Comments
          </label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={isDecided || loading}
            placeholder={isDecided ? 'Decision already recorded.' : 'Add comments or feedback for this submission…'}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {/* Action buttons */}
        {!isDecided && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={loading}
              onClick={() => onDecision(item.id, 'Approved', comments)}
              className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 inline-flex items-center gap-1.5"
            >
              <ThumbsUp className="w-4 h-4" />
              Approve
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => onDecision(item.id, 'Changes Requested', comments)}
              className="border-amber-400 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Request Changes
            </Button>

            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={() => onRejectRequest(item.id, comments)}
              className="inline-flex items-center gap-1.5"
            >
              <ThumbsDown className="w-4 h-4" />
              Reject
            </Button>

            <Link
              href={`/review/${item.id}`}
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <Eye className="w-4 h-4" />
              Full Review
            </Link>
          </div>
        )}

        {isDecided && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Decision recorded — no further action required.
            </span>
            <Link
              href={`/review/${item.id}`}
              className="ml-auto inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <Eye className="w-4 h-4" />
              View Review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManagerDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Reject confirm dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [pendingReject, setPendingReject] = useState<{ id: string; comments: string } | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [router]);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await api.listContent();
      setContent(data || []);
    } catch (err) {
      console.error('Failed to load content:', err);
      showToast('Failed to load content. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpiPendingApproval = content.filter((c) =>
    c.status?.toLowerCase().includes('pending') && c.status?.toLowerCase().includes('manager')
  ).length;

  const kpiVerified = content.filter((c) => c.status?.toLowerCase() === 'verified').length;

  const kpiApproved = content.filter((c) => c.status?.toLowerCase() === 'approved').length;

  const kpiRejected = content.filter((c) => c.status?.toLowerCase() === 'rejected').length;

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = content.filter((item) => {
    const matchSearch = search.trim() === '' || item.title?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && matchesFilter(item, activeTab);
  });

  // ── Decision handler ────────────────────────────────────────────────────────
  const handleDecision = async (id: string, action: DecisionAction, comments: string) => {
    setActionLoading(true);
    try {
      await api.managerDecision(id, { action, comments });
      showToast(
        action === 'Approved'
          ? 'Content approved successfully.'
          : action === 'Rejected'
          ? 'Content rejected.'
          : 'Changes requested successfully.',
        action === 'Approved' ? 'success' : action === 'Rejected' ? 'error' : 'warning'
      );
      setExpandedId(null);
      await fetchContent();
    } catch (err) {
      console.error('Decision failed:', err);
      showToast('Failed to record decision. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject flow (with confirm dialog) ───────────────────────────────────────
  const handleRejectRequest = (id: string, comments: string) => {
    setPendingReject({ id, comments });
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    setRejectDialogOpen(false);
    await handleDecision(pendingReject.id, 'Rejected', pendingReject.comments);
    setPendingReject(null);
  };

  // ── Tab definitions ─────────────────────────────────────────────────────────
  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'verified', label: 'Verified' },
    { key: 'decided', label: 'Decided' },
  ];

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AppLayout
      pageTitle="Approval Management"
      breadcrumbs={[{ label: 'Approval Management' }]}
    >
      <div className="space-y-6">

        {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Pending Approval"
            value={kpiPendingApproval}
            icon={<Clock className="w-6 h-6" />}
            colorClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-amber-50 dark:bg-amber-900/30"
          />
          <KpiCard
            label="Verified Items"
            value={kpiVerified}
            icon={<Award className="w-6 h-6" />}
            colorClass="text-indigo-600 dark:text-indigo-400"
            bgClass="bg-indigo-50 dark:bg-indigo-900/30"
          />
          <KpiCard
            label="Approved"
            value={kpiApproved}
            icon={<CheckCircle2 className="w-6 h-6" />}
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-50 dark:bg-emerald-900/30"
          />
          <KpiCard
            label="Rejected"
            value={kpiRejected}
            icon={<XCircle className="w-6 h-6" />}
            colorClass="text-red-600 dark:text-red-400"
            bgClass="bg-red-50 dark:bg-red-900/30"
          />
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-1 mr-0.5" />
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchContent}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* ── Table / States ─────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">

          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No items found"
              description={
                search
                  ? `No content matching "${search}" in this category.`
                  : 'There are no items in this category yet.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    {['Title', 'Status', 'Channel', 'Compliance Score', 'Submitted', ''].map(
                      (col, i) => (
                        <th
                          key={i}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filtered.map((item) => {
                    const isExpanded = expandedId === item.id;
                    return (
                      <React.Fragment key={item.id}>
                        {/* ── Main row ── */}
                        <tr
                          className={`group transition-colors cursor-pointer ${
                            isExpanded
                              ? 'bg-indigo-50/60 dark:bg-indigo-900/10'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                          }`}
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          {/* Title */}
                          <td className="px-4 py-3 max-w-xs">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                {item.title || '(Untitled)'}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={item.status} />
                          </td>

                          {/* Channel */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {item.channel || '—'}
                          </td>

                          {/* Compliance Score */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            {item.compliance_score != null ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-sm font-semibold tabular-nums ${scoreColor(
                                    item.compliance_score
                                  )}`}
                                >
                                  {item.compliance_score}%
                                </span>
                                {item.severity && <SeverityBadge severity={item.severity} />}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
                            )}
                          </td>

                          {/* Submitted */}
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(item.submitted_at ?? item.created_at)}
                          </td>

                          {/* Expand toggle */}
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" /> Collapse
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" /> Review
                                </>
                              )}
                            </span>
                          </td>
                        </tr>

                        {/* ── Expanded action panel ── */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ActionPanel
                                item={item}
                                onDecision={handleDecision}
                                onRejectRequest={handleRejectRequest}
                                loading={actionLoading}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
            Showing {filtered.length} of {content.length} item{content.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Reject Confirm Dialog ───────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={rejectDialogOpen}
        title="Reject Content"
        message="Are you sure you want to reject this submission? This action will notify the content creator."
        confirmLabel="Reject"
        variant="destructive"
        onConfirm={confirmReject}
        onClose={() => {
          setRejectDialogOpen(false);
          setPendingReject(null);
        }}
      />
    </AppLayout>
  );
}
