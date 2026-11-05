'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Sun, Moon, Building } from 'lucide-react';
import { api, setAuthSession } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../components/ThemeProvider';
import { useToast } from '../../components/ui/Toast';
import BrandLogo from '../../components/BrandLogo';

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { error: toastError, success: toastSuccess } = useToast();

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
      toastSuccess(`Signed in as ${data.user.full_name} (${data.user.role})`);

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
      const msg = err.message || 'Login failed. Please verify credentials.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleRolePreset = (role: 'CREATOR' | 'REVIEWER' | 'MANAGER' | 'ADMIN') => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} href="/" />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          title="Toggle theme"
          type="button"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign In to BrandGuard AI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your enterprise compliance workspace
          </p>
        </div>

        {/* Enterprise Demonstration Presets */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>FinNova Demonstration Profiles</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1-Click Sign In</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleRolePreset('CREATOR')}
              disabled={loading}
              className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-indigo-50/60 dark:bg-slate-950 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition group"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block">
                Creator
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Drafts &amp; Revisions</span>
            </button>

            <button
              type="button"
              onClick={() => handleRolePreset('REVIEWER')}
              disabled={loading}
              className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-blue-50/60 dark:bg-slate-950 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition group"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                Reviewer
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Audits &amp; Citations</span>
            </button>

            <button
              type="button"
              onClick={() => handleRolePreset('MANAGER')}
              disabled={loading}
              className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-purple-50/60 dark:bg-slate-950 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 transition group"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 block">
                Manager
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Executive Sign-Off</span>
            </button>

            <button
              type="button"
              onClick={() => handleRolePreset('ADMIN')}
              disabled={loading}
              className="p-2.5 rounded-xl text-left bg-slate-50 hover:bg-emerald-50/60 dark:bg-slate-950 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition group"
            >
              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block">
                Admin
              </span>
              <span className="text-[10px] text-slate-500 block truncate">Policies &amp; Users</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full"
            size="md"
          >
            Sign In
          </Button>

          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
            Need an enterprise account?{' '}
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-4">
        BrandGuard AI &copy; {new Date().getFullYear()} Enterprise Content Governance
      </footer>
    </div>
  );
}
