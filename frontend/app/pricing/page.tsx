import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, ArrowRight, Shield, Zap, Building } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Enterprise Pricing & Subscription Plans',
  description: 'Transparent and predictable enterprise subscription tiers for BrandGuard AI.',
};

export default function PricingPage() {
  const tiers = [
    {
      name: 'Starter Governance',
      price: '$499',
      cadence: '/month',
      description: 'Ideal for fast-growing marketing teams needing automated brand compliance verification.',
      icon: Zap,
      features: [
        'Up to 10 Team Members (Creator & Reviewer roles)',
        'Deterministic Brand Rule & Terminology Engine',
        'Citation & Approved Fact Repository',
        'Standard Audit History (90-Day Retention)',
        'Email Technical Support',
      ],
      cta: 'Start Free Trial',
      href: '/register',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$1,299',
      cadence: '/month',
      description: 'Full human-in-the-loop workflow governance with perimeter brand threat defense.',
      icon: Shield,
      features: [
        'Up to 50 Team Members (Full 4-Role RBAC)',
        'Semantic AI Compliance (OpenAI & Gemini Integration)',
        'Homoglyph Domain Scanner (Up to 10 Monitored Stems)',
        'Social Media Impersonation Monitoring',
        '1-Year Immutable Audit Logging & CSV Telemetry',
        'Priority Technical Support (4-Hour SLA)',
      ],
      cta: 'Deploy Professional',
      href: '/register',
      highlighted: true,
    },
    {
      name: 'Enterprise Custom',
      price: 'Custom',
      cadence: 'contact sales',
      description: 'Tailored for regulated institutions, banks, and global conglomerates requiring custom SLAs.',
      icon: Building,
      features: [
        'Unlimited Team Members & Multi-Org Tenants',
        'Custom Regulatory Rule Ingestion (SEC, FTC, SEBI)',
        'Counterfeit Marketplace Image Hashing',
        'Dedicated Cloud Instance / VPC Deployment',
        'Custom Data Processing Agreement & SOC2 Packet',
        'Dedicated Technical Account Manager & 24/7 SLA',
      ],
      cta: 'Request Enterprise Quote',
      href: '/demo',
      highlighted: false,
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Pricing' }]}
      badge="Subscription Tiers"
      title="Transparent, Predictable Enterprise Pricing"
      subtitle="Scalable brand compliance and digital perimeter protection designed for every enterprise growth stage."
    >
      <div className="space-y-12 max-w-5xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`p-6 rounded-2xl flex flex-col justify-between gap-6 transition ${
                  tier.highlighted
                    ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-xl'
                    : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {tier.name}
                    </span>
                    {tier.highlighted && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      {tier.price}
                    </span>
                    <span className="text-xs text-slate-400">{tier.cadence}</span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tier.description}</p>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={tier.href}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center transition block ${
                    tier.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Need a Proof of Concept (PoC) or Custom Pilot?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Our solution architects can configure a sandbox environment with your actual brand rules.</p>
          </div>
          <Link
            href="/demo"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition shrink-0"
          >
            Request Pilot Walkthrough &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

