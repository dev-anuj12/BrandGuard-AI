'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  BarChart3, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, RefreshCw, Sparkles, PieChart as PieIcon, Activity,
  AlertOctagon, CheckSquare, Layers, Award, Download, Filter,
  Building2, Calendar, FileText, ChevronRight
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
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  
  // Advanced Telemetry State
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [topGuidelines, setTopGuidelines] = useState<any[]>([]);
  const [brandPerformance, setBrandPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingReport, setExportingReport] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, brandsRes, trendsRes, topGuidelinesRes, brandPerfRes] = await Promise.all([
        api.getAnalytics(),
        api.getBrands().catch(() => []),
        api.getMonthlyTrends().catch(() => []),
        api.getTopGuidelines(6).catch(() => []),
        api.getBrandPerformance().catch(() => []),
      ]);

      setData(analyticsRes);
      setBrands(brandsRes || []);
      setMonthlyTrends(trendsRes || []);
      setTopGuidelines(topGuidelinesRes || []);
      setBrandPerformance(brandPerfRes || []);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
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

  // Monthly trends dataset for line chart
  const trendsChartData = monthlyTrends.length > 0
    ? monthlyTrends.map((t: any) => ({
        name: t.month,
        score: Math.round(t.avg_score || 0),
        submissions: t.submissions || 0,
        approved: t.approved || 0,
      }))
    : data?.activity_timeline?.length > 0
    ? data.activity_timeline.map((item: any) => ({
        name: item.timestamp,
        score: item.score || 0,
        submissions: item.violations || 0,
      }))
    : [];

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
  const avgReviewTime = data?.average_review_time_hours ? `${data.average_review_time_hours} hrs` : '< 2.4 hrs';

  const handleExportAnalyticsCSV = () => {
    const rows = [
      ['BRANDGUARD AI — GOVERNANCE ANALYTICS REPORT'],
      ['Generated At (UTC)', new Date().toISOString()],
      ['Organization', user?.organization || 'Enterprise'],
      ['Filter Brand', selectedBrand === 'all' ? 'All Brands' : selectedBrand],
      ['Date Range', dateRange],
      [],
      ['Metric', 'Value'],
      ['Total Submissions', totalReviewed],
      ['Approved Assets', approvedCount],
      ['Pending Review', pendingCount],
      ['Rejected / Returned', rejectedCount],
      ['Average Compliance Score', `${avgScore}%`],
      ['Total Violations Detected', totalViolations],
      ['Critical Severity Violations', criticalViolations],
      ['Average Review Turnaround', avgReviewTime],
      ['AI Remediations Offered', suggestionsGenerated],
      ['Remediation Adoption Rate', `${acceptanceRate}%`],
      [],
      ['Compliance Category', 'Violation Count'],
      ...violationsData.map((v: any) => [v.category, v.count]),
      [],
      ['Top Violated Guidelines', 'Category', 'Violation Count', 'Severity'],
      ...topGuidelines.map((g: any) => [g.rule_title, g.category, g.violation_count, g.severity]),
      [],
      ['Brand Performance', 'Code', 'Submissions', 'Approved', 'Score (%)', 'Status'],
      ...brandPerformance.map((b: any) => [b.name, b.code, b.submissions, b.approved, b.avg_compliance_score, b.status]),
    ];
    const sanitizeCell = (cell: any) => {
      const s = String(cell ?? '');
      if (s.length > 0 && ['=', '+', '-', '@'].includes(s[0])) {
        return `'${s}`;
      }
      return s;
    };
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((cell: any) => `"${sanitizeCell(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brandguard_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAuditReport = async () => {
    setExportingReport(true);
    try {
      const brandIdNum = selectedBrand !== 'all' ? parseInt(selectedBrand) : undefined;
      const report = await api.exportReport(brandIdNum);
      const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', jsonContent);
      link.setAttribute('download', `brandguard_audit_report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Failed to export audit report:', err);
    } finally {
      setExportingReport(false);
    }
  };

  return (
    <AppLayout pageTitle="Analytics & Governance" breadcrumbs={[{ label: 'Analytics & Governance' }]}>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-purple-900/35">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Advanced Brand Intelligence &amp; Governance Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-brand compliance telemetry, monthly trend benchmarks, top violated rules, and automated audit exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#150A26] border border-slate-200 dark:border-purple-800/40 rounded-lg px-2.5 py-1.5 shadow-sm text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter by brand workspace"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="dark:bg-[#150A26]">All Brand Workspaces</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="dark:bg-[#150A26]">
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#150A26] border border-slate-200 dark:border-purple-800/40 rounded-lg px-2.5 py-1.5 shadow-sm text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Filter by date range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="7d" className="dark:bg-[#150A26]">Last 7 Days</option>
                <option value="30d" className="dark:bg-[#150A26]">Last 30 Days</option>
                <option value="90d" className="dark:bg-[#150A26]">Last Quarter (90d)</option>
                <option value="all" className="dark:bg-[#150A26]">All Historical Data</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAuditReport}
              disabled={exportingReport}
              leftIcon={<FileText className={`w-3.5 h-3.5 ${exportingReport ? 'animate-spin' : 'text-indigo-500'}`} />}
            >
              {exportingReport ? 'Generating...' : 'Audit Report'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAnalyticsCSV}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadAnalytics}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* 10 Core KPI Cards in 2 Rows */}
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
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Submissions</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalReviewed}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Database-backed volume</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Approved Assets</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {approvedCount}
                </div>
                <span className="text-[10px] text-emerald-500/80 mt-0.5 block">Certified for release</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Reviews</span>
                <div className="text-xl font-bold text-amber-500 mt-1">
                  {pendingCount}
                </div>
                <span className="text-[10px] text-amber-500/80 mt-0.5 block">In human approval queue</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Rejected / Returned</span>
                <div className="text-xl font-bold text-rose-500 mt-1">
                  {rejectedCount}
                </div>
                <span className="text-[10px] text-rose-500/80 mt-0.5 block">Requires author revision</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Overall Compliance</span>
                <div className="text-xl font-bold text-indigo-600 dark:text-purple-400 mt-1">
                  {avgScore}%
                </div>
                <span className="text-[10px] text-indigo-500/80 mt-0.5 block">Weighted brand score</span>
              </div>
            </div>

            {/* Bottom Row: Violation & Operational Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Violations Flagged</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalViolations}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Guideline infractions</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Critical Severity</span>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {criticalViolations}
                </div>
                <span className="text-[10px] text-rose-500/80 mt-0.5 block">High regulatory risk</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Avg Review Turnaround</span>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {avgReviewTime}
                </div>
                <span className="text-[10px] text-blue-500/80 mt-0.5 block">Submission to decision</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">AI Remediation Adoption</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {acceptanceRate}%
                </div>
                <span className="text-[10px] text-emerald-500/80 mt-0.5 block">{suggestionsAccepted} / {suggestionsGenerated} applied</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Brand Rules</span>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {data?.active_guidelines_count ?? data?.total_guidelines ?? '—'}
                </div>
                <span className="text-[10px] text-purple-500/80 mt-0.5 block">Enforced knowledge base</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Monthly Compliance Trends & Brand-Wise Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Compliance Trends */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Monthly Compliance Trends (Score &amp; Volume)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">6-month trend of overall compliance score and asset volume</p>
              </div>
            </div>

            {trendsChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <EmptyState
                  icon={TrendingUp}
                  title="No trend timeline"
                  description="Score progression will appear after multiple submission cycles."
                />
              </div>
            ) : (
              <div className="h-64">
                <DynamicLineChart
                  data={trendsChartData}
                  lines={[
                    { dataKey: 'score', color: '#6366F1', name: 'Compliance Score (%)' },
                    { dataKey: 'submissions', color: '#10B981', name: 'Submissions' },
                  ]}
                  height={256}
                  domain={[0, 100]}
                />
              </div>
            )}
          </div>

          {/* Multi-Brand Performance */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  Multi-Brand Workspace Performance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cross-brand compliance rating and submission throughput</p>
              </div>
            </div>

            {brandPerformance.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No brand performance records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-purple-800/40 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Brand Workspace</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3 text-center">Submissions</th>
                      <th className="py-2.5 px-3 text-center">Approved</th>
                      <th className="py-2.5 px-3 text-right">Compliance Score</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {brandPerformance.map((brand: any) => (
                      <tr key={brand.brand_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {brand.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {brand.code}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300">
                          {brand.submissions}
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-medium">
                          {brand.approved}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-purple-400">
                          {Math.round(brand.avg_compliance_score)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            brand.status === 'EXCELLENT'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : brand.status === 'GOOD'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                              : brand.status === 'NEEDS_ATTENTION'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-[#150A26] dark:text-slate-300'
                          }`}>
                            {brand.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Most Frequently Violated Guidelines & Violation Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Frequently Violated Guidelines */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  Most Frequently Violated Guidelines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Top rules triggered during deterministic and AI evaluations</p>
              </div>
            </div>

            {topGuidelines.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                No guideline violations logged yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {topGuidelines.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-800/35">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-700 dark:text-slate-200 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.rule_title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-slate-600 dark:text-slate-300">Category: {item.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.severity?.toUpperCase() === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : item.severity?.toUpperCase() === 'HIGH'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {item.severity}
                      </span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{item.violation_count}</span>
                        <span className="text-[10px] text-slate-400 ml-1">hits</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Violations by Category */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  Violations by Category
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of rule infractions detected</p>
              </div>
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
        </div>

        {/* Section 3: Status Breakdown & Severity Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Governance Status */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-emerald-500" />
                  Content Governance Pipeline Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Asset distribution across review stages</p>
              </div>
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

          {/* Risk Severity Distribution */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200/80 dark:border-purple-900/35 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Risk Severity Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Classified danger levels of brand discrepancies</p>
              </div>
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
        </div>
      </div>
    </AppLayout>
  );
}
