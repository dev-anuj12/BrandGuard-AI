'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../../components/AppLayout';
import { api } from '../../../lib/api';
import { ThreatRiskBadge } from '../../../components/Badges';
import { 
  Globe, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, 
  Search, ExternalLink, RefreshCw, Lock, Unlock, Server, 
  CheckCircle2, XCircle, FileWarning, HelpCircle, Layers, Zap
} from 'lucide-react';

interface Finding {
  rule_id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
}

interface DomainScanReport {
  id?: number;
  scanned_url: string;
  domain_name: string;
  ip_address?: string;
  is_https: boolean;
  ssl_valid: boolean;
  ssl_issuer?: string;
  ssl_expiry_days?: number;
  status_code?: number;
  redirect_count: number;
  similarity_score: number;
  risk_score: number;
  risk_level: string;
  homoglyphs_detected: string[];
  typosquatting_detected: boolean;
  credential_harvesting_detected: boolean;
  brand_keywords_found: string[];
  findings: Finding[];
  recommended_action: string;
  threat_id?: number;
  threat_code?: string;
  created_at: string;
}

const PRESET_TARGETS = [
  {
    name: 'FinNova Official Domain',
    url: 'https://finnova.com',
    type: 'Safe / Canonical',
    color: 'emerald',
  },
  {
    name: 'Phishing Portal Lookalike',
    url: 'https://finnova-secure-login.cc',
    type: 'Critical / Phishing',
    color: 'rose',
  },
  {
    name: 'Typo-Squatting Clone',
    url: 'https://finova-secure-account.xyz',
    type: 'High / Lookalike',
    color: 'amber',
  },
  {
    name: 'Cyrillic Homoglyph Mimic',
    url: 'https://finn\u043ev\u0430-banking.top',
    type: 'Critical / Homoglyph',
    color: 'purple',
  },
  {
    name: 'SSRF Attack Vector (Blocked)',
    url: 'http://127.0.0.1:8000/admin',
    type: 'Loopback / Blocked',
    color: 'slate',
  },
];

