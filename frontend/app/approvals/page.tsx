'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Clock, CheckCircle2, AlertTriangle, XCircle, 
  RefreshCw, MessageSquare, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { api, getCurrentUser } from '../../lib/api';
import { StatusBadge } from '../../components/Badges';

export default function ApprovalManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
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

  const filteredContents = contents.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (channelFilter !== 'ALL' && c.channel !== channelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800 text-[11px] font-semibold text-indigo-300 mb-2">
            <span>Enterprise Compliance Workflow</span>
            <span>•</span>
            <span className="text-slate-400">Human Approval Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Workflow &amp; Approval Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track all marketing submissions across Creator draft, AI audit, Reviewer verification, and Managerial approval.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Visual Workflow Stage Progression Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hidden md:grid grid-cols-4 gap-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-indigo-400">Stage 1</span>
          <h4 className="font-bold text-white text-sm">Submission</h4>
          <p className="text-slate-400 text-[11px]">Creator drafts campaign collateral</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-400">Stage 2</span>
          <h4 className="font-bold text-white text-sm">BrandGuard AI Audit</h4>
          <p className="text-slate-400 text-[11px]">Multi-engine rules, tone, &amp; citations</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-400">Stage 3</span>
          <h4 className="font-bold text-white text-sm">Reviewer Verification</h4>
          <p className="text-slate-400 text-[11px]">Human auditor checks unresolved findings</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Stage 4</span>
          <h4 className="font-bold text-white text-sm">Manager Approval</h4>
          <p className="text-slate-400 text-[11px]">Executive authorization or rejection</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { label: 'All Items', value: 'ALL' },
            { label: 'Pending Verification', value: 'Pending Reviewer Verification' },
            { label: 'Pending Manager Approval', value: 'Pending Manager Approval' },
            { label: 'Changes Required', value: 'Changes Required' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Rejected', value: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl transition ${
                statusFilter === tab.value
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
        >
          <option value="ALL">All Channels</option>
          <option value="Social Media">Social Media</option>
          <option value="Website/Blog">Website/Blog</option>
          <option value="Press Release">Press Release</option>
          <option value="Email Newsletter">Email Newsletter</option>
          <option value="Ad Campaign">Ad Campaign</option>
        </select>
      </div>

      {/* Pipeline List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading pipeline...
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/30 text-center text-slate-400 text-sm">
            No submissions match the selected workflow filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContents.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">#{c.id}</span>
                    <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {c.channel}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="font-bold text-white text-base">{c.title}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-4">
                    <span>Creator: <strong className="text-slate-300">{c.creator_name || 'FinNova Team'}</strong></span>
                    <span>•</span>
                    <span>Audience: {c.target_audience}</span>
                    <span>•</span>
                    <span className="font-mono">v{c.revisions_count || 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Compliance</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        c.latest_score >= 80 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {c.latest_score !== null ? `${c.latest_score}%` : 'Pending'}
                    </span>
                  </div>

                  <Link
                    href={`/review/${c.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                  >
                    <span>View Audit</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
