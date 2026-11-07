import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'BrandGuard AI Privacy Policy — data governance, DPDP Act and GDPR compliance, local storage, and AI processing disclosures.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 7, 2026';

  const sections = [
    { id: 'introduction', title: '1. Introduction & Enterprise Scope' },
    { id: 'data-collected', title: '2. Categories of Data Collected' },
    { id: 'processing-purposes', title: '3. Lawful Bases & Processing Purposes' },
    { id: 'ai-processing', title: '4. AI Engine Processing & Telemetry' },
    { id: 'storage-security', title: '5. Multi-Tenant Storage & Security Controls' },
    { id: 'cookies-localstorage', title: '6. Cookies, Local Storage & Session State' },
    { id: 'third-parties', title: '7. Subprocessors & Third-Party APIs' },
    { id: 'data-retention', title: '8. Data Retention & Archival Policies' },
    { id: 'user-rights', title: '9. Rights Under DPDP Act, GDPR & Regional Laws' },
    { id: 'contact-dpo', title: '10. Data Protection Officer Contact' },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Legal' }, { label: 'Privacy Policy' }]}
      badge="Legal &amp; Privacy"
      title="Privacy Policy"
      subtitle="How BrandGuard AI protects organizational telemetry, content reviews, and personal data under enterprise compliance standards."
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
              BrandGuard AI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates an enterprise brand governance and digital threat defense platform. We act primarily as a <strong>Data Processor</strong> on behalf of our enterprise customers (the &quot;Data Fiduciaries&quot; or &quot;Data Controllers&quot;), and as a <strong>Data Controller</strong> solely for direct account administration and platform billing telemetry.
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
                <strong>Authentication Credentials:</strong> Salted password hashes using industry-standard bcrypt (cost factor 12). Plaintext passwords are never stored, logged, or retrievable.
              </li>
              <li>
                <strong>Content Submissions &amp; Artifacts:</strong> Marketing copy, regulatory disclaimers, brand images, product descriptions, and associated compliance revision histories.
              </li>
              <li>
                <strong>Audit Telemetry:</strong> Immutable audit logs recording actor IDs, approval timestamps, changes required notes, and manager sign-offs for SOC2/ISO compliance readiness.
              </li>
              <li>
                <strong>Perimeter Threat Signals:</strong> Scanned third-party URLs, domain WHOIS records, SSL certificate metadata, and public social handles analyzed during impersonation detection.
              </li>
            </ul>
          </section>

          <section id="processing-purposes" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              3. Lawful Bases &amp; Processing Purposes
            </h2>
            <p>
              We process personal data and organizational assets under the following lawful bases:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Contractual Performance:</strong> To provide automated brand compliance analysis, workflow management, and threat alerting as stipulated in customer subscription agreements.</li>
              <li><strong>Legitimate Interests:</strong> To detect security anomalies, prevent cross-tenant credential leakage, and maintain platform integrity.</li>
              <li><strong>Legal Compliance:</strong> To satisfy statutory recordkeeping and auditability mandates under financial marketing regulations and corporate transparency requirements.</li>
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
              <li><strong>LLM Inference Engine:</strong> When configured with an enterprise AI API key (OpenAI or Google Gemini), submitted text is transmitted via TLS 1.3 to the specified provider for semantic evaluation. <em>Customer content is never used to train foundation models without explicit contractual opt-in.</em></li>
            </ol>
          </section>

          <section id="storage-security" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              5. Multi-Tenant Storage &amp; Security Controls
            </h2>
            <p>
              All customer records are partitioned with strict organization-level tenant filters across relational database tables. Row-level data isolation prevents cross-organization access. Data at rest is encrypted using AES-256, and data in transit is protected via TLS 1.3. Server-Side Request Forgery (SSRF) protections guard scanner engines from accessing private network ranges.
            </p>
          </section>

          <section id="cookies-localstorage" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              6. Cookies, Local Storage &amp; Session State
            </h2>
            <p>
              BrandGuard AI prioritizes transparent, cookie-light architecture:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Local Storage (Necessary):</strong> Stores signed JWT bearer tokens, active user role context, and theme selection.</li>
              <li><strong>Consent Management:</strong> Optional functional or analytics telemetry is gated by our interactive <Link href="/cookie-preferences" className="text-indigo-600 dark:text-indigo-400 underline">Cookie Preferences</Link> manager.</li>
            </ul>
          </section>

          <section id="third-parties" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              7. Subprocessors &amp; Third-Party APIs
            </h2>
            <p>
              Depending on customer configuration, data may be processed by the following enterprise subprocessors:
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
                    <td className="p-2.5">Customer Selected Region</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">OpenAI / Google Gemini</td>
                    <td className="p-2.5">Semantic compliance analysis (optional BYOK)</td>
                    <td className="p-2.5">United States / Global</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Cloudflare / Edge CDN</td>
                    <td className="p-2.5">DDoS mitigation, SSL termination &amp; DNS routing</td>
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
              Customer content and audit records are retained for the duration of the active subscription agreement plus an optional 90-day post-termination grace period for data extraction. Customers may initiate self-service data exports or submit verifiable account deletion requests at any time through our <Link href="/settings/data-export" className="text-indigo-600 dark:text-indigo-400 underline">Account Settings</Link>.
            </p>
          </section>

          <section id="user-rights" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              9. Rights Under DPDP Act, GDPR &amp; Regional Laws
            </h2>
            <p>
              Under applicable statutory frameworks (including India&apos;s Digital Personal Data Protection Act, 2023 and the EU General Data Protection Regulation), data principals maintain rights to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request a summary of personal data being processed and identities of processing entities.</li>
              <li>Request correction, completion, or updating of inaccurate personal data.</li>
              <li>Request erasure of personal data where retention is no longer necessary for lawful business purposes.</li>
              <li>Nominate an individual to exercise rights in event of death or incapacity (DPDP Act).</li>
            </ul>
          </section>

          <section id="contact-dpo" className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              10. Data Protection Officer Contact
            </h2>
            <p>
              For privacy inquiries, DPA execution, or regulatory audit disclosures:
            </p>
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1 font-mono">
              <p><strong>BrandGuard AI Privacy Office</strong></p>
              <p>Email: <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">privacy@brandguard.io</Link></p>
              <p>Response SLA: Within 48 business hours</p>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
