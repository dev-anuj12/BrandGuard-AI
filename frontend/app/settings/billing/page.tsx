'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import AppLayout from '../../../components/AppLayout';
import { getCurrentUser } from '../../../lib/api';

export default function BillingSettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  return (
    <AppLayout pageTitle="Billing & Subscription">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Billing &amp; Subscription Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review active tier entitlements, usage limits, and enterprise payment arrangements.
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                Active Tier
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Professional Enterprise Tier</h2>
              <p className="text-xs text-slate-500">
                Organization: <strong>{currentUser?.organization || 'Enterprise'}</strong> &bull; Renews on Nov 30, 2026
              </p>
            </div>
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Change Tier Plan &rarr;
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">Seat Allocation</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">12 / 50</span>
              <span className="text-[10px] text-slate-400 block">Active Team Members</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">Compliance Scans</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">Unlimited</span>
              <span className="text-[10px] text-slate-400 block">Deterministic + LLM</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block text-[11px]">Perimeter Defense</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              <span className="text-[10px] text-slate-400 block">Homoglyph + Threat Scanners</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

