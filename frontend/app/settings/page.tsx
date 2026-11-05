'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, ShieldCheck, Building, Cpu, Database, 
  LogOut, CheckCircle2, Lock, Sparkles, BookOpen
} from 'lucide-react';
import { api, getCurrentUser, clearAuthSession } from '../../lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const curUser = getCurrentUser();
    if (!curUser) {
      router.push('/login');
      return;
    }
    setUser(curUser);
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Profile &amp; Brand Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your authenticated identity, active FinNova brand profile, and AI engine status.
        </p>
      </div>

      {/* User Identity Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/30">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{user?.full_name || 'Loading...'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <span className="text-[10px] text-slate-500 font-mono">User ID: #{user?.id || 1} • Status: Active</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* FinNova Fictional Demonstration Profile */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">FinNova Financial Technologies</h3>
          </div>
          <span className="text-xs text-indigo-300 font-semibold bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-800">
            Active Brand Identity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Official Communication Tone
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Professional', 'Trustworthy', 'Clear', 'Customer-friendly', 'Responsible'].map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-[11px] pt-1">
              Marketing copy must remain disciplined and transparent. All hype and predatory promises are filtered.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
              Approved Terminology
            </span>
            <ul className="text-slate-400 space-y-1 text-[11px]">
              <li>• Use <strong className="text-emerald-400">&quot;digital financial services&quot;</strong> (not &quot;money app&quot;)</li>
              <li>• Use <strong className="text-emerald-400">&quot;secure transactions&quot;</strong> (not &quot;unhackable transfers&quot;)</li>
              <li>• Use <strong className="text-emerald-400">&quot;financial planning&quot;</strong> (not &quot;wealth wizardry&quot;)</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs space-y-1">
          <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] block">
            Strictly Prohibited Expressions
          </span>
          <p className="text-slate-300 text-[11px]">
            &quot;guaranteed returns&quot;, &quot;risk-free investment&quot;, &quot;instant wealth&quot;, &quot;100% profit&quot;.
            Direct violation of FinNova regulatory compliance policies.
          </p>
        </div>
      </div>

      {/* AI Engine & System Specifications */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-base">AI Engine &amp; Technical Architecture</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">LLM Provider</span>
            <div className="font-bold text-purple-300">Rule Engine + AI Fallback</div>
            <p className="text-slate-500 text-[10px]">OpenAI &amp; Gemini compatible with zero-key fallback</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Relational Database</span>
            <div className="font-bold text-emerald-300">PostgreSQL / SQLAlchemy</div>
            <p className="text-slate-500 text-[10px]">Alembic migration support &amp; 16 relational models</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Hackathon Event</span>
            <div className="font-bold text-indigo-300">CodeNexus India 2026</div>
            <p className="text-slate-500 text-[10px]">National Hackathon submission</p>
          </div>
        </div>
      </div>
    </div>
  );
}
