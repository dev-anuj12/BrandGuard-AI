'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';
import { useToast } from '../../components/ui/Toast';

export default function ReportBugPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [bugId, setBugId] = useState('');
  const [form, setForm] = useState({
    title: '',
    email: '',
    component: 'content-review',
    severity: 'MEDIUM',
    steps: '',
    expected: '',
    actual: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.steps || !form.actual) {
      showToast('Please complete all required vulnerability/bug fields.', 'error');
      return;
    }
    const bId = `BUG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    setBugId(bId);
    setSubmitted(true);
    showToast(`Issue ${bId} filed with Security & QA team.`, 'success');
  };

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'Report a Bug' }]}
      badge="Quality &amp; Security"
      title="Report a Bug or Vulnerability"
      subtitle="Submit an issue report directly to our quality assurance and security response engineers."
    >
      <div className="max-w-2xl mx-auto">
        {submitted ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Issue #{bugId} Logged</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Thank you for reporting this issue. Our QA and security team will investigate and correlate it against system telemetry.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-block"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Issue Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="E.g., CSV export button on analytics page returns truncated headers"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reporter Email</label>
                <input
                  type="email"
                  placeholder="engineer@enterprise.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Component</label>
                <select
                  value={form.component}
                  onChange={(e) => setForm({ ...form, component: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="content-review">Compliance Review Engine</option>
                  <option value="domain-scanner">Domain Threat Scanner</option>
                  <option value="manager-dashboard">Manager Approvals Dashboard</option>
                  <option value="auth-rbac">Authentication &amp; RBAC</option>
                  <option value="analytics">Analytics &amp; Recharts</option>
                  <option value="security-vulnerability">Security Vulnerability</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="LOW">Low (Cosmetic / UI glitch)</option>
                  <option value="MEDIUM">Medium (Non-blocking bug)</option>
                  <option value="HIGH">High (Analysis failure)</option>
                  <option value="CRITICAL">Critical (Security flaw / crash)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Steps to Reproduce <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="1. Navigate to /analytics&#10;2. Click Export CSV&#10;3. Observe console error..."
                value={form.steps}
                onChange={(e) => setForm({ ...form, steps: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expected Behavior</label>
                <textarea
                  rows={2}
                  placeholder="CSV file should download with valid columns..."
                  value={form.expected}
                  onChange={(e) => setForm({ ...form, expected: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Actual Behavior <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Button triggers unhandled exception..."
                  value={form.actual}
                  onChange={(e) => setForm({ ...form, actual: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
            >
              Submit Bug Report
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

