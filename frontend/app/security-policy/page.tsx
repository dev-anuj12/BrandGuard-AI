import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Security Policy | BrandGuard AI',
  description: 'BrandGuard AI Security Architecture — encryption standards, tenant isolation, SSRF defenses, vulnerability reporting, and audit trails.',
  alternates: {
    canonical: 'https://brandguard-ai-eight.vercel.app/security-policy',
  },
  openGraph: {
    title: 'Security Policy | BrandGuard AI',
    description: 'BrandGuard AI Security Architecture — encryption standards, tenant isolation, SSRF defenses, vulnerability reporting, and audit trails.',
    url: 'https://brandguard-ai-eight.vercel.app/security-policy',
  },
};

export default function SecurityPolicyPage() {
  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Security Policy' }]}
      badge="Security Architecture"
      title="Security &amp; Data Safeguards Policy"
      subtitle="Technical safeguards, multi-tenant logical isolation, data protection measures, and vulnerability reporting procedures."
      lastUpdated="November 7, 2026"
    >
      <div className="space-y-8 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Multi-Tenant Logical Isolation</h2>
          <p>
            BrandGuard AI employs security practices to protect enterprise content and telemetry:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-purple-400 uppercase tracking-wider">Tenant Partitioning</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organization-level filters applied at the database querying layer in FastAPI prevent cross-tenant record leakage.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-purple-400 uppercase tracking-wider">Encryption at Rest &amp; Transit</span>
              {/* [[TO BE COMPLETED]] */}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Client interactions use HTTPS in transit. Database storage details will be published at launch.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-purple-400 uppercase tracking-wider">Server-Side Request Forgery Defense</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perimeter domain scanners incorporate IP validation preventing internal network probing (RFC 1918 / Loopback address blocking).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#120924]/85 backdrop-blur-xl border border-slate-200 dark:border-purple-900/35 space-y-1.5">
              <span className="font-bold text-xs text-indigo-600 dark:text-purple-400 uppercase tracking-wider">Audit Trail Logging</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Content creation, review, and approval actions write an audit record with actor ID, timestamp, and modification payload.
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
            <li>Submit full details via our <Link href="/report-bug" className="text-indigo-600 dark:text-purple-400 underline">Report a Bug / Vulnerability portal</Link>.</li>
            <li>Provide reasonable time for our engineering team to remediate before public disclosure.</li>
            <li>Do not access or tamper with data belonging to other tenant organizations.</li>
          </ul>
        </section>
      </div>
    </PublicLayout>
  );
}
