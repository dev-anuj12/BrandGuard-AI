import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Mail, MessageSquare, Building2, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | BrandGuard AI',
  description: 'Contact the BrandGuard AI team for support, enterprise enquiries, or security disclosures.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#070A10]">
      <header className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <span className="font-bold text-slate-900 dark:text-white text-sm">BrandGuard AI</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Link>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-10 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">Support</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Contact BrandGuard AI
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            For platform support, enterprise deployment guidance, or security disclosures, choose the appropriate channel below.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {[
            {
              icon: MessageSquare,
              color: 'indigo',
              title: 'Platform Support',
              body: 'Issues with login, workflows, AI analysis, or data access within the platform.',
              action: 'Open an Issue on GitHub',
              href: 'https://github.com/dev-anuj12/BrandGuard-AI/issues',
              external: true,
            },
            {
              icon: Building2,
              color: 'purple',
              title: 'Enterprise Enquiries',
              body: 'Custom deployments, organization onboarding, or feature requests for enterprise teams.',
              action: 'View Repository',
              href: 'https://github.com/dev-anuj12/BrandGuard-AI',
              external: true,
            },
            {
              icon: Mail,
              color: 'rose',
              title: 'Security Disclosures',
              body: 'Responsible disclosure of security vulnerabilities. Please do not post security issues publicly.',
              action: 'Open a Private Issue',
              href: 'https://github.com/dev-anuj12/BrandGuard-AI/security',
              external: true,
            },
          ].map(({ icon: Icon, color, title, body, action, href, external }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-4 flex flex-col"
            >
              <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-950/50 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
              </div>
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                {action}
                {external && <ExternalLink className="w-3 h-3" aria-hidden="true" />}
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise Support & Security Commitment */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Enterprise Support &amp; Response Times
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            BrandGuard AI is committed to high-availability compliance operations. Critical platform alerts and urgent security disclosures receive priority triage within 2 hours. General enterprise onboarding and operational support inquiries are responded to within one business day.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span>Operating Hours: 24/7 Monitoring</span>
            <span>·</span>
            <span>Security SLA: Priority Critical Triage</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} BrandGuard AI — All rights reserved.
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Privacy</Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Terms</Link>
      </footer>
    </div>
  );
}

