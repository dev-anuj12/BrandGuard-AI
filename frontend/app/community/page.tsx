import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageSquare, Users, BookOpen, ExternalLink } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Community & Guidelines Exchange',
  description: 'Connect with enterprise brand governance architects, compliance officers, and security researchers.',
};

export default function CommunityPage() {
  const channels = [
    { name: 'Regulatory Rule Frameworks', desc: 'Community-maintained regex and terminology templates for SEBI, SEC, and FTC guidelines.', icon: BookOpen },
    { name: 'Threat Intel Exchange', desc: 'Share indicators of compromise (IoCs), phishing domain stems, and rogue seller tactics.', icon: Users },
    { name: 'Developer Q&A Forum', desc: 'Discuss API patterns, custom CMS webhooks, and headless pipeline automation.', icon: MessageSquare },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Support' }, { label: 'Community' }]}
      badge="Global Network"
      title="Brand Governance Community Hub"
      subtitle="Join enterprise practitioners sharing best practices, regulatory frameworks, and cyber defense strategies."
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.name} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{c.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Join the BrandGuard AI Enterprise Slack Network</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Available exclusively to verified enterprise customers and certified regulatory partners.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-block"
            >
              Request Network Invite &rarr;
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

