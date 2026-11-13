'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';
import { useToast } from '../../components/ui/Toast';

export default function SubmitTicketPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    severity: 'MEDIUM',
    category: 'compliance-engine',
    subject: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.description) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    const tNum = `BG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketNumber(tNum);
    setSubmitted(true);
    showToast(`Support ticket ${tNum} created successfully.`, 'success');
  };

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'Submit a Ticket' }]}
      badge="Technical Assistance"
      title="Open a Support Incident"
      subtitle="Tracked technical issue submission routed to BrandGuard AI Tier-2/Tier-3 engineers."
    >
      <div className="max-w-2xl mx-auto">
        {submitted ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ticket #{ticketNumber} Created</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Our engineering support team has received your inquiry regarding <strong>&quot;{form.subject}&quot;</strong>. Updates will be emailed to <strong>{form.email}</strong> according to your organization&apos;s support SLA.
            </p>
            <div className="pt-2">
              <Link
                href="/support"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-block"
              >
                Back to Support Services
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Morgan Vance"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="morgan@enterprise.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Severity Level</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="LOW">Low (General guidance / question)</option>
                  <option value="MEDIUM">Medium (Workflow disruption / edge case)</option>
                  <option value="HIGH">High (Analysis engine degraded)</option>
                  <option value="CRITICAL">Critical (Service outage / security event)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subsystem Affected</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="compliance-engine">Compliance Review Pipeline</option>
                  <option value="domain-scanner">Homoglyph Domain Scanner</option>
                  <option value="rbac-workflow">Manager Approval Workflow</option>
                  <option value="api-integration">REST API / Webhooks</option>
                  <option value="account-billing">Account &amp; Billing Access</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Subject / Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="E.g. Regex rule failing to flag specific yield assertion"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detailed Description &amp; Repro Steps <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Please describe the observed behavior, steps to reproduce, and any relevant content ID..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Submit Ticket to Operations
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

