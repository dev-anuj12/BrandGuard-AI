'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Clock, 
  ArrowRight, RefreshCw, BarChart3, Globe, Users, ExternalLink, 
  Search, Sliders, Activity, Sparkles, Plus, Eye, CheckSquare, FileText
} from 'lucide-react';
import dynamic from 'next/dynamic';

import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { CardSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ThreatRiskBadge, ThreatStatusBadge } from '../../components/Badges';
import { api, getCurrentUser } from '../../lib/api';

const DynamicComplianceTrendChart = dynamic(
  () => import('../../components/charts/ComplianceTrendChart'),
  { ssr: false, loading: () => <div className="h-[180px] flex items-center justify-center text-xs text-slate-400">Loading trend...</div> }
);

const DynamicThreatCategoryPieChart = dynamic(
  () => import('../../components/charts/ThreatCategoryPieChart'),
  { ssr: false, loading: () => <div className="h-[176px] flex items-center justify-center text-xs text-slate-400">Loading breakdown...</div> }
);

const PIE_COLORS = ['#EF4444', '#F59E0B', '#6366F1', '#8B5CF6', '#10B981'];

export default function UnifiedDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUnifiedData = async () => {
    setLoading(true);
    try {
      const res = await api.getUnifiedAnalytics();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load unified telemetry:', err);
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
    loadUnifiedData();
  }, [router]);

  const complianceScore = data?.brand_compliance_score !== undefined
    ? Math.round(data.brand_compliance_score)
    : 85;

  const threatCategories: { name: string; value: number }[] = data?.threat_category_breakdown?.map((c: any) => ({
    name: c.category,
    value: c.count,
  })) || [];

  const trendData = data?.compliance_trend || [];
  const recentThreats = data?.recent_threats || [];
  const activities = data?.recent_activities || [];

  return (
    <AppLayout pageTitle="Unified Command Center" breadcrumbs={[{ label: 'Executive Dashboard' }]}>
      <div className="space-y-6">
        {/* Top Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>{user?.organization || 'Enterprise Brand'}</span>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-400">Governance Perimeter</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Brand Governance &amp; Threat Intelligence Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Unified telemetry connecting internal content compliance with external digital threat detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUnifiedData}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Sync Telemetry
            </Button>
            <Link href="/threats">
              <Button size="sm" leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}>
                Threat Center
              </Button>
            </Link>
          </div>
        </div>

        {/* 6-Card High-Level KPI Matrix */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Compliance Score */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Brand Compliance</span>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {complianceScore}%
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                {complianceScore >= 80 ? 'Passing Standard' : 'Review Mandated'}
              </span>
            </div>

            {/* 2. Content Reviewed */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Content Reviewed</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {data?.total_content_reviewed ?? 0}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Total audited assets</span>
            </div>

            {/* 3. Pending Approvals */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Approvals</span>
              <div className="text-2xl font-extrabold text-amber-500 mt-1">
                {data?.pending_approvals ?? 0}
              </div>
              <span className="text-[10px] text-amber-500/80 mt-0.5 block">Awaiting verification</span>
            </div>

            {/* 4. Total Threats */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Detected Threats</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {data?.total_detected_threats ?? 0}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">All perimeter vectors</span>
            </div>

            {/* 5. Critical & High */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-sm">
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Critical / High Risk</span>
              <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {data?.critical_high_threats ?? 0}
              </div>
              <span className="text-[10px] text-rose-500/80 mt-0.5 block">Requires action</span>
            </div>

            {/* 6. Resolved Threats */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Threats Resolved</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {data?.threats_resolved ?? 0}
              </div>
              <span className="text-[10px] text-emerald-600/80 mt-0.5 block">Takedowns completed</span>
            </div>
          </div>
        )}

        {/* Dual Pillar Command Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PILLAR 1: BRAND GOVERNANCE OVERVIEW */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Brand Governance &amp; Compliance</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Internal content review &amp; human oversight</p>
                </div>
              </div>

              <Link href="/approvals" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <span>Pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Governance Velocity Chart */}
            <div className="h-44">
              <DynamicComplianceTrendChart data={trendData.map((d: any) => ({ day: d.timestamp, score: d.score }))} height={176} />
            </div>

            {/* Quick Actions & Status Strip */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Approved</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{data?.approved_content ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">In Review</span>
                <span className="text-sm font-bold text-amber-500">{data?.pending_approvals ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Rejected</span>
                <span className="text-sm font-bold text-rose-500">{data?.rejected_content ?? 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link href="/submit" className="flex-1">
                <Button size="sm" className="w-full" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Create Submission
                </Button>
              </Link>
              <Link href="/approvals" className="flex-1">
                <Button size="sm" variant="outline" className="w-full" leftIcon={<CheckSquare className="w-3.5 h-3.5" />}>
                  Review Workflow
                </Button>
              </Link>
            </div>
          </div>

          {/* PILLAR 2: DIGITAL BRAND PROTECTION OVERVIEW */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Digital Brand Protection</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">External threats, lookalikes &amp; counterfeit surveillance</p>
                </div>
              </div>

              <Link href="/threats" className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
                <span>Threat Center</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Threat Category Breakdown Chart */}
            {threatCategories.length === 0 ? (
              <div className="h-44 flex items-center justify-center">
                <EmptyState
                  icon={ShieldAlert}
                  title="No active threats"
                  description="External threats detected across domains, social, and products will appear here."
                />
              </div>
            ) : (
              <div className="h-44 flex items-center justify-between">
                <div className="w-1/2 h-full">
                  <DynamicThreatCategoryPieChart data={threatCategories} colors={PIE_COLORS} height={176} />
                </div>

                <div className="w-1/2 space-y-1.5 pl-2 text-xs">
                  {threatCategories.map((cat: any, i: number) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white ml-2">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Threat Status Strip */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">New Alerts</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{data?.new_threats ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Investigating</span>
                <span className="text-sm font-bold text-amber-500">{data?.threats_investigating ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Resolved</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{data?.threats_resolved ?? 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Link href="/threats" className="flex-1">
                <Button size="sm" variant="destructive" className="w-full" leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}>
                  Inspect Threats
                </Button>
              </Link>
              <Link href="/threats" className="flex-1">
                <Button size="sm" variant="outline" className="w-full" leftIcon={<Globe className="w-3.5 h-3.5" />}>
                  Scan External URL
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Lower Row: Recent Threats Table & Chronological Audit Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Threats Table */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Active Threat Intelligence Incidents
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live external threats targeting enterprise assets</p>
              </div>

              <Link href="/threats">
                <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-3 h-3" />}>
                  View All ({data?.total_detected_threats ?? 0})
                </Button>
              </Link>
            </div>

            {loading ? (
              <TableSkeleton rows={4} />
            ) : recentThreats.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Perimeter secure"
                description="No active digital brand threats detected at this time."
              />
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Threat Code</th>
                        <th className="py-3 px-4">Category &amp; Target</th>
                        <th className="py-3 px-4">Risk Level</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Investigation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {recentThreats.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {t.threat_code}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-900 dark:text-white block">{t.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs block mt-0.5">
                              {t.source_url}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <ThreatRiskBadge risk={t.risk_level} />
                          </td>
                          <td className="py-3 px-4">
                            <ThreatStatusBadge status={t.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href="/threats">
                              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3 h-3" />}>
                                Inspect
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Unified Activity Stream */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Unified Platform Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chronological governance &amp; threat audit</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
              {activities.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No recent events"
                  description="Platform events will populate here chronologically."
                />
              ) : (
                <div className="space-y-3">
                  {activities.map((act: any) => (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs pb-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        act.severity === 'HIGH' ? 'bg-rose-500' : 'bg-indigo-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{act.action}</span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {act.title}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                          {act.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

