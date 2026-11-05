'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, Plus, Clock, AlertTriangle, CheckCircle2, ArrowRight, 
  ExternalLink, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import { api, getCurrentUser } from '../../../lib/api';
import { StatusBadge } from '../../../components/Badges';

export default function CreatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listContent();
      setContents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch content submissions.');
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

  // Compute KPI metrics from actual data
  const totalSubmissions = contents.length;
  const pendingReviews = contents.filter(
    (c) => c.status === 'Submitted' || c.status === 'Pending Reviewer Verification'
  ).length;
  const changesRequired = contents.filter(
    (c) => c.status === 'Changes Required' || c.status === 'AI Review Completed'
  ).length;
  const approvedCount = contents.filter((c) => c.status === 'Approved').length;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800 text-[11px] font-semibold text-indigo-300 mb-2">
            <span>Creator Portal</span>
            <span>•</span>
            <span className="text-slate-400">Marketing &amp; Copywriting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Creator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your marketing campaigns, inspect AI compliance findings, and submit revisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh submissions"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/submit"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Content</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Submissions</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{totalSubmissions}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Lifetime marketing drafts</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pending Review</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">{pendingReviews}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Awaiting verification</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Action Required</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{changesRequired}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Violations flagged by AI</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Approved Content</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{approvedCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Cleared for publication</span>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-white text-base">Recent Submissions</h2>
          </div>
          <span className="text-xs text-slate-500">{contents.length} item(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
            Loading submissions...
          </div>
        ) : contents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-4">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p>No content submitted yet.</p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit First Campaign</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Campaign Title</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Compliance Score</th>
                  <th className="py-3 px-4">Revisions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {contents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      <div className="flex flex-col">
                        <span>{item.title}</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Audience: {item.target_audience}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{item.channel}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-4">
                      {item.latest_score !== null && item.latest_score !== undefined ? (
                        <span
                          className={`font-bold text-xs px-2.5 py-1 rounded-lg border ${
                            item.latest_score >= 80
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                              : item.latest_score >= 50
                              ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                          }`}
                        >
                          {item.latest_score}%
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Pending Review</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono">
                        v{item.revisions_count || 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/review/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                        <span>Inspect Review</span>
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
  );
}
