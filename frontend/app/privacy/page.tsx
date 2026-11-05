import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BrandGuard AI',
  description: 'BrandGuard AI Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  const updated = 'November 5, 2026';

  return (
    <div className="min-h-screen bg-white dark:bg-[#070A10]">
      {/* Header */}
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

      {/* Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {updated}</p>

          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
            <strong>Legal Review Notice:</strong> This document describes BrandGuard AI&apos;s actual data practices. It has been prepared for your review but should be verified by a qualified legal professional before formal publication.
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Who We Are</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              BrandGuard AI is an enterprise brand governance and digital protection platform. This policy explains what data we collect when you use our platform, how we use it, and your rights regarding your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Data We Collect</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">We collect the following categories of data:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Account Data:</strong> Email address, full name, role, and organization on registration.</li>
              <li><strong>Content Data:</strong> Brand content submissions, revision history, and AI compliance analysis results stored in your organization&apos;s workspace.</li>
              <li><strong>Usage Data:</strong> Actions performed in the platform, including timestamps, audit logs, and approval decisions.</li>
              <li><strong>Authentication Data:</strong> Hashed passwords (bcrypt, cost factor 12). We never store plaintext passwords.</li>
              <li><strong>Technical Data:</strong> Session tokens (JWT, stored in browser localStorage), and standard server request logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Authenticate and authorize access to your organization&apos;s workspace.</li>
              <li>Execute AI-based brand compliance analysis on content you submit.</li>
              <li>Maintain immutable audit trails for regulatory compliance.</li>
              <li>Provide analytics and telemetry to authorized managers and administrators.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Data Storage & Security</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Data is stored in a PostgreSQL database hosted on your selected cloud infrastructure (Render, Supabase, Neon, or self-hosted). We enforce multi-organization data isolation so that each organization can only access its own data. API access is protected via signed JWT tokens with a 24-hour expiration window.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Data Sharing</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We do not sell or share your data with third parties for advertising purposes. Data may be shared with AI service providers (OpenAI, Google Gemini) only when you configure an AI provider key and submit content for analysis. When using the default <code>rule_fallback</code> AI provider, all analysis is performed locally without any external data transmission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Cookies & Local Storage</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              BrandGuard AI uses <strong>browser localStorage</strong> (not cookies) to store your authentication token and user profile for session persistence. No third-party tracking cookies are used. You can clear your session at any time by signing out.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">7. Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You may request access to, correction of, or deletion of your personal data by contacting your organization&apos;s BrandGuard AI administrator. Administrators can deactivate accounts, update user information, and request data removal through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">8. Contact</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              For privacy-related enquiries, please use our <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} BrandGuard AI — All rights reserved.
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Terms</Link>
        <span className="mx-2">·</span>
        <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Contact</Link>
      </footer>
    </div>
  );
}

