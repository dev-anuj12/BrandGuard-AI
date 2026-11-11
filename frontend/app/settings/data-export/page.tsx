'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import AppLayout from '../../../components/AppLayout';
import { api, getCurrentUser } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

export default function DataExportPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exportedData, setExportedData] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await api.exportUserData();
      setExportedData(data);
      
      // Auto-trigger browser file download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `brandguard-data-export-${currentUser?.email || 'user'}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Data export compiled and downloaded successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to export account data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout pageTitle="Export My Data">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Export My Data
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Download a portable, machine-readable JSON copy of your personal data, content submissions, and audit trail for your records.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Complete Machine-Readable Export</h2>
              <p className="text-xs text-slate-500">Includes user account profile, submitted marketing collateral, review versions, and audit logs.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-900 dark:text-white">Export Summary for {currentUser?.email || 'Account'}:</span>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Organization Membership: <strong>{currentUser?.organization || 'Enterprise'}</strong></li>
              <li>Role Context: <strong>{currentUser?.role || 'User'}</strong></li>
              <li>Output Format: <strong>JSON (UTF-8 Encoded)</strong></li>
            </ul>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Compiling Export...' : 'Download My Data (JSON)'}</span>
            </button>
            <Link
              href="/settings"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
            >
              Back to Settings
            </Link>
          </div>
        </div>

        {exportedData && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">Export Successfully Generated</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-[11px] max-h-60 overflow-y-auto">
              {JSON.stringify(exportedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

