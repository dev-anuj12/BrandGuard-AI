'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';
import { useToast } from '../../components/ui/Toast';

export default function FeedbackPage() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: '5',
    category: 'workflow',
    feedback: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.feedback) {
      showToast('Please provide your feedback.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Thank you for your valuable feedback!', 'success');
  };

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'Feedback' }]}
      badge="Product Input"
      title="Share Your Feedback"
      subtitle="Help shape the future of BrandGuard AI by sharing your suggestions, workflows, and feature requests."
    >
      <div className="max-w-2xl mx-auto">
        {submitted ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Feedback Received!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              Our product architecture team reviews every submission during roadmap planning cycles. Thank you for helping us refine BrandGuard AI.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Jordan Lee"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="jordan@enterprise.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="workflow">Workflow &amp; Approvals</option>
                  <option value="scoring">Scoring Accuracy &amp; False Positives</option>
                  <option value="scanners">Domain &amp; Threat Scanners</option>
                  <option value="integrations">Third-Party Integrations</option>
                  <option value="ui">User Experience &amp; Navigation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Overall Satisfaction</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="5">⭐⭐⭐⭐⭐ Outstanding</option>
                  <option value="4">⭐⭐⭐⭐ Great</option>
                  <option value="3">⭐⭐⭐ Meets expectations</option>
                  <option value="2">⭐⭐ Needs improvement</option>
                  <option value="1">⭐ Frustrating</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Feedback &amp; Suggestions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="What could we do to make BrandGuard AI more indispensable to your team?"
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}

