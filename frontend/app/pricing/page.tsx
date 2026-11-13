import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, Shield, Zap, Building } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Pricing & Plans | BrandGuard AI',
  description: 'Enterprise subscription options for BrandGuard AI.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/pricing',
  },
  openGraph: {
    title: 'Pricing & Plans | BrandGuard AI',
    description: 'Enterprise subscription options for BrandGuard AI.',
    url: 'https://brandguard-ai-eight.vercel.app/pricing',
  },
};

export default function PricingPage() {
  const tiers = [
    {
      name: 'Starter Governance',
      description: 'Automated brand compliance verification for emerging marketing teams.',
      icon: Zap,
      features: [
        'Creator & Reviewer workflow roles',
        'Deterministic Brand Rule & Terminology Engine',
        'Citation & Approved Fact Repository',
        'Standard Audit History',
        'Standard Support',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      description: 'Human-in-the-loop workflow governance with digital brand perimeter defense.',
      icon: Shield,
      features: [
        'Full 4-Role RBAC (Creator, Reviewer, Manager, Admin)',
        'Semantic AI Compliance (OpenAI & Gemini integration)',
        'Homoglyph Domain Scanner',
        'Social Media Impersonation Monitoring',
        'Append-Only Audit Logging & CSV Telemetry',
        'Priority Support',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise Custom',
      description: 'Tailored for institutions requiring custom guidelines and dedicated infrastructure.',
      icon: Building,
      features: [
        'Multi-Org Tenants',
        'Custom Guideline & Terminology Libraries',
        'Counterfeit Price Disparity & Logo Detection',
        'Dedicated Instance Deployment Options',
        'Custom Data Processing Agreement',
        'Dedicated Account Representative',
      ],
      highlighted: false,
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Pricing' }]}
      badge="Plans"
      title="Pricing & Plans"
      subtitle="Scalable brand compliance and digital perimeter protection designed for your organization."
    >
      <div className="space-y-12 max-w-5xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            return (
              <div
                key={tier.name}
                className={`p-6 rounded-2xl flex flex-col justify-between gap-6 transition ${
                  tier.highlighted
                    ? 'bg-white dark:bg-[#120924]/85 backdrop-blur-xl border-2 border-indigo-600 dark:border-indigo-500 shadow-xl'
                    : 'bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-purple-400">
                      {tier.name}
                    </span>
                    {tier.highlighted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-purple-400 border border-indigo-200 dark:border-purple-500/30">
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tier.description}</p>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-purple-900/35 text-xs">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-purple-900/35">
                  <Link
                    href="/contact"
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center transition block ${
                      tier.highlighted
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#120924]/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    Contact us for pricing &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-[#120924]/60 border border-slate-200 dark:border-purple-900/35 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Have custom requirements or volume inquiries?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Get in touch with our team for customized deployment options.</p>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition shrink-0"
          >
            Contact us for pricing &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
