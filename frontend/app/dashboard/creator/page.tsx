'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, Plus, Clock, AlertTriangle, CheckCircle2, 
  RefreshCw, Search, Filter, Sparkles, ChevronRight, FileEdit
} from 'lucide-react';
import { api, getCurrentUser } from '../../../lib/api';
import AppLayout from '../../../components/AppLayout';
import { StatusBadge } from '../../../components/Badges';
import { Button } from '../../../components/ui/Button';
import { CardSkeleton, TableSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function CreatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.listContent();
      setContents(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cur = getCurrentUser();
    if (!cur) {
      router.push('/login');
      return;
    }
    setUser(cur);
    loadData();
  }, [router]);

  const filteredContents = contents.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchChannel = c.channel.toLowerCase().includes(q);
      const matchAudience = c.target_audience.toLowerCase().includes(q);
      return matchTitle || matchChannel || matchAudience;
    }
    return true;
  });

  const totalSubmissions = contents.length;
  const underReview = contents.filter(
    (c) => c.status === 'Submitted' || c.status === 'Pending Reviewer Verification'
  ).length;
  const changesRequired = contents.filter(
    (c) => c.status === 'Changes Required' || c.status === 'AI Review Completed'
  ).length;
  const approved = contents.filter((c) => c.status === 'Approved').length;

  return (
    <AppLayout
      pageTitle="Creator Workspace"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Creator Dashboard' }]}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Creator'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Draft brand-aligned collateral, run automated compliance diagnostics, and resolve flagged issues.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              title="Refresh submissions"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/submit')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Submission
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Submissions</span>
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{totalSubmissions}</div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Active marketing drafts</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Under Review</span>
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{underReview}</div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">In auditor verification</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Action Required</span>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{changesRequired}</div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Flagged for revisions</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved Content</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{approved}</div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Cleared for deployment</span>
            </div>
          </div>
        )}

        {/* Content Table Container */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-card overflow-hidden">
          {/* Table Header & Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, channel, or audience..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="ALL">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="AI Review Completed">AI Review Completed</option>
                <option value="Changes Required">Changes Required</option>
                <option value="Pending Reviewer Verification">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <TableSkeleton rows={4} />
          ) : filteredContents.length === 0 ? (
            <EmptyState
              icon={FileEdit}
              title="No submissions found"
              description={
                searchQuery || statusFilter !== 'ALL'
                  ? 'No drafts match the selected filter criteria. Try resetting your search.'
                  : 'You have not submitted any marketing campaigns for brand review yet.'
              }
              actionLabel="Create Submission"
              onAction={() => router.push('/submit')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3 px-4">Campaign Title</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Compliance Score</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredContents.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex flex-col">
                          <span>{c.title}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Target: {c.target_audience}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{c.channel}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        {c.latest_score !== null && c.latest_score !== undefined ? (
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${
                              c.latest_score >= 80
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                : c.latest_score >= 50
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                            }`}
                          >
                            {c.latest_score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        v{c.revisions_count || 1}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/review/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>View Findings</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
