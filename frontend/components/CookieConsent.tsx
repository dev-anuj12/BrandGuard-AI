'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, Sliders, ExternalLink } from 'lucide-react';

export interface CookiePreferences {
  necessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  consentTimestamp: string | null;
}

const STORAGE_KEY = 'brandguard_cookie_consent_v1';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  consentTimestamp: null,
};

export function getStoredCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCookiePreferences(prefs: CookiePreferences) {
  if (typeof window === 'undefined') return;
  const payload: CookiePreferences = {
    ...prefs,
    necessary: true,
    consentTimestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('brandguard-cookie-update', { detail: payload }));
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = getStoredCookiePreferences();
    if (!stored) {
      setShowBanner(true);
    } else {
      setPreferences(stored);
    }

    const handleOpenModal = () => setShowModal(true);
    window.addEventListener('brandguard-open-cookie-modal', handleOpenModal);
    return () => {
      window.removeEventListener('brandguard-open-cookie-modal', handleOpenModal);
    };
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      consentTimestamp: new Date().toISOString(),
    };
    saveCookiePreferences(allAccepted);
    setPreferences(allAccepted);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectOptional = () => {
    const essentialOnly: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      consentTimestamp: new Date().toISOString(),
    };
    saveCookiePreferences(essentialOnly);
    setPreferences(essentialOnly);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
    setShowModal(false);
  };

  return (
    <>
      {/* 1. Cookie Floating Bottom Banner */}
      {showBanner && (
        <aside
          aria-label="Cookie and Privacy Consent Banner"
          role="region"
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 p-5 rounded-2xl bg-white/95 dark:bg-[#120924]/95 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 shadow-2xl text-slate-900 dark:text-slate-100 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#1A0D30] border border-indigo-200/60 dark:border-purple-500/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-purple-400 mt-0.5">
              <Cookie className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  Privacy &amp; Cookie Preferences
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                BrandGuard AI uses essential local storage to authenticate sessions and keep your workspace secure. We request your consent before enabling optional telemetry to improve brand governance algorithms.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-[#150A26] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 underline transition"
                >
                  Customize
                </button>
                <Link
                  href="/cookies"
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition ml-auto inline-flex items-center gap-1"
                >
                  <span>Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Detailed Cookie Preferences Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#090414] border border-slate-200 dark:border-purple-900/35 shadow-2xl p-6 space-y-5 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-purple-900/35">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
                <h2 id="cookie-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Cookie &amp; Tracking Preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-purple-950/40 transition"
                aria-label="Close preferences modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Customize which categories of storage and analytics you authorize while using the BrandGuard AI platform. Optional categories remain disabled until you actively consent.
            </p>

            <div className="space-y-3.5">
              {/* Category 1: Necessary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">Strictly Necessary</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#150A26] text-slate-600 dark:text-slate-400">
                      Required
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Essential for secure session handling, JWT authentication persistence, cross-tenant isolation, and CSRF protection. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="rounded border-slate-300 text-indigo-600 cursor-not-allowed mt-1"
                  aria-label="Strictly Necessary Cookies (Always Active)"
                />
              </div>

              {/* Category 2: Functional */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">Functional Preferences</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Remembers user interface customizations such as active theme (dark/light), sidebar collapse state, and table filter configurations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-functional"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                  className="rounded border-slate-300 dark:border-purple-800/40 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer mt-1"
                />
              </div>

              {/* Category 3: Analytics */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">Performance &amp; Telemetry</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Aggregated, pseudonymized telemetry measuring compliance review latency, scanner error rates, and load performance. No personal content is shared.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-analytics"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="rounded border-slate-300 dark:border-purple-800/40 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer mt-1"
                />
              </div>

              {/* Category 4: Marketing */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">Marketing &amp; Conversion</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Used on public marketing pages to evaluate campaign reach and enterprise demo attribution. Disabled inside compliance workspace dashboards.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="pref-marketing"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="rounded border-slate-300 dark:border-purple-800/40 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-purple-900/35 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-950/40 transition"
              >
                Reject Optional
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#150A26] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

