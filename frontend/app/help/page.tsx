import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCircle, BookOpen, MessageSquare, ShieldCheck, Ticket } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Help Center & Support Hub | BrandGuard AI',
  description: 'BrandGuard AI Help Center — customer onboarding, troubleshooting, FAQ, and technical support.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/help',
  },
  openGraph: {
    title: 'Help Center & Support Hub | BrandGuard AI',
    description: 'BrandGuard AI Help Center — customer onboarding, troubleshooting, FAQ, and technical support.',
    url: 'https://brandguard-ai-eight.vercel.app/help',
  },
};

export default function HelpCenterPage() {
  const cards = [
    { title: 'Frequently Asked Questions', desc: 'Find quick answers regarding scoring algorithms, user permissions, and scanners.', href: '/faq', icon: HelpCircle },
    { title: 'Documentation & Guides', desc: 'In-depth architectural references, rule configuration syntax, and REST API guides.', href: '/docs', icon: BookOpen },
    { title: 'Submit a Support Ticket', desc: 'Open a tracked incident with our enterprise technical operations team.', href: '/tickets', icon: Ticket },
    { title: 'Community & Guidelines Hub', desc: 'Connect with other brand governance architects and share compliance rule frameworks.', href: '/community', icon: MessageSquare },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'Help Center' }]}
      badge="Customer Assistance"
      title="How can we assist you today?"
      subtitle="Comprehensive knowledge base, onboarding guides, and enterprise support resources."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {c.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}

