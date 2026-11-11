import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'BrandGuard AI Privacy Policy — data governance, account management, local storage, and AI processing disclosures.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 7, 2026';

  const sections = [
    { id: 'introduction', title: '1. Introduction & Enterprise Scope' },
    { id: 'data-collected', title: '2. Categories of Data Collected' },
    { id: 'processing-purposes', title: '3. Processing Purposes' },
    { id: 'ai-processing', title: '4. AI Engine Processing & Telemetry' },
    { id: 'storage-security', title: '5. Multi-Tenant Storage & Security Controls' },
    { id: 'cookies-localstorage', title: '6. Cookies, Local Storage & Session State' },
    { id: 'third-parties', title: '7. Subprocessors & Third-Party APIs' },
    { id: 'data-retention', title: '8. Data Retention & Archival Policies' },
    { id: 'user-rights', title: '9. Rights Under Data Protection Regulations' },
    { id: 'contact-privacy', title: '10. Privacy & Legal Contact' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Privacy Policy' }]}
      badge="Legal &amp; Privacy"
      title="Privacy Policy"
      subtitle="How BrandGuard AI handles organizational telemetry, content reviews, and personal data."
      lastUpdated={lastUpdated}
      legalNotice={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents Sticky Sidebar */}
        <aside className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              Contents
            </span>
            <nav className="space-y-1.5">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Policy Body */}
        <div className="lg:col-span-3 space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
          <section id="introduction" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              1. Introduction &amp; Enterprise Scope
            </h2>
            <p>
              BrandGuard AI operates a brand governance and digital threat defense platform.
            </p>
            <p>
              This Privacy Policy explains how personal data, brand assets, and content submissions are handled when interacting with the BrandGuard AI web application, APIs, and protection scanners.
            </p>
          </section>

          <section id="data-collected" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              2. Categories of Data Collected
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Identity:</strong> Business email address, full name, organization membership, and role-based permissions (Creator, Reviewer, Manager, Admin).
              </li>
              <li>
                <strong>Authentication Credentials:</strong> Password hashes using bcrypt. Plaintext passwords are never stored.
              </li>
              <li>
                <strong>Content Submissions &amp; Artifacts:</strong> Marketing copy, regulatory disclaimers, brand images, product descriptions, and associated compliance revision histories.
              </li>
              <li>
                <strong>Audit Telemetry:</strong> Audit logs recording actor IDs, approval timestamps, changes required notes, and manager sign-offs for audit readiness.
              </li>
              <li>
                <strong>Perimeter Threat Signals:</strong> Scanned third-party URLs, domain WHOIS records, SSL certificate metadata, and public social handles analyzed during impersonation detection.
              </li>
            </ul>
          </section>

          <section id="processing-purposes" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              3. Processing Purposes
            </h2>
            <p>
              We process personal data and organizational assets for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Service Delivery:</strong> To provide automated brand compliance analysis, workflow management, and threat alerting.</li>
              <li><strong>Security:</strong> To detect security anomalies, prevent cross-tenant credential leakage, and maintain platform integrity.</li>
              <li><strong>Auditability:</strong> To record governance decisions and audit history.</li>
            </ul>
          </section>

          <section id="ai-processing" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              4. AI Engine Processing &amp; Telemetry
            </h2>
            <p>
              BrandGuard AI operates a hybrid compliance review architecture consisting of:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li><strong>Deterministic Rule Engine:</strong> Executes local regex and dictionary matching on active brand guidelines, banned terminology, and required disclaimers without external transmission.</li>
              <li><strong>Citation &amp; Fact Validator:</strong> Validates claims against pre-approved organizational fact repositories.</li>
              <li><strong>LLM Inference Engine:</strong> When configured with an enterprise AI API key (OpenAI or Google Gemini), submitted text is transmitted via HTTPS to the specified provider for semantic evaluation.</li>
            </ol>
          </section>

          <section id="storage-security" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              5. Multi-Tenant Storage &amp; Security Controls
            </h2>
            <p>
              All customer records are partitioned with organization-level tenant filters across relational database tables. Row-level data isolation prevents cross-organization access. Data at rest is protected [[TO BE COMPLETED]], and data in transit is protected via HTTPS. Server-Side Request Forgery (SSRF) protections guard scanner engines from accessing private network ranges.
            </p>
          </section>

          <section id="cookies-localstorage" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              6. Cookies, Local Storage &amp; Session State
            </h2>
            <p>
              BrandGuard AI session handling:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Local Storage (Necessary):</strong> Stores signed JWT bearer tokens, active user role context, and theme selection.</li>
              <li><strong>Consent Management:</strong> Optional functional or analytics preferences can be managed via our <Link href="/cookie-preferences" className="text-indigo-600 dark:text-indigo-400 underline">Cookie Preferences</Link> manager.</li>
            </ul>
          </section>

          <section id="third-parties" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              7. Subprocessors &amp; Third-Party APIs
            </h2>
            <p>
              Depending on customer configuration, data may be processed by third-party services:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg">
                <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-900 dark:text-white">
                  <tr>
                    <th className="p-2.5 text-left font-semibold">Subprocessor</th>
                    <th className="p-2.5 text-left font-semibold">Role / Service</th>
                    <th className="p-2.5 text-left font-semibold">Data Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-medium">PostgreSQL / Cloud DB</td>
                    <td className="p-2.5">Primary relational database hosting</td>
                    <td className="p-2.5">Configured Region</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">OpenAI / Google Gemini</td>
                    <td className="p-2.5">Semantic compliance analysis (optional BYOK)</td>
                    <td className="p-2.5">United States / Global</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Hosting &amp; Edge CDN</td>
                    <td className="p-2.5">Hosting, SSL termination &amp; DNS routing</td>
                    <td className="p-2.5">Global Edge Network</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="data-retention" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              8. Data Retention &amp; Archival Policies
            </h2>
            <p>
              Customer content and audit records are retained for the duration of the active subscription agreement. Customers may initiate self-service data exports or submit account deletion requests through our <Link href="/settings/data-export" className="text-indigo-600 dark:text-indigo-400 underline">Account Settings</Link>.
            </p>
          </section>

          <section id="user-rights" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              9. Rights Under Data Protection Regulations
            </h2>
            <p>
              Under applicable data protection laws [[TO BE COMPLETED]], users maintain rights to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request access to personal data being processed.</li>
              <li>Request correction or updating of inaccurate personal data.</li>
              <li>Request erasure of personal data through self-service deletion or by contacting support.</li>
              <li>Export account data using the built-in self-service export tool.</li>
            </ul>
          </section>

          <section id="contact-privacy" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              10. Privacy &amp; Legal Contact
            </h2>
            <p>
              For privacy inquiries or compliance questions:
            </p>
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1 font-mono">
              <p><strong>BrandGuard AI Privacy Office</strong></p>
              <p>Contact: [[TO BE COMPLETED]] (via our <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact page</Link>)</p>
              <p>Response SLA: [[TO BE COMPLETED]]</p>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
