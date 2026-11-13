'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GitMerge, ArrowRight, CheckCircle2, Clock, XCircle, AlertTriangle, 
  FileText, Eye, Filter, Search, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { TableSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/Badges';
import { api, getCurrentUser } from '../../lib/api';

export default function ApprovalManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
    const curUser = getCurrentUser();
    if (!curUser) {
      router.push('/login');
      return;
    }
    setUser(curUser);
    loadData();
  }, [router]);

  // Stage categorizations
  const stage1Count = contents.filter((c) => c.status === 'Draft').length;
  const stage2Count = contents.filter((c) => ['Submitted', 'AI Review In Progress', 'AI Review Completed'].includes(c.status)).length;
  const stage3Count = contents.filter((c) => ['Pending Reviewer Verification', 'Resubmitted', 'Pending Manager Approval', 'Verified'].includes(c.status)).length;
  const stage4Count = contents.filter((c) => ['Approved', 'Rejected', 'Changes Requested'].includes(c.status)).length;

  const filteredContents = contents.filter((c) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'DRAFT' && c.status !== 'Draft') return false;
      if (statusFilter === 'UNDER_REVIEW' && !['Submitted', 'AI Review In Progress', 'AI Review Completed'].includes(c.status)) return false;
      if (statusFilter === 'VERIFIED' && !['Pending Reviewer Verification', 'Resubmitted', 'Pending Manager Approval', 'Verified'].includes(c.status)) return false;
      if (statusFilter === 'APPROVED' && c.status !== 'Approved') return false;
      if (statusFilter === 'REJECTED' && c.status !== 'Rejected') return false;
    }
    if (channelFilter !== 'ALL' && c.channel !== channelFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchChannel = c.channel?.toLowerCase().includes(q);
      if (!matchTitle && !matchChannel) return false;
    }
    return true;
  });

  return (
    <AppLayout pageTitle="Workflow Pipeline" breadcrumbs={[{ label: 'Workflow Pipeline' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Content Governance &amp; Approval Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              End-to-end audit tracking across AI analysis, human verification, and executive approval stages.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>

        {/* 4-Stage Pipeline Visual Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-800/40 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">1</span>
                Draft &amp; Ingestion
              </span>
              <span className="font-mono text-xs">{stage1Count} items</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full" style={{ width: `${contents.length ? (stage1Count / contents.length) * 100 : 0}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Initial submission drafting</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-800/40 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-purple-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-purple-300">2</span>
                AI Compliance Review
              </span>
              <span className="font-mono text-xs">{stage2Count} items</span>
            </div>
            <div className="h-1.5 w-full bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${contents.length ? (stage2Count / contents.length) * 100 : 0}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Deterministic &amp; LLM checks</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-800/40 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-[10px] font-bold text-purple-600 dark:text-purple-300">3</span>
                Human Verification
              </span>
              <span className="font-mono text-xs">{stage3Count} items</span>
            </div>
            <div className="h-1.5 w-full bg-purple-100 dark:bg-purple-950 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${contents.length ? (stage3Count / contents.length) * 100 : 0}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Reviewer &amp; manager verification</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-800/40 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-300">4</span>
                Final Decision
              </span>
              <span className="font-mono text-xs">{stage4Count} items</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${contents.length ? (stage4Count / contents.length) * 100 : 0}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Approved or rejected</p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#120924]/85 backdrop-blur-xl p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'DRAFT', label: 'Drafts' },
              { id: 'UNDER_REVIEW', label: 'In Review' },
              { id: 'VERIFIED', label: 'Verification' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search content or channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-purple-800/40 bg-white dark:bg-[#150A26] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredContents.length === 0 ? (
          <EmptyState
            icon={GitMerge}
            title="No submissions match criteria"
            description="Adjust your search query or filter tab to view other workflow items."
          />
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-purple-800/40 bg-white dark:bg-[#120924]/85 backdrop-blur-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-[#150A26] border-b border-slate-200/80 dark:border-purple-900/35 text-slate-500 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Content Title</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Governance Status</th>
                    <th className="py-3 px-4">Compliance Score</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredContents.map((c) => {
                    const score = c.compliance_score !== null && c.compliance_score !== undefined
                      ? Math.round(c.compliance_score)
                      : null;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <Link href={`/review/${c.id}`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block">
                            {c.title}
                          </Link>
                          <span className="text-[11px] text-slate-400 mt-0.5 block truncate max-w-sm">
                            {c.original_body?.slice(0, 80)}...
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/50 text-[11px] font-medium">
                            {c.channel || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-3 px-4">
                          {score !== null ? (
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className={`w-2 h-2 rounded-full ${
                                score >= 85 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} />
                              <span className={score >= 85 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                                {score}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/review/${c.id}`}>
                            <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3 h-3" />}>
                              Inspect
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
