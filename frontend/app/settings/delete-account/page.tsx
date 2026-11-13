'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import AppLayout from '../../../components/AppLayout';
import { api, getCurrentUser, clearAuthSession } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'DELETE') {
      showToast('Please type DELETE in capital letters to confirm.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.requestAccountDeletion();
      showToast('Account deactivated and deletion request submitted.', 'success');
      clearAuthSession();
      router.push('/login');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit deletion request.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout pageTitle="Delete Account">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-6 h-6" />
            <span>Delete Account &amp; Request Data Erasure</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Initiate self-service account deactivation and data erasure upon request.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#120924]/90 backdrop-blur-xl border border-rose-200 dark:border-rose-900/40 space-y-4 shadow-sm">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Warning: This action cannot be undone</span>
            </div>
            <p className="leading-relaxed">
              Deactivating your account will immediately revoke all JWT session tokens and access to your organization&apos;s compliance workspace. Historical audit logs will be pseudonymous to preserve mandatory regulatory financial records.
            </p>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                To confirm deletion for <strong>{currentUser?.email}</strong>, type <span className="font-mono text-rose-600 font-bold">DELETE</span> below:
              </label>
              <input
                type="text"
                required
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-purple-900/35 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/settings"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#120924]/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                Cancel &amp; Keep Account
              </Link>
              <button
                type="submit"
                disabled={loading || confirmText !== 'DELETE'}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Account Deletion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

