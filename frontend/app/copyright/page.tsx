import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Copyright & Intellectual Property Policy',
  description: 'BrandGuard AI Copyright Policy — DMCA notice procedures, trademark enforcement, and intellectual property guidelines.',
};

export default function CopyrightPolicyPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Copyright & IP' }]}
      badge="Intellectual Property"
      title="Copyright &amp; Intellectual Property Policy"
      subtitle="Procedures for copyright infringement notifications, DMCA notices, and trademark enforcement assistance."
      lastUpdated="November 7, 2026"
    >
      <div className="space-y-6 max-w-3xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Platform Copyright &amp; Proprietary Assets</h2>
          <p>
            The BrandGuard AI name, emblem logo, interface designs, source code, scanning logic, and brand materials are protected under statutory copyright, trademark, and trade secret laws. All rights are reserved.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. DMCA &amp; IP Infringement Takedown Notices</h2>
          <p>
            If you believe content hosted or analyzed within our platform infringes your copyrighted work or registered trademark, submit a formal notice to our designated agent with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Identification of the copyrighted work or trademark claimed to have been infringed.</li>
            <li>Specific URL or location within the BrandGuard AI platform of the allegedly infringing material.</li>
            <li>Your contact information (name, corporate address, telephone number, and email address).</li>
            <li>A statement of good faith belief that use of the material is not authorized by the copyright owner.</li>
            <li>A physical or electronic signature of an authorized representative.</li>
          </ul>
        </section>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 text-xs font-mono space-y-1">
          <p><strong>Designated Copyright Agent:</strong></p>
          <p>BrandGuard AI Legal Operations</p>
          <p>Email: <Link href="/contact" className="text-indigo-600 dark:text-purple-400 hover:underline">legal@brandguard.io</Link></p>
        </div>
      </div>
    </PublicLayout>
  );
}

