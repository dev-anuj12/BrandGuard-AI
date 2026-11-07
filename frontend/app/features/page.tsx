import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  ShieldCheck, Cpu, CheckCircle2, Lock, Eye, AlertTriangle, 
  BarChart3, FileText, ArrowRight, Globe, Layers, Sliders 
} from 'lucide-react';
import PublicLayout from '../../components/PublicLayout';

export const metadata: Metadata = {
  title: 'Platform Features & Capabilities',
  description: 'Explore the full capabilities of BrandGuard AI — deterministic compliance rule engines, citation validators, and perimeter threat defense.',
};

export default function FeaturesPage() {
  const capabilities = [
    {
      title: 'Deterministic Rule Engine',
      category: 'Internal Governance',
      icon: Cpu,
      description: 'Executes regex policies, forbidden terminology matching, and mandatory disclaimer checks with sub-millisecond latency. Zero hallucination guarantee on hard regulatory standards.',
    },
    {
      title: 'Fact & Citation Validator',
      category: 'Claim Verification',
      icon: CheckCircle2,
      description: 'Validates quantitative marketing statistics against pre-approved corporate fact repositories. Flags unverified financial, yield, or product performance assertions.',
    },
    {
      title: 'Semantic LLM Inference',
      category: 'Tone & Policy',
      icon: Eye,
      description: 'Analyzes subtle tone deviations, non-inclusive phrasing, and compliance risk nuances using OpenAI or Google Gemini enterprise APIs.',
    },
    {
      title: 'Four-Role Segregated RBAC',
      category: 'Workflow & Auditing',
      icon: Lock,
      description: 'Role-based authorization enforces sequential progression: Creator draft &rarr; Reviewer verification &rarr; Manager approval &rarr; Admin oversight with immutable audit logs.',
    },
    {
      title: 'Homoglyph & Phishing Domain Scanner',
      category: 'Perimeter Defense',
      icon: Globe,
      description: 'Scans punycode and confusable Cyrillic/Greek domain lookalikes targeting your enterprise brand. Inspects WHOIS, SSL certificates, and credential harvesting forms.',
    },
    {
      title: 'Social & Counterfeit Intel',
      category: 'Brand Protection',
      icon: ShieldCheck,
      description: 'Monitors unauthorized customer support accounts, fake VIP airdrop bots, and marketplace counterfeit listings undercutting manufacturer MSRP.',
    },
  ];

  return (
    <PublicLayout
      breadcrumbs={[{ label: 'Product' }, { label: 'Features' }]}
      badge="Capabilities"
      title="Comprehensive Enterprise Brand Protection"
      subtitle="An integrated suite bridging internal content compliance governance with real-time digital perimeter defense."
    >
      <div className="space-y-12 max-w-4xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {c.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{c.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.description}</p>
              </div>
            );
          })}
        </div>

        <div className="p-8 rounded-2xl bg-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/10">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-lg">Ready to protect your brand assets?</h4>
            <p className="text-xs text-indigo-100">Deploy BrandGuard AI across your organization in minutes.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm transition"
            >
              Get Started
            </Link>
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

