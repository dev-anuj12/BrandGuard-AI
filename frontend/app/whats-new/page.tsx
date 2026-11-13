import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: "What's New in BrandGuard AI",
  description: 'Explore recent updates and platform enhancements.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/whats-new',
  },
  openGraph: {
    title: "What's New in BrandGuard AI",
    description: 'Explore recent updates and platform enhancements.',
    url: 'https://brandguard-ai-eight.vercel.app/whats-new',
  },
};

export default function WhatsNewPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: "What's New" }]}
      badge="Product Spotlight"
      title="What's New in BrandGuard AI"
      subtitle="Recent capabilities and improvements across brand governance and threat protection."
    >
      <div className="space-y-8 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Feature 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Perimeter Defense
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Homoglyph &amp; Lookalike Domain Scanner
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The domain scanner evaluates unicode confusable substitutions and punycode lookalikes, analyzes domain registrar heuristics, and checks suspect web pages for credential-harvesting elements.
          </p>
          <div className="pt-2">
            <Link href="/protection/domains" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Launch Domain Scanner &rarr;
            </Link>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              Governance &amp; Telemetry
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Segregated Workflow &amp; Telemetry CSV Export
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Four-role segregation of duties with a centralized transition table, append-only audit trail logging, and full CSV export for compliance reporting.
          </p>
          <div className="pt-2">
            <Link href="/analytics" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Explore Analytics Telemetry &rarr;
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
