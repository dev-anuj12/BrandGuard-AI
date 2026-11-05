'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../../components/AppLayout';
import { api } from '../../../lib/api';
import { ThreatRiskBadge, ThreatStatusBadge } from '../../../components/Badges';
import { 
  Share2, ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, 
  RefreshCw, CheckCircle2, XCircle, Search, User, MessageCircle, 
  Send, Layers, Zap, Ban, BadgeCheck, FileText, Lock
} from 'lucide-react';

interface Finding {
  rule_id: string;
  severity: string;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
}

interface SocialScanReport {
  platform: string;
  handle: string;
  display_name: string;
  is_verified: boolean;
  profile_url: string;
  followers_count?: number;
  similarity_score: number;
  risk_score: number;
  risk_level: string;
  scam_intent_detected: boolean;
  findings: Finding[];
  recommended_action: string;
  threat_id?: number;
  threat_code?: string;
}

const PRESET_PROFILES = [
  {
    name: 'Fake Telegram Support Desk',
    platform: 'telegram',
    handle: 'finnova_support_desk',
    display_name: 'FinNova Official Support Desk',
    bio: 'Official 24/7 Support Desk. DM for wallet recovery, transaction reversal, and KYC validation.',
    followers: 24,
    following: 380,
    is_verified: false,
    tag: 'Critical / Fake Support',
    color: 'rose',
  },
  {
    name: 'Crypto Airdrop Twitter Bot',
    platform: 'twitter',
    handle: 'finnova_airdrop_bot',
    display_name: 'FinNova Airdrop Rewards',
    bio: 'Official celebratory FinNova airdrop! Connect your wallet and send 0.1 ETH to verify account for 5,000 FNV bonus.',
    followers: 12,
    following: 890,
    is_verified: false,
    tag: 'Critical / Scam Lure',
    color: 'amber',
  },
  {
    name: 'Cyrillic Homoglyph Mimic',
    platform: 'twitter',
    handle: 'finn\u0430va_care',
    display_name: 'FinNova Customer Care',
    bio: 'FinNova Technologies assistance representative. Direct message us your account issues.',
    followers: 5,
    following: 120,
    is_verified: false,
    tag: 'High / Homoglyph',
    color: 'purple',
  },
  {
    name: 'Official Verified Brand Profile',
    platform: 'twitter',
    handle: 'finnovahq',
    display_name: 'FinNova Financial Technologies',
    bio: 'Official corporate account of FinNova Financial Technologies. Powering next-gen financial intelligence.',
    followers: 48200,
    following: 142,
    is_verified: true,
    tag: 'Safe / Whitelisted',
    color: 'emerald',
  },
];

