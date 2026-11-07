import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Cpu, Eye, Lock, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about BrandGuard AI — our mission to bridge internal regulatory compliance review with external digital brand perimeter defense.',
};

export default function AboutPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'About Us' }]}
      badge="Our Mission"
      title="Securing Enterprise Brand Integrity"
      subtitle="BrandGuard AI was founded on a simple principle: every brand compliance decision should be explainable, evidence-backed, and human-controlled."
    >
      <div className="space-y-12 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            The Governance Challenge in the Age of Scale
          </h2>
          <p>
            Modern marketing teams produce thousands of digital collateral assets every month across blogs, social networks, press announcements, and ad campaigns. At the same time, regulatory authorities enforce strict guidelines around unsubstantiated claims, non-compliant disclaimers, and predatory marketing copy.
          </p>
          <p>
            Meanwhile, threat actors impersonate legitimate corporate brands using lookalike homoglyph domains, fake social customer support profiles, and unauthorized counterfeit marketplace listings.
          </p>
          <p className="font-medium text-slate-900 dark:text-white">
            BrandGuard AI brings internal content compliance review and external digital threat defense together into a single, unified enterprise control tower.
          </p>
        </section>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Deterministic &amp; AI Hybrid Engine</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We combine absolute deterministic regex rules, citation verification against approved facts, and semantic LLM inference so compliance findings are always explainable and repeatable.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Four-Role Human Oversight</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Algorithmic reviews assist—they never dictate. Segregated RBAC guarantees structured progression through Creator draft, Reviewer verification, Manager approval, and Admin oversight.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Digital Perimeter Shield</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated intelligence scans typo-squatted domains, fake customer support handles, and counterfeit logo usage before they deceive your customers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Enterprise Multi-Tenant Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Strict database isolation guarantees no tenant content touches another organization&apos;s workspace. Full audit trails ensure complete regulatory compliance.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Want to see BrandGuard AI in action?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">Schedule a customized walkthrough tailored to your brand guidelines.</p>
          </div>
          <Link
            href="/demo"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Request Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

