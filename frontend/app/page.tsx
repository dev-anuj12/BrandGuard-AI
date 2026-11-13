'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, 
  Search, Cpu, Users, Building, BarChart3, Lock, 
  FileText, Check, ChevronRight, Moon, Sun, Sliders, Globe,
  Menu, X, ShieldAlert, Layers
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { getCurrentUser } from '../lib/api';
import BrandLogo from '../components/BrandLogo';
import PublicFooter from '../components/PublicFooter';

export default function LandingPage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Professional Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#060913]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="md" showSubtitle={true} href="/" />

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition">Capabilities</a>
            <a href="#workflow" className="hover:text-indigo-600 dark:hover:text-white transition">Workflow Engine</a>
            <a href="#governance" className="hover:text-indigo-600 dark:hover:text-white transition">Governance &amp; RBAC</a>
            <a href="#benchmark" className="hover:text-indigo-600 dark:hover:text-white transition">Accuracy Benchmark</a>
            <a href="#security" className="hover:text-indigo-600 dark:hover:text-white transition">Security &amp; Audit</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
              aria-label="Toggle between dark and light theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {user ? (
              <Link
                href={`/dashboard/${user.role?.toLowerCase() || 'creator'}`}
                className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition items-center gap-1.5"
              >
                <span>Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle mobile navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#060913]/95 backdrop-blur-xl px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Capabilities
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Workflow Engine
              </a>
              <a
                href="#governance"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Governance &amp; RBAC
              </a>
              <a
                href="#benchmark"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Accuracy Benchmark
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Security &amp; Audit
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Contact &amp; Support
              </Link>
            </nav>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {user ? (
                <Link
                  href={`/dashboard/${user.role?.toLowerCase() || 'creator'}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                >
                  Go to Workspace
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* JSON-LD Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "BrandGuard AI",
            "operatingSystem": "All",
            "applicationCategory": "BusinessApplication",
            "url": "https://brandguard-ai-eight.vercel.app",
            "description": "Enterprise AI-Powered Brand Governance & Digital Brand Protection Platform",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      <main id="main-content">
      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Intelligent Content Governance &amp; Brand Safety</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Brand Compliance, <br />
          <span className="text-indigo-600 dark:text-indigo-400">Made Intelligent.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Review content, enforce brand guidelines, validate citations, and manage approvals through one intelligent compliance platform.
        </p>

        {/* Core Product Promise */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-blue-50/80 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-blue-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Core Promise: &ldquo;Every content decision should be explainable, evidence-backed and human-controlled.&rdquo;
          </span>
        </div>

        {/* Primary and Secondary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 transition flex items-center gap-2"
          >
            <span>Explore Platform</span>
          </Link>
        </div>

        {/* 4. Product Dashboard Preview */}
        <div className="mt-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl p-4 shadow-card text-left backdrop-blur-xl">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#060913] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-2">BrandGuard Review Workspace</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                Compliance Score: 42% (Changes Mandated)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed font-mono text-slate-800 dark:text-slate-200 shadow-inner">
              Our brand platform is an ultra-fast{' '}
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800 font-bold">
                money app [Incorrect Terminology]
              </span>{' '}
              that promises{' '}
              <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800 font-bold">
                guaranteed returns [Banned Expression]
              </span>{' '}
              for every customer! Our platform provides a{' '}
              <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800 font-bold">
                risk-free investment [Prohibited Claim]
              </span>{' '}
              with 100% profit guaranteed.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Regulatory Violation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Unconditional yield promise violates Financial Claims &amp; Guarantees Policy.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>Citation Validation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Zero grounding evidence found in approved regulatory filings.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Suggested Correction</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  &quot;market-competitive returns designed around your risk profile&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Features */}
      <section id="features" className="py-20 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Product Capabilities</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Built for Enterprise Scale and Brand Integrity
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
            Everything your organization needs to protect brand voice, satisfy regulatory scrutiny, and streamline publication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Deterministic Rule Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instant regex-level detection of prohibited expressions, non-compliant naming, and omitted legal disclosures.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Contextual LLM Analysis</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Analyzes brand tone nuances, sensationalized marketing claims, and inappropriate collateral against your active corporate guidelines.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Citation Grounding</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cross-references claims against verified regulatory registries, preventing unsubstantiated superlatives from reaching the public.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Digital Perimeter Defense</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              On-demand inspection for lookalike phishing domains, Cyrillic homoglyph mimics, social impersonation, and counterfeit listings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Role-Segregated Governance</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Separation of duties across Creators, Reviewers, and Managers with verifiable sign-offs, change logs, and decision rationale.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tenant-isolated workspace context enforced at the database and API level, preventing cross-organization leakage with append-only audit logging.
            </p>
          </div>
        </div>
      </section>

      {/* 6. AI-assisted compliance workflow & 7. Human review & approval process */}
      <section id="workflow" className="py-20 bg-slate-100/60 dark:bg-[#060913] border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Governance Pipeline</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Efficiency With Human Authority
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              AI provides rapid diagnostic evidence, but authorized human personnel retain complete decision-making control at every gate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: 'Stage 01',
                title: 'Draft Submission',
                role: 'Creator',
                desc: 'Marketing teams draft content and submit collateral for automated compliance review.',
              },
              {
                step: 'Stage 02',
                title: 'Automated Audit',
                role: 'BrandGuard AI',
                desc: 'Multi-engine pipeline scans for terminology, tone deviations, and citation verification.',
              },
              {
                step: 'Stage 03',
                title: 'Quality Verification',
                role: 'Reviewer',
                desc: 'Compliance specialists inspect flagged issues, examine evidence, and add auditor notes.',
              },
              {
                step: 'Stage 04',
                title: 'Executive Sign-Off',
                role: 'Manager',
                desc: 'Department leadership reviews verified material and grants formal approval or rejects.',
              },
            ].map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-subtle transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">{st.step}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#0D1224]/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80">
                    {st.role}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{st.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Analytics and Governance */}
      <section id="governance" className="py-20 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Enterprise Analytics</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Real-Time Compliance Telemetry &amp; Decision History
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Track organization-wide compliance performance over time. View violation frequencies, suggestion acceptance rates, and average review turnaround directly from live database metrics.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero fabricated metrics — telemetry generated directly from relational records</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Categorized frequency charts for proactive copywriter training</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Version history preserved across all content revisions</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Governance Roles</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60">
                <span className="text-[10px] text-slate-500 block">Creator</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Content Submissions</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60">
                <span className="text-[10px] text-slate-500 block">Reviewer</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Guideline Verification</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60">
                <span className="text-[10px] text-slate-500 block">Manager</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Approval &amp; Sign-off</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60">
                <span className="text-[10px] text-slate-500 block">Admin</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">System &amp; Policies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8.5. Accuracy Benchmark Section */}
      <section id="benchmark" className="py-20 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            Empirical Validation
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Measured Accuracy Benchmark (Rules-Only Baseline)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Every governance engine claim is backed by empirical testing on held-out compliance test splits. We report honest precision, recall, and error rates without synthetic inflation.
          </p>
        </div>

        {/* Primary Benchmark Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Precision</span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">90.9%</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">0.909 (95% CI: 72.2–97.5%)</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Recall</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">62.5%</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">0.625 (95% CI: 45.3–77.1%)</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">F1 Score</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">0.741</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Harmonic Mean (74.1%)</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">False Positive Rate</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">25.0%</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">FPR: 0.250</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">False Negative Rate</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">37.5%</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">FNR: 0.375</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-1 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">Evaluation Size</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200 font-mono">N = 40</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Held-Out Test Split</span>
          </div>
        </div>

        {/* Verified Disclosures & Honest Boundaries */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                Important Methodology &amp; Scope Disclosure
              </p>
              <p className="leading-relaxed">
                <strong>These results reflect the deterministic Rules-Only engine</strong> evaluated on <code className="font-mono text-indigo-600 dark:text-indigo-400">holdout_v2</code>. AI-only and combined live-LLM benchmarks require configured external API credentials (<code className="font-mono">OPENAI_API_KEY</code> or <code className="font-mono">GEMINI_API_KEY</code>) and are currently labeled as <em>Offline / Unmeasured</em> to prevent synthetic or fabricated claims.
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                Because N = 40, 95% Wilson confidence intervals are wide. These numbers represent honest empirical point estimates on specific regulatory and marketing test cases, not universal accuracy guarantees across unconstrained copy.
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              Evaluation Commit: <code className="text-indigo-600 dark:text-indigo-400 font-bold">feat/round3-extra</code>
            </span>
            <Link
              href="/benchmark"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
            >
              <span>View Full Benchmark Methodology &amp; Split Tables</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Security and Administration */}
      <section id="security" className="py-20 bg-slate-100/60 dark:bg-[#060913] border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Enterprise Security</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Structured Audit Logging &amp; Role-Based Access Control
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm">
              Every status transition, content modification, and managerial sign-off is logged in an audit ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">JWT Authentication</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tokens signed with HS256 and salted bcrypt password hashing across all user sessions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Backend RBAC</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Four distinct permission boundaries strictly validated at the API layer for all operations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Append-Only Audit Trail</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Timestamped snapshots recording user ID, action, prior state, and resulting state.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Privacy First</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero client credential leakage and deterministic fallback capability when external AI services are unconfigured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Call-to-Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Ready to Elevate Your Brand Governance?
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Experience how intelligent brand compliance and structured human oversight protect your organization from regulatory risk.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-[#0D1224]/80 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 transition"
          >
            <span>Explore Platform</span>
          </Link>
        </div>
      </section>
      </main>

      {/* 11. 5-Column Enterprise Footer */}
      <PublicFooter />
    </div>
  );
}
