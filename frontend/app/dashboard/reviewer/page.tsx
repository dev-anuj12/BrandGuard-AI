'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, 
  MessageSquare, ExternalLink, RefreshCw, Sparkles, Send
} from 'lucide-react';
import { api, getCurrentUser } from '../../../lib/api';
import { StatusBadge } from '../../../components/Badges';

export default function ReviewerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [verificationNote, setVerificationNote] = useState<Record<number, string>>({});
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

  const handleVerify = async (contentId: number, action: 'verify' | 'request_changes') => {
    setActionLoading(contentId);
    setMessage(null);
    try {
      const note = verificationNote[contentId] || '';
      await api.verifyContent(contentId, { action, comments: note });
      setMessage({
        type: 'success',
        text: `Content #${contentId} successfully ${action === 'verify' ? 'verified and sent to Manager' : 'sent back for corrections'}.`
      });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Verification action failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingVerification = contents.filter(
    (c) => c.status === 'Pending Reviewer Verification' || c.status === 'AI Review Completed' || c.status === 'Resubmitted'
  );
  const verifiedCount = contents.filter(
    (c) => c.status === 'Verified' || c.status === 'Pending Manager Approval' || c.status === 'Approved'
  ).length;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800 text-[11px] font-semibold text-blue-300 mb-2">
            <span>Reviewer Portal</span>
            <span>•</span>
            <span className="text-slate-400">Quality &amp; Compliance Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Reviewer Workspace — {user?.full_name?.split(' ')[0] || 'Auditor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit AI findings, inspect citations, verify creator corrections, and recommend approval.
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
          <span className="text-xs font-semibold text-slate-400">Awaiting Verification</span>
          <div className="text-3xl font-black text-blue-400 mt-2">{pendingVerification.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires auditor inspection</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Verified to Date</span>
          <div className="text-3xl font-black text-emerald-400 mt-2">{verifiedCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Forwarded to Manager</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">System Guidelines Active</span>
          <div className="text-3xl font-black text-indigo-400 mt-2">4 Policies</div>
          <span className="text-[11px] text-slate-500 mt-1 block">FinNova standard specs</span>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <span>Submissions Requiring Reviewer Verification</span>
        </h2>

        {pendingVerification.length === 0 ? (
          <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/30 text-center text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span>All current submissions have been verified! Good job.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingVerification.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-mono">Submission #{item.id}</span>
                    <h3 className="font-bold text-white text-base">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300">
                      Score: {item.latest_score !== null ? `${item.latest_score}%` : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                  {item.current_body}
                </div>

                {/* Reviewer Note Input */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={verificationNote[item.id] || ''}
                    onChange={(e) =>
                      setVerificationNote({ ...verificationNote, [item.id]: e.target.value })
                    }
                    placeholder="Add verification note or feedback for Creator / Manager..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 w-full"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/review/${item.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Deep Audit</span>
                    </Link>

                    <button
                      onClick={() => handleVerify(item.id, 'request_changes')}
                      disabled={actionLoading === item.id}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 transition"
                    >
                      Request Changes
                    </button>

                    <button
                      onClick={() => handleVerify(item.id, 'verify')}
                      disabled={actionLoading === item.id}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify &amp; Send to Manager</span>
                    </button>
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
