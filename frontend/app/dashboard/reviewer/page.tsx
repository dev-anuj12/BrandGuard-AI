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
  CheckSquare,
  Filter,
  Search,
  ChevronRight,
} from 'lucide-react';

import AppLayout from '../../../components/AppLayout';
import { Button } from '../../../components/ui/Button';
import { TableSkeleton, CardSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatusBadge, SeverityBadge } from '../../../components/Badges';
import { useToast } from '../../../components/ui/Toast';
import { api, getCurrentUser } from '../../../lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ContentItem {
  id: string;
  title: string;
  status: string;
  channel?: string;
  created_at?: string;
  submitted_at?: string;
  compliance_score?: number | null;
  severity?: string;
  assigned_reviewer?: string;
}

type FilterTab = 'all' | 'pending' | 'resubmitted' | 'completed';

const REVIEW_STATES = [
  'AI Review Completed',
  'Resubmitted',
  'Submitted',
  'Pending Reviewer Verification',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function scoreColor(score?: number | null) {
  if (score == null) return 'text-slate-400';
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------
interface KPICardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
}

function KPICard({ label, value, icon, accent }: KPICardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex items-center gap-4 shadow-sm">
      <div className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row Action Panel (collapsible)
// ---------------------------------------------------------------------------
interface ActionPanelProps {
  item: ContentItem;
  onActionComplete: () => void;
}

function ActionPanel({ item, onActionComplete }: ActionPanelProps) {
  const { addToast } = useToast();
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState<'verify' | 'request_changes' | null>(null);

  async function handleAction(action: 'verify' | 'request_changes') {
    setLoading(action);
    try {
      await api.verifyContent(item.id, { action, comments });
      addToast({
        type: 'success',
        message:
          action === 'verify'
            ? 'Content verified successfully.'
            : 'Change request submitted successfully.',
      });
      setComments('');
      onActionComplete();
    } catch (err: any) {
      addToast({
        type: 'error',
        message: err?.message ?? 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-5 py-4 space-y-3">
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
        Reviewer Comments {comments.trim().length < 10 && <span className="text-amber-500 font-normal lowercase">(min 10 chars required to request changes)</span>}
      </label>
      <textarea
        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        rows={3}
        placeholder="Add comments or feedback for the content creator (min 10 chars required for change requests)…"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        disabled={loading !== null}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleAction('verify')}
          disabled={loading !== null}
          loading={loading === 'verify'}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Verify Content
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction('request_changes')}
          disabled={loading !== null || comments.trim().length < 10}
          loading={loading === 'request_changes'}
          leftIcon={<XCircle className="w-4 h-4" />}
          className="text-amber-600 border-amber-400 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-500 dark:hover:bg-amber-900/20"
        >
          Request Changes
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content Row
// ---------------------------------------------------------------------------
interface ContentRowProps {
  item: ContentItem;
  onActionComplete: () => void;
}

function ContentRow({ item, onActionComplete }: ContentRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {item.title ?? 'Untitled Content'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {item.channel && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {item.channel}
              </span>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(item.submitted_at ?? item.created_at)}
            </span>
            {item.compliance_score != null && (
              <span className={`text-xs font-medium ${scoreColor(item.compliance_score)}`}>
                Score: {item.compliance_score}%
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} />
          {item.severity && <SeverityBadge severity={item.severity} />}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/review/${item.id}`}>
            <Button size="sm" variant="ghost" leftIcon={<Eye className="w-4 h-4" />}>
              Review
            </Button>
          </Link>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Actions
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Collapsible action panel */}
      {expanded && (
        <ActionPanel
          item={item}
          onActionComplete={() => {
            setExpanded(false);
            onActionComplete();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReviewerDashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  async function loadData(showRefreshing = false) {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const [currentUser, contentRes] = await Promise.all([
        getCurrentUser(),
        api.listContent(),
      ]);
      setUser(currentUser);

      const items: ContentItem[] = Array.isArray(contentRes)
        ? contentRes
        : (contentRes as any)?.results ?? (contentRes as any)?.data ?? [];

      // Filter to only review-relevant states
      const reviewable = items.filter((c) => REVIEW_STATES.includes(c.status));
      setAllContent(reviewable);
    } catch (err: any) {
      addToast({ type: 'error', message: 'Failed to load content. Please refresh.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // KPIs
  // ---------------------------------------------------------------------------
  const total = allContent.length;
  const pending = allContent.filter(
    (c) =>
      c.status === 'AI Review Completed' ||
      c.status === 'Pending Reviewer Verification' ||
      c.status === 'Submitted'
  ).length;
  const completed = allContent.filter((c) => c.status === 'Completed').length;
  const highPriority = allContent.filter(
    (c) => c.severity === 'HIGH' || c.severity === 'CRITICAL'
  ).length;

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------
  const tabFiltered = allContent.filter((c) => {
    if (activeTab === 'pending')
      return (
        c.status === 'AI Review Completed' ||
        c.status === 'Pending Reviewer Verification' ||
        c.status === 'Submitted'
      );
    if (activeTab === 'resubmitted') return c.status === 'Resubmitted';
    if (activeTab === 'completed') return c.status === 'Completed';
    return true;
  });

  const filtered = tabFiltered.filter((c) =>
    searchQuery.trim()
      ? (c.title ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // ---------------------------------------------------------------------------
  // Tab config
  // ---------------------------------------------------------------------------
  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${total})` },
    { key: 'pending', label: `Pending (${pending})` },
    { key: 'resubmitted', label: `Resubmitted (${allContent.filter((c) => c.status === 'Resubmitted').length})` },
    { key: 'completed', label: `Completed (${completed})` },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <AppLayout
      pageTitle="Reviewer Workspace"
      breadcrumbs={[{ label: 'Reviewer Workspace' }]}
    >
      <div className="space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reviewer Workspace
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review AI-analyzed content and verify compliance before publication.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            }
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* KPI Cards */}
        {/* ------------------------------------------------------------------ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Total Assigned"
              value={total}
              icon={<CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              accent="bg-indigo-50 dark:bg-indigo-900/30"
            />
            <KPICard
              label="Pending Review"
              value={pending}
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              accent="bg-amber-50 dark:bg-amber-900/30"
            />
            <KPICard
              label="Completed"
              value={completed}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              accent="bg-emerald-50 dark:bg-emerald-900/30"
            />
            <KPICard
              label="High Priority"
              value={highPriority}
              icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
              accent="bg-red-50 dark:bg-red-900/30"
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Controls */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter icon (decorative label) */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter:</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Status Tabs */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Content List */}
        {/* ------------------------------------------------------------------ */}
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={
              searchQuery
                ? 'No results found'
                : activeTab === 'all'
                  ? 'No content to review'
                  : `No ${activeTab} content`
            }
            description={
              searchQuery
                ? `No items match "${searchQuery}". Try a different search term.`
                : 'There is no content in this category requiring your review right now.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <ContentRow
                key={item.id}
                item={item}
                onActionComplete={() => loadData(true)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