export default function SocialProtectionPage() {
  const [platform, setPlatform] = useState('telegram');
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bioText, setBioText] = useState('');
  const [followers, setFollowers] = useState<number | ''>('');
  const [following, setFollowing] = useState<number | ''>('');
  const [isVerified, setIsVerified] = useState(false);
  const [autoEscalate, setAutoEscalate] = useState(true);

  const [scanning, setScanning] = useState(false);
  const [activeReport, setActiveReport] = useState<SocialScanReport | null>(null);
  const [threats, setThreats] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_social_threats: 0,
    critical_high_threats: 0,
    under_investigation: 0,
    takedowns_resolved: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingThreats, setLoadingThreats] = useState(true);

  const loadData = async () => {
    try {
      const [threatsData, statsData] = await Promise.all([
        api.getSocialThreats(),
        api.getSocialStats(),
      ]);
      setThreats(threatsData || []);
      setStats(statsData || {});
    } catch (err) {
      console.error('Failed to load social protection data:', err);
    } finally {
      setLoadingThreats(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async (preset?: typeof PRESET_PROFILES[0]) => {
    const targetPlatform = preset ? preset.platform : platform;
    const targetHandle = preset ? preset.handle : handle;
    const targetDisplay = preset ? preset.display_name : displayName;
    const targetBio = preset ? preset.bio : bioText;
    const targetFollowers = preset ? preset.followers : (followers === '' ? undefined : Number(followers));
    const targetFollowing = preset ? preset.following : (following === '' ? undefined : Number(following));
    const targetVerified = preset ? preset.is_verified : isVerified;

    if (!targetHandle.trim()) {
      setErrorMessage('Please provide a profile handle to scan.');
      return;
    }

    setScanning(true);
    setErrorMessage(null);

    try {
      const report = await api.scanSocialProfile({
        platform: targetPlatform,
        handle: targetHandle,
        display_name: targetDisplay,
        bio_text: targetBio,
        followers_count: targetFollowers,
        following_count: targetFollowing,
        is_verified: targetVerified,
        auto_create_threat: autoEscalate,
      });

      setActiveReport(report);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Social profile inspection failed.');
      setActiveReport(null);
    } finally {
      setScanning(false);
    }
  };

  const applyPreset = (p: typeof PRESET_PROFILES[0]) => {
    setPlatform(p.platform);
    setHandle(p.handle);
    setDisplayName(p.display_name);
    setBioText(p.bio);
    setFollowers(p.followers);
    setFollowing(p.following);
    setIsVerified(p.is_verified);
    handleScan(p);
  };

  return (
    <AppLayout
      pageTitle="Social Media Impersonation Protection"
      breadcrumbs={[
        { label: 'Overview', href: '/dashboard' },
        { label: 'Social Protection', href: '/protection/social' },
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Social Media Impersonation Protection
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Heuristic detection of unauthorized brand handles, fake customer support channels, bot swarms, and financial scam bio language.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Canonical Brand Handle: <strong className="text-slate-900 dark:text-white font-semibold">@finnovahq</strong></span>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Flagged Accounts
              </span>
              <Share2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total_social_threats}
              </span>
              <span className="text-xs text-slate-400">profiles</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Critical & High Threats
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.critical_high_threats}
              </span>
              <span className="text-xs text-slate-400">scam / bots</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Investigating
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.under_investigation}
              </span>
              <span className="text-xs text-slate-400">in triage</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Takedowns Resolved
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.takedowns_resolved}
              </span>
              <span className="text-xs text-slate-400">accounts closed</span>
            </div>
          </div>
        </div>

        {/* Profile Scanner Form & Quick Presets */}
        <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Search className="w-4 h-4 text-indigo-500" />
              <span>Social Profile Diagnostic Scanner</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Social Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="telegram">Telegram (@channel / @user)</option>
                  <option value="twitter">X / Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Profile Handle / Username
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. finnova_support_desk"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. FinNova Official Support"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Biography / Description Text
              </label>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={2}
                placeholder="Paste the profile bio text or description to scan for scam intent, fake support lures, or seed phrase requests..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Followers Count
                </label>
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 25"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Following Count
                </label>
                <input
                  type="number"
                  value={following}
                  onChange={(e) => setFollowing(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 350"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span>Has Verified Badge (Blue/Gold Check)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoEscalate}
                    onChange={(e) => setAutoEscalate(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span>Auto-escalate threat (&ge; 60%)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleScan()}
                disabled={scanning || !handle.trim()}
                className="px-6 py-2.5 rounded-lg font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center space-x-2"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Profile...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Profile</span>
                  </>
                )}
              </button>
            </div>

            {/* Dev Presets Row */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                  Quick Test Targets (Dev Only):
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PROFILES.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {p.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <strong className="font-semibold">Inspection Error:</strong>
              <p className="mt-0.5 text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Diagnostic Report Card */}
        {activeReport && (
          <div className="rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden animate-in fade-in duration-300">
            {/* Header Banner */}
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
                      {activeReport.handle}
                    </h2>
                    {activeReport.is_verified && (
                      <span title="Platform Verified">
                        <BadgeCheck className="w-4 h-4 text-sky-500" />
                      </span>
                    )}
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
                    Platform: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeReport.platform}</span> &bull; Display: <span className="font-medium text-slate-700 dark:text-slate-300">"{activeReport.display_name}"</span> &bull; URL: <a href={activeReport.profile_url} target="_blank" rel="noopener noreferrer" className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline">{activeReport.profile_url}</a>
                  </p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Handle Similarity
                    </span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {activeReport.similarity_score}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Impersonation Risk
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

            {/* Recommended Action */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-amber-500/5">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Enforcement & Remediation Playbook
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {activeReport.recommended_action}
              </p>
            </div>

            {/* Findings */}
            <div className="p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Explainable Technical Evidence & Violations ({activeReport.findings?.length || 0})
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

        {/* Flagged Accounts Registry Table */}
        <div className="rounded-xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Social Impersonation Threat Registry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active social media impersonators, fake support desks, and phishing accounts
              </p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Refresh Registry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Threat Code</th>
                  <th className="py-3 px-3">Account Title / Handle</th>
                  <th className="py-3 px-3">Profile URL</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Detected At</th>
                  <th className="py-3 px-4 text-right">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {threats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      {loadingThreats ? 'Loading registry...' : 'No social media threats registered.'}
                    </td>
                  </tr>
                ) : (
                  threats.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href="/threats"
                          className="font-mono text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                        >
                          {t.threat_code}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {t.explanation}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        <a 
                          href={t.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                        >
                          <span className="truncate max-w-[180px]">{t.source_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <ThreatRiskBadge risk={t.risk_level} />
                      </td>
                      <td className="py-3 px-3">
                        <ThreatStatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(t.detected_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href="/threats"
                          className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[11px] font-medium"
                        >
                          View in Intel
                        </Link>
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

