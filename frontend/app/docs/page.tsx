'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Book, Code, Shield, Cpu, Users, ChevronRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const docArticles = [
    {
      category: 'Getting Started',
      icon: Book,
      items: [
        { title: 'Platform Overview & Architecture', desc: 'Understanding the 3-engine compliance pipeline and threat perimeter.', slug: 'overview' },
        { title: 'Four-Role Governance (RBAC)', desc: 'Configuring Creator, Reviewer, Manager, and Admin permissions.', slug: 'rbac' },
        { title: 'First Content Submission Walkthrough', desc: 'Step-by-step submission, automated scoring, and revision review.', slug: 'submission' },
      ],
    },
    {
      category: 'Rule Engine & Guidelines',
      icon: Cpu,
      items: [
        { title: 'Configuring Deterministic Rules', desc: 'Authoring regex filters, forbidden words, and required legal disclaimers.', slug: 'rules' },
        { title: 'Citation & Fact Repository', desc: 'Managing corporate truth statements and quantitative market assertions.', slug: 'citations' },
        { title: 'Connecting AI Providers (OpenAI & Gemini)', desc: 'Configuring BYOK API keys for semantic LLM tone analysis.', slug: 'ai-providers' },
      ],
    },
    {
      category: 'Digital Threat Perimeter',
      icon: Shield,
      items: [
        { title: 'Homoglyph Domain Scanning', desc: 'How BrandGuard AI evaluates punycode lookalikes and WHOIS telemetry.', slug: 'domains' },
        { title: 'Social Impersonation Detection', desc: 'Scanning fake customer care accounts and deceptive bio lure patterns.', slug: 'social' },
        { title: 'Counterfeit Marketplace Intel', desc: 'Detecting unauthorized listings, price undercutting, and logo misuse.', slug: 'counterfeits' },
      ],
    },
  ];

  const filtered = docArticles.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Documentation' }]}
      badge="Knowledge Base"
      title="BrandGuard AI Documentation"
      subtitle="Complete guides, architectural references, and API integration tutorials."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documentation, guides, or rules (e.g. 'homoglyph', 'RBAC', 'citations')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          />
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {filtered.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{cat.category}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.items.map((item) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold text-xs text-slate-900 dark:text-white">{item.title}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{item.desc}</p>
                      </div>
                      <Link
                        href="/api-docs"
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1 hover:underline pt-2"
                      >
                        <span>View Guide</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}

