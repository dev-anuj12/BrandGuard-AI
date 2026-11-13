'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Send,
  Save,
  Sparkles,
  Info,
  ChevronDown,
  X,
  Lightbulb,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import AppLayout from '../../components/AppLayout';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { api, getCurrentUser } from '../../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  channel: string;
  target_audience: string;
  original_body: string;
  auto_review: boolean;
}

interface FormErrors {
  title?: string;
  channel?: string;
  target_audience?: string;
  original_body?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNELS = [
  'Social Media',
  'Email Marketing',
  'Blog Post',
  'Press Release',
  'Product Page',
  'Internal Communication',
  'Advertisement',
  'Website Copy',
  'Video Script',
  'Podcast Script',
];

const TARGET_AUDIENCES = [
  'General Public',
  'B2B Enterprise',
  'Retail Investors',
  'High Net Worth Individuals',
  'SME Business Owners',
  'Financial Advisors',
  'Young Professionals',
  'Existing Customers',
];

const DEMO_SAMPLE = {
  title: 'Q4 Investment Campaign - Digital Newsletter',
  channel: 'Email Marketing',
  target_audience: 'Retail Investors',
  original_body: `Introducing our Revolutionary Investment Platform — Guaranteed Wealth Ahead!

Dear Valued Client,

Are you tired of mediocre returns? Our AI-powered portfolio management system guarantees 40% annual returns with zero risk. Our revolutionary technology has never failed a single client!

Special Limited Offer: Invest $10,000 today and earn $20,000 within 6 months — a 100% return! This offer is only for the first 500 premium members.

Our exclusive SmartGrowth Fund has outperformed every competitor in the market for 15 consecutive years. No other provider can match our track record.

Act now! This guaranteed opportunity closes at midnight. Miss it and lose forever!

Sign up at example-invest.com/invest. No terms, no conditions, just pure profit!

BrandGuard Enterprise Solutions — Where Capital Grows!`,
};

const GUIDELINES = [
  {
    icon: <Info className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />,
    text: 'Use only approved enterprise brand terminology and registered product names.',
  },
  {
    icon: <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />,
    text: 'Avoid banned financial claims — no guaranteed returns or risk-free language.',
  },
  {
    icon: <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />,
    text: 'Include all required regulatory disclaimers for the selected channel.',
  },
  {
    icon: <Info className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />,
    text: 'Match tone and vocabulary to the intended target audience.',
  },
  {
    icon: <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />,
    text: 'Double-check all statistics and data points are sourced and accurate.',
  },
  {
    icon: <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />,
    text: 'Superlatives and comparative claims require supporting evidence.',
  },
  {
    icon: <Info className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />,
    text: 'High-risk channels (advertisements, press releases) undergo mandatory legal review.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim() || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters.';
  }
  if (!data.channel) {
    errors.channel = 'Please select a content channel.';
  }
  if (!data.target_audience) {
    errors.target_audience = 'Please select a target audience.';
  }
  if (!data.original_body.trim() || data.original_body.trim().length < 50) {
    errors.original_body = 'Content body must be at least 50 characters.';
  }
  return errors;
}

// ─── Custom Select ────────────────────────────────────────────────────────────

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  error?: string;
  required?: boolean;
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-10 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
            error
              ? 'border-red-400 dark:border-red-500'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function SubmitPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormData>({
    title: '',
    channel: '',
    target_audience: '',
    original_body: '',
    auto_review: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);

  // Clear per-field error on change
  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function loadSample() {
    setForm((prev) => ({
      ...prev,
      title: DEMO_SAMPLE.title,
      channel: DEMO_SAMPLE.channel,
      target_audience: DEMO_SAMPLE.target_audience,
      original_body: DEMO_SAMPLE.original_body,
    }));
    setErrors({});
    setSampleLoaded(true);
  }

  function clearSample() {
    setForm({
      title: '',
      channel: '',
      target_audience: '',
      original_body: '',
      auto_review: true,
    });
    setErrors({});
    setSampleLoaded(false);
  }

  async function handleSubmit(isDraft: boolean) {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const autoReview = isDraft ? false : form.auto_review;

    if (isDraft) {
      setSavingDraft(true);
    } else {
      setSubmitting(true);
    }

    try {
      const result = await api.submitContent(
        {
          title: form.title,
          original_body: form.original_body,
          channel: form.channel,
          target_audience: form.target_audience,
        },
        autoReview
      );

      showToast(isDraft ? 'Draft saved successfully.' : 'Content submitted successfully.', 'success');
      router.push(`/review/${result.id}`);
    } catch (err: any) {
      const message =
        err?.message || (isDraft ? 'Failed to save draft.' : 'Failed to submit content.');
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
      setSavingDraft(false);
    }
  }

  const wordCount = countWords(form.original_body);
  const charCount = form.original_body.length;
  const isLoading = submitting || savingDraft;

  return (
    <AppLayout
      pageTitle="Create Submission"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard/creator' },
        { label: 'Create Submission' },
      ]}
    >
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Submit Content for Review
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Fill in the details below and run an AI compliance check.
              </p>
            </div>
          </div>

