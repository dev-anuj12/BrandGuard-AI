import Link from 'next/link';
import type { Metadata } from 'next';
import { Code, Terminal, Key, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'API Documentation & Endpoints | BrandGuard AI',
  description: 'BrandGuard AI REST API documentation — endpoints for authentication, content review, and perimeter scanning.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/api-docs',
  },
  openGraph: {
    title: 'API Documentation & Endpoints | BrandGuard AI',
    description: 'BrandGuard AI REST API documentation — endpoints for authentication, content review, and perimeter scanning.',
    url: 'https://brandguard-ai-eight.vercel.app/api-docs',
  },
};

export default function ApiDocsPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'API Documentation' }]}
      badge="REST API v1"
      title="BrandGuard AI Developer API"
      subtitle="Integrate automated brand compliance reviews and threat detection directly into your workflows via REST endpoints."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Auth section */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Authentication</h2>
          <p>
            All protected endpoints require a signed JWT bearer token passed in the <code>Authorization</code> header:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
            <code>Authorization: Bearer &lt;YOUR_ACCESS_TOKEN&gt;</code>
          </div>
          <p className="text-xs text-slate-500">
            Obtain a token by authenticating against <code>POST /api/v1/auth/login</code> with registered credentials.
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
            Submits brand marketing collateral for compliance analysis.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
            <p className="text-slate-400"># Request Payload Example:</p>
            <pre className="text-indigo-300">{`{
  "title": "Quarterly Product Announcement",
  "original_body": "Official release notes for our latest enterprise platform updates.",
  "channel": "Website/Blog",
  "target_audience": "Enterprise Users"
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
            Executes homoglyph, WHOIS heuristic, and lookalike analysis against a suspect domain.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
            <p className="text-slate-400"># Request Payload Example:</p>
            <pre className="text-indigo-300">{`{
  "url": "https://example-brand-portal.com",
  "auto_create_threat": true
}`}</pre>
          </div>
        </section>

        {/* Core Route Groups */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available API Route Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/auth</code>
              <p className="text-slate-500 mt-1">Registration, token login, and profile lookup</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/content</code>
              <p className="text-slate-500 mt-1">Draft creation, revision history, and export</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/review</code>
              <p className="text-slate-500 mt-1">Review trigger, suggestions, and overrides</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/approvals</code>
              <p className="text-slate-500 mt-1">Reviewer verify, manager decision, and audit logs</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/guidelines</code>
              <p className="text-slate-500 mt-1">Brand rules, approved facts, terminology, and sources</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/protection/*</code>
              <p className="text-slate-500 mt-1">Domain, social profile, and product asset scanners</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/threats</code>
              <p className="text-slate-500 mt-1">Perimeter threat item management and status triage</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <code className="font-mono font-bold text-indigo-600 dark:text-indigo-400">/api/v1/analytics</code>
              <p className="text-slate-500 mt-1">Overview metrics and unified telemetry</p>
            </div>
          </div>
        </section>

        {/* Interactive Swagger Link */}
        <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">OpenAPI Interactive Docs</h4>
            <p className="text-xs text-slate-500">Access interactive OpenAPI / Swagger specifications on the running backend server.</p>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
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
