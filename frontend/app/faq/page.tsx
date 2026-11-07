'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export default function FAQPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);
  const [query, setQuery] = useState('');

  const faqs = [
    {
      q: 'How does BrandGuard AI calculate compliance scores?',
      a: 'Scores are generated through a composite multi-engine pipeline: (1) Deterministic rule evaluation subtracting penalties for forbidden words and missing legal disclaimers, (2) Fact repository cross-referencing for quantitative assertions, and (3) Semantic tone analysis evaluating corporate voice. Scores range from 0 to 100 with actionable remediation recommendations.',
    },
    {
      q: 'Does BrandGuard AI use customer data to train external AI models?',
      a: 'Never. BrandGuard AI strictly operates under zero data retention policies with third-party LLM inference providers (OpenAI, Google Gemini). Your marketing copy, brand guidelines, and organizational telemetry are never contributed to foundation training datasets.',
    },
    {
      q: 'What are the four user roles in the governance workflow?',
      a: 'The workflow enforces: (1) Creator: drafts and revises content; (2) Reviewer: validates AI findings and verifies changes; (3) Manager: provides final corporate approval or rejection; and (4) Admin: manages guidelines, fact databases, and team provisioning.',
    },
    {
      q: 'How does the homoglyph domain scanner detect typosquatting?',
      a: 'The scanner normalizes unicode and confusable Cyrillic/Greek characters (punycode), computes Levenshtein edit distance against your canonical brand stem, and probes target web servers for SSL validity, registrar risk, and deceptive authentication login forms.',
    },
    {
      q: 'Can BrandGuard AI run in private air-gapped or VPC environments?',
      a: 'Yes. When configured with the default rule_fallback AI provider mode, all compliance checks execute completely locally inside your self-hosted instance without making outbound internet requests.',
    },
  ];

  const filtered = faqs.filter(
    (f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'FAQ' }]}
      badge="Knowledge Base"
      title="Frequently Asked Questions"
      subtitle="Clear answers to common questions about compliance scoring, security architecture, and scanner engines."
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions (e.g. 'training', 'scoring', 'roles')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((item, idx) => {
            const isOpen = activeIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setActiveIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Didn&apos;t find what you were looking for?</span>
          <Link href="/tickets" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Submit a Question &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

