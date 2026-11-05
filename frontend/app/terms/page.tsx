import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | BrandGuard AI',
  description: 'BrandGuard AI Terms of Service — the terms governing your use of the platform.',
};

export default function TermsOfServicePage() {
  const updated = 'November 5, 2026';

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

      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {updated}</p>
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
            <strong>Legal Review Notice:</strong> This document describes the governing terms for BrandGuard AI use. It should be reviewed and approved by a qualified legal professional before formal publication.
          </div>
        </div>

        <div className="space-y-8">
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing or using BrandGuard AI, you agree to be bound by these Terms of Service. If you are using BrandGuard AI on behalf of an organization, you represent that you have the authority to bind that organization to these terms.',
            },
            {
              title: '2. Platform Use',
              body: 'BrandGuard AI is an enterprise platform for brand governance, content compliance review, and digital brand protection. You may use BrandGuard AI only for lawful purposes and in accordance with these terms. You may not use the platform to process content that violates any applicable law or regulation.',
            },
            {
              title: '3. Account Responsibility',
              body: 'You are responsible for maintaining the security of your account credentials. Administrators are responsible for managing user access within their organization. You must notify your administrator immediately of any unauthorized account access.',
            },
            {
              title: '4. Content Ownership',
              body: 'You retain ownership of all content you submit to BrandGuard AI for compliance review. By submitting content, you grant BrandGuard AI a limited, non-exclusive license to process that content for the purpose of providing the AI analysis service.',
            },
            {
              title: '5. AI Analysis Disclaimer',
              body: 'AI-generated compliance analysis results are provided as an operational aid and do not constitute legal advice. Human reviewers and managers must exercise independent professional judgment when making final approval or rejection decisions.',
            },
            {
              title: '6. Service Availability',
              body: 'We strive to maintain reliable service availability. However, we do not guarantee uninterrupted access. The platform may be periodically unavailable for scheduled maintenance or infrastructure updates.',
            },
            {
              title: '7. Limitation of Liability',
              body: 'To the maximum extent permitted by applicable law, BrandGuard AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.',
            },
            {
              title: '8. Changes to Terms',
              body: 'We reserve the right to modify these terms at any time. We will notify users of material changes via platform notifications. Continued use of the platform after such notification constitutes acceptance of the updated terms.',
            },
            {
              title: '9. Governing Law',
              body: 'These terms are governed by and construed in accordance with applicable law. Any disputes shall be subject to the exclusive jurisdiction of the competent courts.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">{body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} BrandGuard AI — All rights reserved.
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Privacy</Link>
        <span className="mx-2">·</span>
        <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Contact</Link>
      </footer>
    </div>
  );
}

