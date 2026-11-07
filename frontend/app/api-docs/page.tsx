import Link from 'next/link';
import type { Metadata } from 'next';
import { Code, Terminal, Key, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'API Documentation & Endpoints',
  description: 'BrandGuard AI REST API documentation — OpenAPI endpoints, authentication, content analysis, and perimeter scanning.',
};

export default function ApiDocsPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'API Documentation' }]}
      badge="REST API v1"
      title="BrandGuard AI Developer API"
      subtitle="Integrate automated brand compliance reviews and threat detection directly into your CI/CD, CMS, or enterprise microservices."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Auth section */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Authentication</h2>
          <p>
            All API calls require a valid signed JWT bearer token passed in the <code>Authorization</code> header:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            <code>Authorization: Bearer &lt;YOUR_ACCESS_TOKEN&gt;</code>
          </div>
          <p className="text-xs text-slate-500">
            Obtain a token by authenticating against <code>POST /api/v1/auth/login</code> with registered organization credentials.
          </p>
        </section>

        {/* Content Review Endpoint */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              POST
            </span>
            <code className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              /api/v1/content/
            </code>
          </div>
          <p className="text-xs text-slate-500">
            Submits brand marketing collateral for instant multi-engine compliance analysis.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
            <p className="text-slate-400"># Request Payload Example:</p>
            <pre className="text-indigo-300">{`{
  "title": "Q4 Enterprise Yield Announcement",
  "original_body": "Guaranteed 18% annual return backed by our risk-free reserve.",
  "channel": "Website/Blog",
  "target_audience": "Retail Investors"
}`}</pre>
          </div>
        </section>

        {/* Threat Scanner Endpoint */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              POST
            </span>
            <code className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              /api/v1/protection/domains/scan
            </code>
          </div>
          <p className="text-xs text-slate-500">
            Executes real-time homoglyph, WHOIS, SSL, and phishing analysis against a suspect domain.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
            <p className="text-slate-400"># Request Payload Example:</p>
            <pre className="text-indigo-300">{`{
  "url": "https://brandguard-login-portal.cc",
  "auto_create_threat": true
}`}</pre>
          </div>
        </section>

        {/* Interactive Swagger Link */}
        <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Interactive Swagger / OpenAPI Specs</h4>
            <p className="text-xs text-slate-500">Explore interactive request schemas on your active backend instance.</p>
          </div>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
          >
            Open Swagger Docs &rarr;
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}

