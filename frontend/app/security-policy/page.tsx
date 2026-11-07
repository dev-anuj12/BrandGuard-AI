import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Security Policy',
  description: 'BrandGuard AI Security Architecture — encryption standards, tenant isolation, SSRF defenses, vulnerability reporting, and audit trails.',
};

export default function SecurityPolicyPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Security Policy' }]}
      badge="Security Architecture"
      title="Security &amp; Data Safeguards Policy"
      subtitle="Comprehensive technical safeguards, multi-tenant isolation, cryptographic standards, and vulnerability reporting procedures."
      lastUpdated="November 7, 2026"
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Multi-Tenant Cryptographic &amp; Logical Isolation</h2>
          <p>
            BrandGuard AI employs a defense-in-depth security model to ensure enterprise content and telemetry remain strictly confidential:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tenant Partitioning</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mandatory organization-level filters applied at the database querying layer in FastAPI prevent cross-tenant record leakage.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Encryption at Rest &amp; Transit</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All client interactions mandate TLS 1.3 encryption in transit. Relational database storage is encrypted at rest using AES-256.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Server-Side Request Forgery Defense</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perimeter domain scanners incorporate strict IP validation preventing internal network probing (RFC 1918 / Loopback address blocking).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Immutable Audit Trail</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every content creation, review, and approval action writes a permanent record with actor ID, timestamp, and modification payload.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Responsible Vulnerability Disclosure</h2>
          <p>
            We welcome vulnerability reports from independent security researchers and customers. If you discover a potential security flaw:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Submit full details via our <Link href="/report-bug" className="text-indigo-600 dark:text-indigo-400 underline">Report a Bug / Vulnerability portal</Link>.</li>
            <li>Provide reasonable time for our engineering team to remediate before public disclosure.</li>
            <li>Do not access or tamper with data belonging to other tenant organizations.</li>
          </ul>
        </section>
      </div>
    </PublicLayout>
  );
}

