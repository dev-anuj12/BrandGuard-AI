'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  Clock, RefreshCw, Sparkles, MessageSquare, History
} from 'lucide-react';
import { api, getCurrentUser } from '../../../lib/api';
import { StatusBadge } from '../../../components/Badges';

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [managerComments, setManagerComments] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleDecision = async (
    contentId: number,
    action: 'Approved' | 'Rejected' | 'Changes Requested'
  ) => {
    setActionLoading(contentId);
    setMessage(null);
    try {
      const comment = managerComments[contentId] || '';
      await api.managerDecision(contentId, { action, comments: comment });
      setMessage({
        type: 'success',
        text: `Content #${contentId} has been marked as ${action}. Action recorded in audit log.`,
      });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Approval decision failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingApprovals = contents.filter(
    (c) => c.status === 'Pending Manager Approval' || c.status === 'Verified'
  );
  const approvedList = contents.filter((c) => c.status === 'Approved');
  const rejectedList = contents.filter((c) => c.status === 'Rejected');

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-800 text-[11px] font-semibold text-purple-300 mb-2">
            <span>Executive Manager Portal</span>
            <span>•</span>
            <span className="text-slate-400">Final Brand &amp; Legal Sign-Off</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Compliance Management — {user?.full_name?.split(' ')[0] || 'Manager'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authorize verified marketing campaigns, mandate modifications, or reject non-compliant collateral.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Pending Executive Approval</span>
          <div className="text-3xl font-black text-purple-400 mt-2">{pendingApprovals.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified by Reviewers</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Approved Campaigns</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">{approvedList.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Authorized for deployment</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Rejected / Escalated</span>
          <div className="text-3xl font-black text-rose-400 mt-2">{rejectedList.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Prohibited material</span>
        </div>
      </div>

      {/* Action Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <span>Verified Submissions Awaiting Final Manager Decision</span>
        </h2>

        {pendingApprovals.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/30 text-center text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span>No pending submissions in the executive approval queue.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-purple-900/40 bg-slate-900/60 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-mono">ID #{item.id} • Channel: {item.channel}</span>
                    <h3 className="font-bold text-white text-base">{item.title}</h3>
                    <span className="text-xs text-slate-400">Creator: {item.creator_name || 'FinNova Copywriter'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200">
                      Score: {item.latest_score !== null ? `${item.latest_score}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                  {item.current_body}
                </div>

                {/* Manager Comments & Decision Buttons */}
                <div className="space-y-3 pt-1">
                  <input
                    type="text"
                    value={managerComments[item.id] || ''}
                    onChange={(e) =>
                      setManagerComments({ ...managerComments, [item.id]: e.target.value })
                    }
                    placeholder="Enter executive sign-off comments or rejection rationale..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/review/${item.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect AI Review Findings</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecision(item.id, 'Changes Requested')}
                        disabled={actionLoading === item.id}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 transition"
                      >
                        Request Modifications
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, 'Rejected')}
                        disabled={actionLoading === item.id}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Campaign</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, 'Approved')}
                        disabled={actionLoading === item.id}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Grant Official Approval</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
