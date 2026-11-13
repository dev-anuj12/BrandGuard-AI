'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sliders, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';
import { getStoredCookiePreferences, saveCookiePreferences, CookiePreferences } from '../../components/CookieConsent';
import { useToast } from '../../components/ui/Toast';

export default function CookiePreferencesPage() {
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    consentTimestamp: null,
  });

  useEffect(() => {
    const stored = getStoredCookiePreferences();
    if (stored) {
      setPreferences(stored);
    }
  }, []);

  const handleSave = () => {
    saveCookiePreferences(preferences);
    showToast('Cookie preferences updated successfully.', 'success');
  };

  const handleResetToDefault = () => {
    const resetPrefs: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      consentTimestamp: new Date().toISOString(),
    };
    setPreferences(resetPrefs);
    saveCookiePreferences(resetPrefs);
    showToast('Preferences reset to strict essential storage only.', 'info');
  };

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Cookie Preferences' }]}
      badge="Privacy Controls"
      title="Cookie Preferences Manager"
      subtitle="Manage your consent for local storage and telemetry tracking categories and privacy preferences."
      lastUpdated="November 7, 2026"
    >
      <div className="max-w-2xl space-y-6">
        {preferences.consentTimestamp && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-[#1A0D30] border border-indigo-200 dark:border-purple-500/30 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-purple-400" />
              <span>Consent recorded on: <strong>{new Date(preferences.consentTimestamp).toLocaleString()}</strong></span>
            </div>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-indigo-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Necessary */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white">Strictly Necessary Storage</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#120924]/90 text-slate-600 dark:text-slate-400">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Mandatory for user authentication, API token persistence, cross-tenant isolation, and CSRF defense.
              </p>
            </div>
            <input type="checkbox" checked={true} disabled={true} className="mt-1 rounded cursor-not-allowed text-indigo-600" />
          </div>

          {/* Functional */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Functional Preferences</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Retains UI theme selection, active table sort options, and workflow dashboard layout customizations.
              </p>
            </div>
            <input
              type="checkbox"
              id="pref-functional-page"
              checked={preferences.functional}
              onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
              className="mt-1 rounded h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Performance &amp; Telemetry</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Aggregated, anonymized statistics evaluating scanner latency, AI review completion speed, and system error rates.
              </p>
            </div>
            <input
              type="checkbox"
              id="pref-analytics-page"
              checked={preferences.analytics}
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="mt-1 rounded h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Marketing */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">Marketing &amp; Attribution</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Measures conversion on public landing pages and enterprise demo inquiries. Never active inside workspace dashboards.
              </p>
            </div>
            <input
              type="checkbox"
              id="pref-marketing-page"
              checked={preferences.marketing}
              onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
              className="mt-1 rounded h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <Link href="/cookies" className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline">
            Read complete Cookie Policy &rarr;
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}

