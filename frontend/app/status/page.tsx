'use client';

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';
import { api } from '../../lib/api';

export default function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.checkHealth();
      if (data && data.status === 'healthy') {
        setHealthy(true);
      } else {
        setHealthy(false);
      }
    } catch (err: any) {
      setHealthy(false);
      setErrorMessage(err?.message || 'Unable to reach backend API');
    } finally {
      setLoading(false);
      setLastCheck(new Date().toLocaleString());
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'System Status' }]}
      badge="System Health"
      title="System Status"
      subtitle="Live backend API health check status."
    >
      <div className="space-y-6 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Real Status Banner */}
        <div className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${
          loading
            ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
            : healthy
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${
              loading
                ? 'bg-slate-400 animate-pulse'
                : healthy
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-rose-500'
            }`} />
            <div>
              <h3 className={`font-bold text-base ${
                loading
                  ? 'text-slate-800 dark:text-slate-200'
                  : healthy
                  ? 'text-emerald-900 dark:text-emerald-200'
                  : 'text-rose-900 dark:text-rose-200'
              }`}>
                {loading
                  ? 'Checking Backend API...'
                  : healthy
                  ? 'Backend API: Healthy'
                  : 'Backend API: Unreachable'}
              </h3>
              {lastCheck && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Last verified: {lastCheck}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check Now</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
            {errorMessage}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
