'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Database,
  Cpu,
  Sun,
  Moon,
  LogOut,
  Settings,
  Building2,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';
import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { api, getCurrentUser, clearAuthSession } from '../../lib/api';
import { useTheme } from '../../components/ThemeProvider';

type ThemeOption = 'light' | 'dark' | 'system';

interface CurrentUser {
  name?: string;
  email?: string;
  role?: string;
  organization?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoadingUser(false);
  }, []);

  const handleSignOut = () => {
    clearAuthSession();
    showToast('Signed out successfully.', 'success');
    router.push('/login');
  };

  const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Settings className="w-4 h-4" /> },
  ];

  const roleBadgeColor = (role?: string) => {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      case 'manager':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  return (
    <AppLayout pageTitle="Account Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <div className="max-w-3xl mx-auto space-y-8 py-6 px-4 sm:px-0">

        {/* ── User Identity Card ───────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              User Profile
            </h2>
          </div>
          <div className="px-6 py-5">
            {loadingUser ? (
              <div className="animate-pulse flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold select-none">
                  {currentUser?.name
                    ? currentUser.name.charAt(0).toUpperCase()
                    : currentUser?.email?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 truncate">
                    {currentUser?.name ?? 'Unknown User'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email ?? '—'}
                  </p>
                  {currentUser?.role && (
                    <span
                      className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(currentUser.role)}`}
                    >
                      <Shield className="w-3 h-3" />
                      {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Active Workspace ─────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Active Workspace
            </h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-indigo-500 dark:text-indigo-400 mb-0.5">
                  Enterprise Brand Context
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {currentUser?.organization || 'Enterprise Brand'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  All brand compliance checks are evaluated against this organization's brand guidelines.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                Workspace context is set by your organization administrator. Contact your admin to change it.
              </span>
            </div>
          </div>
        </section>

        {/* ── Theme Preference ─────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Theme Preference
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Choose how BrandGuard AI Platform appears to you.
            </p>
            <div className="flex gap-3 flex-wrap">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    showToast(`Theme set to ${opt.label}.`, 'success');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                    ${
                      theme === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                >
                  {opt.icon}
                  {opt.label}
                  {theme === opt.value && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Engine Status ─────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              AI Engine Status
            </h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Cpu className="w-4 h-4 text-indigo-500" />,
                  label: 'AI Provider',
                  value: 'Rule-Based + LLM (Configurable)',
                },
                {
                  icon: <Database className="w-4 h-4 text-indigo-500" />,
                  label: 'Database',
                  value: 'PostgreSQL / SQLite (Development)',
                },
                {
                  icon: <ExternalLink className="w-4 h-4 text-indigo-500" />,
                  label: 'API Version',
                  value: 'v1.0',
                },
                {
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                  label: 'Status',
                  value: null,
                  badge: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"
                >
                  <span className="mt-0.5">{item.icon}</span>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {item.label}
                    </dt>
                    {item.badge ? (
                      <dd className="mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Operational
                        </span>
                      </dd>
                    ) : (
                      <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                        {item.value}
                      </dd>
                    )}
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Privacy & Data Governance ──────────────────── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Privacy, Billing &amp; Data Governance
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <button
              type="button"
              onClick={() => router.push('/settings/security')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition space-y-1"
            >
              <span className="font-bold text-slate-900 dark:text-white block">Security &amp; 2FA</span>
              <span className="text-[11px] text-slate-400 block">Manage password and access</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/settings/billing')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition space-y-1"
            >
              <span className="font-bold text-slate-900 dark:text-white block">Billing &amp; Plan</span>
              <span className="text-[11px] text-slate-400 block">Subscription &amp; quotas</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/settings/data-export')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-left transition space-y-1"
            >
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Export My Data</span>
              <span className="text-[11px] text-slate-400 block">Download audit archive (JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/settings/delete-account')}
              className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:border-rose-500 text-left transition space-y-1"
            >
              <span className="font-bold text-rose-600 dark:text-rose-400 block">Delete Account</span>
              <span className="text-[11px] text-slate-400 block">Data erasure &amp; deactivation</span>
            </button>
          </div>
        </section>

        {/* ── Account Actions ───────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Account Actions
            </h2>
          </div>
          <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </section>

        {/* ── Footer note ───────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pb-4">
          BrandGuard AI Platform &mdash; Enterprise Brand Compliance Suite
        </p>

      </div>
    </AppLayout>
  );
}
