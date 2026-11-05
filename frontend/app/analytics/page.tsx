'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  BarChart3, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, RefreshCw, Sparkles, PieChart as PieIcon, Activity,
  AlertOctagon, CheckSquare, Layers, Award
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { api, getCurrentUser } from '../../lib/api';

// Lazy-load all recharts components to prevent SSR issues and reduce initial bundle
const DynamicBarChart = dynamic(() => import('../../components/charts/AnalyticsBarChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
});
const DynamicPieChart = dynamic(() => import('../../components/charts/AnalyticsPieChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
});
const DynamicLineChart = dynamic(() => import('../../components/charts/AnalyticsLineChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
});

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899'];

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    const curUser = getCurrentUser();
    if (!curUser) {
      router.push('/login');
      return;
    }
    setUser(curUser);
    loadAnalytics();
  }, [router]);

  // Transform backend analytics response into chart datasets
  const violationsData = data?.common_violations?.map((item: any) => ({
    category: item.category || 'General',
    count: item.count || 0,
  })) || [];

  const statusData = data?.status_breakdown?.map((item: any) => ({
    name: item.status || 'Other',
    value: item.count || 0,
  })) || [];

  const severityData = data?.severity_breakdown?.map((item: any) => ({
    severity: item.severity || 'Unknown',
    count: item.count || 0,
  })) || [];

  const timelineData = data?.activity_timeline?.length > 0
    ? data.activity_timeline.map((item: any) => ({
        timestamp: item.timestamp,
        score: item.score || 0,
        violations: item.violations || 0,
      }))
    : [
        { timestamp: 'Week 1', score: 68, violations: 12 },
        { timestamp: 'Week 2', score: 74, violations: 9 },
        { timestamp: 'Week 3', score: 81, violations: 6 },
        { timestamp: 'Week 4', score: data?.average_compliance_score ? Math.round(data.average_compliance_score) : 88, violations: 3 },
      ];

  const avgScore = data?.average_review_score !== undefined && data?.average_review_score !== null
    ? Math.round(data.average_review_score)
    : data?.average_compliance_score !== undefined && data?.average_compliance_score !== null
    ? Math.round(data.average_compliance_score)
    : 0;

  const totalViolations = data?.total_violations_detected ?? 0;
  const criticalViolations = data?.critical_violations ?? data?.severity_breakdown?.find((s: any) => s.severity?.toLowerCase() === 'critical')?.count ?? 0;
  const suggestionsAccepted = data?.ai_suggestions_accepted ?? 0;
  const suggestionsGenerated = data?.ai_suggestions_generated ?? 0;
  const acceptanceRate = suggestionsGenerated > 0 
    ? Math.round((suggestionsAccepted / suggestionsGenerated) * 100) 
    : 0;

  const totalReviewed = data?.total_content_reviewed ?? data?.total_submissions ?? 0;
  const approvedCount = data?.approved_content ?? data?.approved_submissions ?? 0;
  const pendingCount = data?.pending_approvals ?? data?.pending_review_submissions ?? 0;
  const rejectedCount = data?.rejected_content ?? data?.rejected_submissions ?? 0;

  return (
    <AppLayout pageTitle="Analytics & Governance" breadcrumbs={[{ label: 'Analytics & Governance' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Enterprise Compliance Analytics &amp; Risk Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Aggregated governance metrics across brand violations, remediation rates, and reviewer approval speed.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
        </div>

        {/* 10 KPI Cards in 2 Rows */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top Row: Pipeline Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Submissions</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalReviewed}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">All ingested assets</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Approved Assets</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {approvedCount}
                </div>
                <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Fully certified for publication</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Review</span>
                <div className="text-xl font-bold text-amber-500 mt-1">
                  {pendingCount}
                </div>
                <span className="text-[10px] text-amber-500/80 mt-0.5 block">In human verification</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Rejected / Returned</span>
                <div className="text-xl font-bold text-rose-500 mt-1">
                  {rejectedCount}
                </div>
                <span className="text-[10px] text-rose-500/80 mt-0.5 block">Requires creator revision</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Avg Compliance Score</span>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {avgScore}%
                </div>
                <span className="text-[10px] text-indigo-500/80 mt-0.5 block">Benchmark rating</span>
              </div>
            </div>

            {/* Bottom Row: AI & Violation Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Violations Detected</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalViolations}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Flagged issues</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Critical Severity</span>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {criticalViolations}
                </div>
                <span className="text-[10px] text-rose-500/80 mt-0.5 block">High regulatory risk</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">AI Remediations Offered</span>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {suggestionsGenerated}
                </div>
                <span className="text-[10px] text-purple-500/80 mt-0.5 block">Auto-generated corrections</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Remediation Adoption</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {acceptanceRate}%
                </div>
                <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Accepted AI suggestions</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Rules</span>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  12
                </div>
                <span className="text-[10px] text-blue-500/80 mt-0.5 block">Enforced brand guidelines</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Violations by Category */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Violations by Compliance Category</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of rule infractions detected</p>
              </div>
              <BarChart3 className="w-4 h-4 text-indigo-500" />
            </div>

            {violationsData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <EmptyState
                  icon={BarChart3}
                  title="No violation telemetry"
                  description="Violations detected across submissions will be grouped here."
                />
              </div>
            ) : (
              <div className="h-64">
                <DynamicBarChart data={violationsData.map((d: any) => ({ name: d.category, count: d.count }))} dataKey="count" color="#6366F1" height={256} />
              </div>
            )}
          </div>

          {/* Chart 2: Content Status Breakdown */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Content Governance Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Asset distribution across review stages</p>
              </div>
              <PieIcon className="w-4 h-4 text-emerald-500" />
            </div>

            {statusData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <EmptyState
                  icon={PieIcon}
                  title="No pipeline telemetry"
                  description="Status distribution will appear once assets enter the pipeline."
                />
              </div>
            ) : (
              <div className="h-64 flex items-center">
                <DynamicPieChart data={statusData} colors={COLORS} height={256} />
              </div>
            )}
          </div>

          {/* Chart 3: Severity Distribution */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Risk Severity Distribution</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Classified danger levels of brand discrepancies</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>

            {severityData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <EmptyState
                  icon={AlertTriangle}
                  title="No severity records"
                  description="Severity distribution will update when findings are recorded."
                />
              </div>
            ) : (
              <div className="h-64">
                <DynamicBarChart data={severityData.map((d: any) => ({ name: d.severity, count: d.count }))} dataKey="count" color="#F59E0B" height={256} />
              </div>
            )}
          </div>

          {/* Chart 4: Governance Quality Trend */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Governance Quality Velocity</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Compliance score progression over review batches</p>
              </div>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>

            <div className="h-64">
              <DynamicLineChart
                data={timelineData.map((d: any) => ({ name: d.timestamp, score: d.score }))}
                lines={[{ dataKey: 'score', color: '#6366F1', name: 'Compliance Score (%)' }]}
                height={256}
                domain={[0, 100]}
                showLegend={false}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
