'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, UserCheck, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { api, setAuthSession } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.login({ email: loginEmail, password: loginPass });
      setAuthSession(data.access_token, data.user);

      // Redirect based on role
      switch (data.user.role) {
        case 'CREATOR':
          router.push('/dashboard/creator');
          break;
        case 'REVIEWER':
          router.push('/dashboard/reviewer');
          break;
        case 'MANAGER':
          router.push('/dashboard/manager');
          break;
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/dashboard/creator');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleDemoLogin = (role: 'CREATOR' | 'REVIEWER' | 'MANAGER' | 'ADMIN') => {
    switch (role) {
      case 'CREATOR':
        setEmail('creator@finnova.com');
        setPassword('Creator@123');
        performLogin('creator@finnova.com', 'Creator@123');
        break;
      case 'REVIEWER':
        setEmail('reviewer@finnova.com');
        setPassword('Reviewer@123');
        performLogin('reviewer@finnova.com', 'Reviewer@123');
        break;
      case 'MANAGER':
        setEmail('manager@finnova.com');
        setPassword('Manager@123');
        performLogin('manager@finnova.com', 'Manager@123');
        break;
      case 'ADMIN':
        setEmail('admin@finnova.com');
        setPassword('Admin@123');
        performLogin('admin@finnova.com', 'Admin@123');
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0">
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to BrandGuard AI</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Access your role-based compliance workspace
        </p>
      </div>

      {/* 1-Click Hackathon Evaluator Quick Switcher */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/50 space-y-3 mb-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Hackathon Evaluator 1-Click Access</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Click any role to test the complete platform with pre-configured FinNova credentials:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleDemoLogin('CREATOR')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-indigo-900/40 border border-slate-700 hover:border-indigo-600/60 text-slate-200 transition text-left flex flex-col"
          >
            <span className="font-bold text-indigo-300">Creator</span>
            <span className="text-[10px] text-slate-400">Submit &amp; Revise Content</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('REVIEWER')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-blue-900/40 border border-slate-700 hover:border-blue-600/60 text-slate-200 transition text-left flex flex-col"
          >
            <span className="font-bold text-blue-300">Reviewer</span>
            <span className="text-[10px] text-slate-400">Verify AI Findings</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('MANAGER')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-purple-900/40 border border-slate-700 hover:border-purple-600/60 text-slate-200 transition text-left flex flex-col"
          >
            <span className="font-bold text-purple-300">Manager</span>
            <span className="text-[10px] text-slate-400">Approve / Reject</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('ADMIN')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-900/40 border border-slate-700 hover:border-emerald-600/60 text-slate-200 transition text-left flex flex-col"
          >
            <span className="font-bold text-emerald-300">Admin</span>
            <span className="text-[10px] text-slate-400">Brand Rules &amp; Sources</span>
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. creator@finnova.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-9 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-9 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
