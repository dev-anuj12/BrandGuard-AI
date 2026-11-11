'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';
import { useToast } from '../../components/ui/Toast';

export default function DemoPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '10-50',
    primaryGoal: 'compliance-review',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Demo request received. Our solution architect will reach out shortly.', 'success');
  };

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Request a Demo' }]}
      badge="Enterprise Walkthrough"
      title="Experience BrandGuard AI Live"
      subtitle="Schedule a customized 30-minute demonstration tailored to your organization's regulatory challenges and brand guidelines."
    >
      <div className="max-w-2xl mx-auto">
        {submitted ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Walkthrough Request Received!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Thank you, <strong>{formData.name}</strong>. A BrandGuard AI Solutions Architect has been assigned to prepare a sandbox demo using sample brand guidelines for <strong>{formData.company}</strong>.
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
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  placeholder="alex@enterprise.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Organization / Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Global Fintech Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Marketing / Compliance Team Size</label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1-10">1 - 10 members</option>
                  <option value="10-50">10 - 50 members</option>
                  <option value="50-250">50 - 250 members</option>
                  <option value="250+">250+ enterprise members</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Priority</label>
              <select
                value={formData.primaryGoal}
                onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="compliance-review">Automated Regulatory &amp; Brand Compliance Review</option>
                <option value="threat-defense">Homoglyph Domain &amp; Phishing Threat Perimeter</option>
                <option value="workflow-rbac">Four-Role Human Oversight &amp; Audit Trail</option>
                <option value="counterfeit">Counterfeit Marketplace &amp; Logo Infringement</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specific Regulatory Frameworks / Notes</label>
              <textarea
                rows={3}
                placeholder="E.g., SEBI / SEC investment marketing guidelines, banned yield phrases..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              Note: This is an interactive demo interface; form submissions are processed locally in your browser and not transmitted to a backend server.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Confirm Walkthrough Request
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

