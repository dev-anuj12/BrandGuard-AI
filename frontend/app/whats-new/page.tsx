import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: "What's New in BrandGuard AI",
  description: 'Explore the latest feature releases, performance upgrades, and security improvements.',
};

export default function WhatsNewPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: "What's New" }]}
      badge="Product Spotlight"
      title="What's New in BrandGuard AI"
      subtitle="Discover the latest capabilities shipped across our brand compliance engine and digital perimeter shield."
    >
      <div className="space-y-8 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Feature 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              New Scanner
            </span>
            <span className="text-xs text-slate-400 font-mono">November 2026</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Homoglyph &amp; Lookalike Domain Threat Perimeter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our real-time scanner now automatically identifies Cyrillic/Greek punycode substitutions (e.g. replacing latin &apos;a&apos; with &apos;\u0430&apos;), assesses WHOIS registrar age, and verifies whether destination portals render deceptive credential harvesting authentication forms.
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
              Governance Upgrade
            </span>
            <span className="text-xs text-slate-400 font-mono">October 2026</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Segregated Manager Approval Queues &amp; CSV Export
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Compliance Managers can now isolate pending approvals from verified and approved items, provide immutable audit notes, and export comprehensive violation telemetry into executive-ready CSV files.
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