          {/* Load / clear sample */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {process.env.NODE_ENV === 'development' && (
              sampleLoaded ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSample}
                  className="text-slate-500 hover:text-red-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Sample
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSample}
                  className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Load Sample Copy (Dev Only)
                </Button>
              )
            )}
          </div>
        </div>

        {/* Sample loaded banner */}
        {sampleLoaded && (
          <div className="mb-5 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Sample content loaded — this content intentionally contains compliance violations
              to showcase AI detection. Submit it to see BrandGuard AI in action.
            </span>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Submission Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fields marked <span className="text-red-500">*</span> are required.
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Submission Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    placeholder="e.g. Q4 Investment Newsletter — October 2024"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                      errors.title
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.title && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Channel + Audience — 2-col on sm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SelectField
                    id="channel"
                    label="Content Channel"
                    value={form.channel}
                    onChange={(val) => setField('channel', val)}
                    options={CHANNELS}
                    placeholder="Select a channel…"
                    error={errors.channel}
                    required
                  />
                  <SelectField
                    id="target_audience"
                    label="Target Audience"
                    value={form.target_audience}
                    onChange={(val) => setField('target_audience', val)}
                    options={TARGET_AUDIENCES}
                    placeholder="Select audience…"
                    error={errors.target_audience}
                    required
                  />
                </div>

                {/* Body */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="original_body"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Content Body <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="original_body"
                      rows={12}
                      value={form.original_body}
                      onChange={(e) => setField('original_body', e.target.value)}
                      placeholder="Paste or type your content here. The AI compliance engine will analyse it for brand, legal, and regulatory issues…"
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y transition leading-relaxed ${
                        errors.original_body
                          ? 'border-red-400 dark:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {errors.original_body && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {errors.original_body}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {wordCount} words / {charCount} characters
                    </span>
                  </div>
                </div>

                {/* Auto Review Toggle */}
                <div className="flex items-center justify-between rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Run AI Compliance Check automatically
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Analyses content immediately on submission
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.auto_review}
                    onClick={() => setField('auto_review', !form.auto_review)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      form.auto_review
                        ? 'bg-indigo-600'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                        form.auto_review ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleSubmit(true)}
                    disabled={isLoading}
                  >
                    {savingDraft ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {savingDraft ? 'Saving…' : 'Save as Draft'}
                  </Button>

                  <Button
                    variant="primary"
                    className="flex-1 sm:flex-none sm:ml-auto"
                    onClick={() => handleSubmit(false)}
                    disabled={isLoading}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? 'Submitting…' : 'Submit for Review'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Guidelines panel ── */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            {/* Submission guidelines */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Submission Guidelines
                </h3>
              </div>
              <ul className="p-5 space-y-3">
                {GUIDELINES.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {g.icon}
                    {g.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Channel risk badge */}
            {form.channel && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Selected Channel
                </p>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {form.channel}
                  </span>
                </div>
                {(['Advertisement', 'Press Release'].includes(form.channel)) && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    This channel requires mandatory legal review before publishing.
                  </p>
                )}
              </div>
            )}

            {/* AI check note */}
            <div className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  AI Compliance Engine
                </p>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
                When enabled, the AI engine scans for banned claims, missing disclaimers,
                tone mismatches, and regulatory red flags — typically completing in under
                30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
