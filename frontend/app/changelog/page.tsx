import type { Metadata } from 'next';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'BrandGuard AI Changelog — track platform updates, AI engine improvements, and security patches.',
};

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v1.4.0',
      date: 'November 2026',
      title: 'Digital Threat Perimeter & Telemetry Export',
      highlights: [
        'Added homoglyph domain scanner and automated WHOIS risk scoring.',
        'Implemented counterfeit marketplace detection with price disparity heuristics.',
        'Added full self-service JSON data export and account deletion workflows.',
        'Introduced granular cookie consent manager complying with DPDP Act & GDPR.',
      ],
    },
    {
      version: 'v1.3.0',
      date: 'October 2026',
      title: 'Manager Approval Queues & Telemetry Analytics',
      highlights: [
        'Introduced 4-role segregated RBAC governance with manager sign-off workflows.',
        'Added interactive Recharts telemetry visualization with CSV export.',
        'Refactored FastAPI startup events to modern lifespan context managers.',
        'Migrated all Pydantic schemas to V2 ConfigDict architecture.',
      ],
    },
    {
      version: 'v1.2.0',
      date: 'August 2026',
      title: 'Multi-Tenant Isolation & SSRF Security Guard',
      highlights: [
        'Enforced organization-level database partitioning across all core models.',
        'Introduced SSRF validator blocking private IP scanning and loopbacks.',
        'Integrated deterministic regex rule matching with citations validator.',
      ],
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Changelog' }]}
      badge="Releases"
      title="Product Changelog"
      subtitle="Continuous improvements, AI engine enhancements, and security releases delivered to your BrandGuard AI workspace."
    >
      <div className="space-y-8 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {releases.map((rel) => (
          <div key={rel.version} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  {rel.version}
                </span>
                <span className="text-xs text-slate-400 font-mono">{rel.date}</span>
              </div>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{rel.title}</h3>
            <ul className="space-y-1.5 pt-1">
              {rel.highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}

