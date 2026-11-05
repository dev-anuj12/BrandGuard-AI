'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Send, Sparkles, AlertCircle, FileText, ArrowLeft, 
  HelpCircle, CheckCircle2, Copy
} from 'lucide-react';
import { api, getCurrentUser } from '../../lib/api';

const FINNOVA_DEMO_SAMPLE = `FinNova is an ultra-fast money app that promises guaranteed returns for every customer! Our new wealth wizardry platform provides a risk-free investment opportunity with 100% profit guaranteed. Experience unhackable transfers and instant wealth today.`;

export default function ContentSubmissionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Social Media');
  const [targetAudience, setTargetAudience] = useState('Retail Investors');
  const [body, setBody] = useState('');
  const [autoReview, setAutoReview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const curUser = getCurrentUser();
    if (!curUser) {
      router.push('/login');
      return;
    }
    setUser(curUser);
  }, [router]);

  const handleLoadDemoSample = () => {
    setTitle('FinNova Wealth Launch Campaign [Sample Draft]');
    setChannel('Social Media');
    setTargetAudience('Retail Investors & Young Professionals');
    setBody(FINNOVA_DEMO_SAMPLE);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) {
      setError('Please provide content copy for review.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await api.submitContent({
        title,
        original_body: body,
        channel,
        target_audience: targetAudience
      }, autoReview);

      // Redirect directly to the interactive review results page
      router.push(`/review/${result.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit content.');
      setLoading(false);
    }
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/creator"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Demo Data Injector */}
        <button
          type="button"
          onClick={handleLoadDemoSample}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 hover:bg-indigo-900 transition flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Load FinNova Demonstration Copy</span>
        </button>
      </div>

      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Submit Marketing Content
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          BrandGuard AI will inspect your copy across tone, banned terminology, factual claims, and citation grounding.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Campaign Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 Wealth Launch Post"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Marketing Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Social Media">Social Media Campaign (LinkedIn/X/IG)</option>
              <option value="Website/Blog">Website / Official Blog</option>
              <option value="Press Release">Regulatory Press Release</option>
              <option value="Email Newsletter">Email Newsletter</option>
              <option value="Ad Campaign">Digital Ad / Search Copy</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Retail Investors">Retail Investors</option>
              <option value="Young Professionals">Young Professionals &amp; Tech Workers</option>
              <option value="High Net Worth Individuals">High Net Worth Individuals (HNIs)</option>
              <option value="Institutional Partners">Institutional Partners</option>
              <option value="General Public">General Public</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Content Copy / Draft Body
            </label>
            <div className="text-[11px] text-slate-500 font-mono">
              {wordCount} words • {charCount} characters
            </div>
          </div>

          <textarea
            required
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste your marketing draft or promotional text here for instant AI brand compliance review..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed shadow-inner"
          />
        </div>

        {/* AI Options */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-xs font-bold text-white block">Multi-Engine AI Audit</span>
              <span className="text-[11px] text-slate-400">
                Instantly check against FinNova Brand Guidelines, Banned Phrases &amp; Grounding Evidence.
              </span>
            </div>
          </div>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoReview}
              onChange={(e) => setAutoReview(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-xs font-semibold text-slate-300">Run Review Now</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/creator')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting & Reviewing...' : 'Submit & Execute BrandGuard Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