export default function DomainProtectionPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeReport, setActiveReport] = useState<DomainScanReport | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_scans: 0,
    high_risk_threats_detected: 0,
    safe_domains_verified: 0,
    average_risk_score: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadData = async () => {
    try {
      const [histData, statsData] = await Promise.all([
        api.getDomainScanHistory(30, 0),
        api.getDomainScanStats(),
      ]);
      setHistory(histData || []);
      setStats(statsData || {});
    } catch (err) {
      console.error('Failed to load domain protection data:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async (urlToScan?: string) => {
    const url = (urlToScan || targetUrl).trim();
    if (!url) return;

    setScanning(true);
    setErrorMessage(null);

    try {
      const result = await api.scanDomain(url, autoEscalate);
      setActiveReport(result);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Domain scan failed. Target could not be inspected.');
      setActiveReport(null);
    } finally {
      setScanning(false);
    }
  };

  const loadPastReport = async (scanId: number) => {
    try {
      setScanning(true);
      setErrorMessage(null);
      const detail = await api.getDomainScanDetail(scanId);
      setActiveReport(detail);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load report.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <AppLayout
      pageTitle="Website & Lookalike Domain Protection"
      breadcrumbs={[
        { label: 'Overview', href: '/dashboard' },
        { label: 'Domain Protection', href: '/protection/domains' },
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Website & Domain Protection
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Autonomous SSRF-guarded inspection for lookalike domains, Cyrillic homoglyphs, credential harvesting, and suspicious TLS certs.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Monitored Brand: <strong className="text-slate-900 dark:text-white font-semibold">finnova.com</strong></span>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Inspected
              </span>
              <Globe className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total_scans}
              </span>
              <span className="text-xs text-slate-400">domains</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Active Threats Flagged
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.high_risk_threats_detected}
              </span>
              <span className="text-xs text-slate-400">risk &ge; 60%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Safe Brand Assets
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.safe_domains_verified}
              </span>
              <span className="text-xs text-slate-400">verified</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Threat Score
              </span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.average_risk_score}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Scanner Form & Quick Presets */}
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-1.5">
                Target Domain or Hostname Inspection
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="e.g. finnova-secure-login.cc, finova-banking.xyz, or full https:// URL"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
                <button
                  onClick={() => handleScan()}
                  disabled={scanning || !targetUrl.trim()}
                  className="px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center space-x-2 shrink-0"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Inspecting...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Inspect Domain</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Options & Security Guard indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={autoEscalate}
                  onChange={(e) => setAutoEscalate(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                />
                <span>Auto-register detected threats (&ge; 60% risk) into Threat Intelligence Center</span>
              </label>

              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>SSRFGuard active (Private IP & Loopback blocking enabled)</span>
              </div>
            </div>

            {/* Dev Presets Row */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                  Quick Test Targets (Dev Only):
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TARGETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTargetUrl(p.url);
                        handleScan(p.url);
                      }}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {p.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error / SSRF Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <strong className="font-semibold">Inspection Blocked by Security Policy:</strong>
              <p className="mt-0.5 text-rose-700 dark:text-rose-400 font-mono text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Active Scan Diagnostic Report Card */}
        {activeReport && (
          <div className="rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden animate-in fade-in duration-300">
            {/* Report Header Bar */}
            <div className={`p-5 border-b ${
              activeReport.risk_score >= 80 
                ? 'bg-rose-500/10 border-rose-200 dark:border-rose-900/60' 
                : activeReport.risk_score >= 60
                ? 'bg-amber-500/10 border-amber-200 dark:border-amber-900/60'
                : 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/60'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <ThreatRiskBadge risk={activeReport.risk_level as any} />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                      {activeReport.domain_name}
                    </h2>
                    {activeReport.threat_code && (
                      <Link 
                        href="/threats"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:underline"
                      >
                        <span>{activeReport.threat_code}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Scanned URL: <span className="font-mono">{activeReport.scanned_url}</span> &bull; IP: <span className="font-mono">{activeReport.ip_address || 'Unresolved'}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Brand Similarity
                    </span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {activeReport.similarity_score}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Calculated Risk
                    </span>
                    <p className={`text-2xl font-black ${
                      activeReport.risk_score >= 80 ? 'text-rose-600 dark:text-rose-400' :
                      activeReport.risk_score >= 60 ? 'text-amber-600 dark:text-amber-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {activeReport.risk_score}
                      <span className="text-xs font-normal text-slate-400"> / 100</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Metrics Matrix */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">SSL Certificate</span>
                <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                  {activeReport.ssl_valid ? (
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span>{activeReport.ssl_issuer || 'No Certificate'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Homoglyph Attack</span>
                <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                  {activeReport.homoglyphs_detected?.length > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{activeReport.homoglyphs_detected.length} Detected</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>None</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Typosquatting</span>
                <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                  {activeReport.typosquatting_detected ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>High Deviation</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Clean</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400">Credential Form</span>
                <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                  {activeReport.credential_harvesting_detected ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center space-x-1">
                      <FileWarning className="w-3.5 h-3.5" />
                      <span>Detected (Phishing)</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Not Found</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Action Box */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-amber-500/5">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Recommended Remediation Action
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {activeReport.recommended_action}
              </p>
            </div>

            {/* Explainable Findings List */}
            <div className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Explainable Technical Evidence & Findings ({activeReport.findings?.length || 0})
              </h3>

              <div className="space-y-3">
                {activeReport.findings?.map((finding, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          finding.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400' :
                          finding.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-400' :
                          finding.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400' :
                          'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {finding.severity}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {finding.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {finding.rule_id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {finding.description}
                    </p>

                    <div className="text-xs bg-slate-100 dark:bg-slate-800/80 p-2 rounded border border-slate-200/60 dark:border-slate-700/60 font-mono text-slate-700 dark:text-slate-300">
                      <strong>Evidence:</strong> {finding.evidence}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      &bull; Action: {finding.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historical Scans Table */}
        <div className="rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Domain Inspection History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Past automated and manual scans with risk scoring and threat attribution
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Refresh History"
              aria-label="Refresh domain inspection history"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Scanned Domain / URL</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Similarity</th>
                  <th className="py-3 px-3">Risk Score</th>
                  <th className="py-3 px-3">Linked Threat</th>
                  <th className="py-3 px-3">Inspected At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {loadingHistory ? 'Loading history...' : 'No domain scans recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  history.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white font-mono">
                          {scan.domain_name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs font-mono">
                          {scan.scanned_url}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {scan.ip_address || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {scan.similarity_score}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          scan.risk_score >= 80 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400' :
                          scan.risk_score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                        }`}>
                          {scan.risk_score} / 100
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {scan.threat_code ? (
                          <Link
                            href="/threats"
                            className="font-mono text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                          >
                            {scan.threat_code}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(scan.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => loadPastReport(scan.id)}
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[11px] font-medium"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

