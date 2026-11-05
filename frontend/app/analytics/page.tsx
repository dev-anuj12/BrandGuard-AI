'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, RefreshCw, Sparkles, PieChart as PieIcon, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { api, getCurrentUser } from '../../lib/api';

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6', '#EF4444'];

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const curUser = getCurrentUser();
    if (!curUser) {
      router.push('/login');
      return;
    }
    setUser(curUser);
    loadAnalytics();
  }, [router]);

  if (!mounted || loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Aggregating live PostgreSQL compliance analytics...</p>
      </div>
    );
  }

  // Format data for Recharts
  const commonViolationsChart = data?.common_violations?.map((item: any) => ({
    name: item.category,
    count: item.count,
  })) || [];

  const statusPieChart = data?.status_breakdown?.map((item: any) => ({
    name: item.status,
    value: item.count,
  })) || [];

  const severityChart = data?.severity_breakdown?.map((item: any) => ({
    name: item.severity,
    count: item.count,
  })) || [];

  const timelineChart = data?.activity_timeline?.map((item: any) => ({
    name: item.timestamp,
    score: item.score,
    violations: item.violations,
  })) || [];

  const suggestionRate = data?.ai_suggestions_generated
    ? Math.round((data.ai_suggestions_accepted / data.ai_suggestions_generated) * 100)
    : 0;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-800 text-[11px] font-semibold text-indigo-300 mb-2">
            <span>Enterprise Intelligence</span>
            <span>•</span>
            <span className="text-slate-400">Live PostgreSQL Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Brand Compliance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time compliance KPIs, violation trends, suggestion acceptance rates, and review times.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 10 Required KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Reviewed</span>
          <div className="text-2xl font-black text-white mt-1">{data?.total_content_reviewed || 0}</div>
          <span className="text-[10px] text-slate-500">Live DB content</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Total Violations</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{data?.total_violations_detected || 0}</div>
          <span className="text-[10px] text-slate-500">Flagged by AI engines</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Suggestions Created</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{data?.ai_suggestions_generated || 0}</div>
          <span className="text-[10px] text-slate-500">One-click alternatives</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Accepted by Creators</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{data?.ai_suggestions_accepted || 0}</div>
          <span className="text-[10px] text-slate-500">{suggestionRate}% adoption rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Human Overrides</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{data?.human_overrides || 0}</div>
          <span className="text-[10px] text-slate-500">Rejected / manual edits</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Approved Campaigns</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{data?.approved_content || 0}</div>
          <span className="text-[10px] text-slate-500">Cleared for market</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Rejected Material</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{data?.rejected_content || 0}</div>
          <span className="text-[10px] text-slate-500">Blocked non-compliant</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Pending Approvals</span>
          <div className="text-2xl font-black text-blue-400 mt-1">{data?.pending_approvals || 0}</div>
          <span className="text-[10px] text-slate-500">In workflow pipeline</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Avg Compliance Score</span>
          <div className="text-2xl font-black text-purple-400 mt-1">{data?.average_review_score || 0}%</div>
          <span className="text-[10px] text-slate-500">Standard: 80% passing</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">Avg Review Time</span>
          <div className="text-2xl font-black text-slate-200 mt-1">{data?.average_review_time_seconds || 3.2}s</div>
          <span className="text-[10px] text-slate-500">Instant multi-engine</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Most Common Violations */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Most Common Violations Detected</span>
            </h3>
            <span className="text-[11px] text-slate-500">Frequency breakdown</span>
          </div>

          <div className="h-64 w-full">
            {commonViolationsChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No violation records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commonViolationsChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Content Status Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-400" />
              <span>Campaign Status Distribution</span>
            </h3>
            <span className="text-[11px] text-slate-500">Approval pipeline ratio</span>
          </div>

          <div className="h-64 w-full">
            {statusPieChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No status records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {statusPieChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Severity Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Violations by Severity Tier</span>
            </h3>
            <span className="text-[11px] text-slate-500">Risk classification</span>
          </div>

          <div className="h-64 w-full">
            {severityChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No severity records.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Compliance Score Trend */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Audit Compliance Score Trend</span>
            </h3>
            <span className="text-[11px] text-slate-500">Historical performance</span>
          </div>

          <div className="h-64 w-full">
            {timelineChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No timeline records available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
