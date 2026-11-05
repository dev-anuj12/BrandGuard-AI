import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowRight, Sparkles, FileText, CheckCircle2, 
  AlertTriangle, Lock, Search, Cpu, Users, Building, ChevronRight, BarChart3
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 text-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] bg-purple-500/15 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-xs font-semibold text-indigo-300 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>CodeNexus India 2026 National Hackathon Showcase</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          AI-Powered Brand Compliance &amp; Content Review Platform
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Safeguard your corporate reputation with instant violation detection, explainable AI suggestions, grounded citation validation, and a human-controlled 4-stage approval workflow.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-7 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>Launch Live Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/submit"
            className="px-7 py-3.5 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Submit Content for Review</span>
          </Link>
        </div>

        {/* FinNova Demo Pill */}
        <div className="mt-8 inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl">
          <Building className="w-4 h-4 text-indigo-400" />
          <span>Fictional Demonstration Profile:</span>
          <span className="font-semibold text-slate-200">FinNova Financial Technologies</span>
          <span className="text-slate-500">(Sample Compliance Guidelines Active)</span>
        </div>

        {/* Live UI Preview Card */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-2xl backdrop-blur-xl">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">BrandGuard Review Engine v1.0.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60">
                  Compliance Score: 42% (Changes Required)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800 text-sm leading-relaxed text-slate-300 font-mono">
              FinNova is an ultra-fast{' '}
              <span className="bg-amber-950/80 text-amber-300 px-1 py-0.5 rounded border border-amber-800 font-bold">
                money app [Incorrect Term]
              </span>{' '}
              that promises{' '}
              <span className="bg-rose-950/80 text-rose-300 px-1 py-0.5 rounded border border-rose-800 font-bold">
                guaranteed returns [Banned Expression]
              </span>{' '}
              for every customer! Our platform provides a{' '}
              <span className="bg-rose-950/80 text-rose-300 px-1 py-0.5 rounded border border-rose-800 font-bold">
                risk-free investment [Prohibited Claim]
              </span>{' '}
              with 100% profit guaranteed.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-rose-300 block">Prohibited Financial Guarantee</span>
                  <span className="text-slate-400">Violates FinNova Regulatory Claims Guideline ID #1</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                <Search className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-blue-300 block">Citation Grounding</span>
                  <span className="text-slate-400">Zero approved sources found for claims</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300 block">One-Click AI Correction</span>
                  <span className="text-slate-400">&quot;digital financial services designed for you&quot;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">How BrandGuard AI Works</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            From raw marketing drafts to audited, executive-approved copy in four systematic stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Ingest Guidelines',
              desc: 'Admin uploads corporate brand tone, banned terminology, product facts, and approved regulatory sources into PostgreSQL.',
              icon: Building,
              color: 'text-indigo-400'
            },
            {
              step: '02',
              title: 'AI Multi-Engine Audit',
              desc: 'Content passes through deterministic Rule Engine, LLM Tone Analysis, Citation Validator, and Confidence Calibration.',
              icon: Cpu,
              color: 'text-purple-400'
            },
            {
              step: '03',
              title: 'Creator Revision',
              desc: 'Marketing creators accept or reject explainable AI corrections with full version history tracking. No blind overwrites.',
              icon: FileText,
              color: 'text-blue-400'
            },
            {
              step: '04',
              title: 'Human Governance',
              desc: 'Reviewers inspect unresolved findings, add notes, and Compliance Managers grant final audited sign-off.',
              icon: ShieldCheck,
              color: 'text-emerald-400'
            }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-700">{item.step}</span>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Core Intelligence Modules */}
      <section className="space-y-12 bg-slate-950/60 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 border-y border-slate-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Core Architecture</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Four Independent Intelligence Engines</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Engineered with deterministic safety rails, factual grounding, and explainable AI confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 font-bold">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Module A: Deterministic Rule Engine</h3>
                  <span className="text-xs text-rose-400 font-medium">Banned Phrases &amp; Required Disclaimers</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Matches prohibited terms (&quot;guaranteed returns&quot;, &quot;risk-free investment&quot;), flags incorrect naming, and checks mandatory risk disclosure presence using zero-latency regex tokenization.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 font-bold">
                  B
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Module B: Contextual LLM Engine</h3>
                  <span className="text-xs text-purple-400 font-medium">Tone &amp; Subtle Misleading Claims</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Evaluates communication tone (Professional, Trustworthy, Customer-friendly vs Hype) using configured OpenAI/Gemini providers with an automatic deterministic semantic fallback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400 font-bold">
                  C
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Module C: Citation Validator</h3>
                  <span className="text-xs text-blue-400 font-medium">Evidence Grounding &amp; Source Verification</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Extracts citations, checks against approved regulatory URLs, and differentiates between verified evidence, unverified domains, and completely unsupported numerical superlatives.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 font-bold">
                  D
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Module D: Confidence Scorer</h3>
                  <span className="text-xs text-emerald-400 font-medium">Calibrated Confidence &amp; Compliance Index</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Calculates transparent confidence tiers (High 90%+, Medium, Low) and generates a unified 0-100% Brand Compliance Score with severity-weighted deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Workflows Showcase */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">Enterprise Governance</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Four Distinct Stakeholder Roles</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Granular permissions enforced via backend JWT tokens and database access control.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: 'Creator',
              member: 'Nakshatra Titarmare',
              actions: ['Submit marketing campaigns', 'Inspect AI problem flags', 'Accept/reject suggestions', 'Submit revision v2+']
            },
            {
              role: 'Reviewer',
              member: 'Anuj Vishwakarma',
              actions: ['Examine unresolved findings', 'Verify creator corrections', 'Add verification notes', 'Request additional changes']
            },
            {
              role: 'Manager',
              member: 'Compliance Lead',
              actions: ['Executive approval sign-off', 'One-click content rejection', 'Mandate regulatory changes', 'Audit decision logs']
            },
            {
              role: 'Admin',
              member: 'Lakshita Bisen',
              actions: ['Configure brand guidelines', 'Manage banned words registry', 'Verify approved sources', 'Monitor live system audit']
            }
          ].map((r, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-800/60 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{r.role}</span>
                  <span className="text-[10px] text-slate-500">{r.member}</span>
                </div>
                <h4 className="font-bold text-white text-base mb-4">{r.role} Portal</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {r.actions.map((act, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
                >
                  <span>Log in as {r.role}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-10 rounded-3xl bg-gradient-to-b from-indigo-950/60 to-slate-900 border border-indigo-800/40 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Experience Intelligent Brand Compliance in Action
        </h2>
        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
          Test real-time brand rule violation detection, one-click content correction, and human managerial approval with pre-loaded FinNova demonstration data.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all"
          >
            <span>Explore Live Demo Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
