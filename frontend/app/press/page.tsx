import Link from 'next/link';
import type { Metadata } from 'next';
import { Newspaper, Download, ExternalLink } from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Press & Media Resources',
  description: 'BrandGuard AI Press & Media — announcements, official brand assets, executive bios, and media inquiries.',
};

export default function PressPage() {
  const announcements = [
    { date: 'November 2026', title: 'BrandGuard AI Announces Digital Perimeter Threat Defense Engine', summary: 'Integrating real-time homoglyph domain scanning and social impersonation analysis into unified governance platform.' },
    { date: 'September 2026', title: 'BrandGuard AI Completes Multi-Tenant Enterprise Isolation Milestone', summary: 'Architectural benchmarks demonstrate sub-millisecond tenant separation and zero credential leakage across distributed cloud deployments.' },
    { date: 'June 2026', title: 'Seed Enterprise Launch of Explainable AI Compliance Architecture', summary: 'Bridging deterministic regex policies with LLM-powered semantic verification for enterprise marketing teams.' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Company' }, { label: 'Press & Media' }]}
      badge="Media Hub"
      title="Press Releases &amp; Media Resources"
      subtitle="Latest corporate news, product announcements, and verified official brand assets."
    >
      <div className="space-y-10 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Brand Kit Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Official Brand Kit &amp; Logos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download approved SVG / PNG vector emblems, brand guidelines, and color palettes.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Kit</span>
          </Link>
        </div>

        {/* Press Releases List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Announcements</h2>
          <div className="space-y-3">
            {announcements.map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                  {item.date}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Media Inquiries */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
          <span>Journalist or analyst inquiry?</span>
          <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Contact Media Relations &rarr;
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

