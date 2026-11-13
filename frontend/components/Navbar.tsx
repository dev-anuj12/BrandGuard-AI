'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, User } from 'lucide-react';
import { getCurrentUser, clearAuthSession } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'CREATOR':
        return '/dashboard/creator';
      case 'REVIEWER':
        return '/dashboard/reviewer';
      case 'MANAGER':
        return '/dashboard/manager';
      case 'ADMIN':
        return '/dashboard/admin';
      default:
        return '/dashboard/creator';
    }
  };

  return (
    <nav className="border-b border-purple-900/35 bg-[#090414]/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#782BDB] via-[#9333EA] to-[#D946EF] flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  BrandGuard <span className="text-purple-300 font-extrabold text-xs px-1.5 py-0.5 rounded bg-[#1A0D30] border border-purple-500/30">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 font-medium">Compliance & Review Platform</span>
              </div>
            </Link>

            {/* Workspace pill when user is authenticated */}
            {mounted && user?.organization && (
              <div className="hidden md:flex items-center space-x-1.5 ml-4 px-2.5 py-1 rounded-full bg-[#150A26] border border-purple-800/40 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Workspace:</span>
                <span className="font-semibold text-slate-100">{user.organization}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 text-sm font-medium text-slate-300">
            {mounted && user && (
              <>
                <Link
                  href={getDashboardLink()}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname.startsWith('/dashboard')
                      ? 'bg-[#200D3B] text-white font-semibold border border-purple-500/40'
                      : 'hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/submit"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/submit'
                      ? 'bg-[#200D3B] text-white font-semibold border border-purple-500/40'
                      : 'hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  Submit Content
                </Link>

                <Link
                  href="/approvals"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/approvals'
                      ? 'bg-[#200D3B] text-white font-semibold border border-purple-500/40'
                      : 'hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  Workflow Pipeline
                </Link>

                <Link
                  href="/analytics"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/analytics'
                      ? 'bg-[#200D3B] text-white font-semibold border border-purple-500/40'
                      : 'hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  Analytics
                </Link>
              </>
            )}
          </div>

          {/* User & Auth State */}
          <div className="flex items-center space-x-3">
            {mounted && user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#150A26] border border-purple-800/40 hover:border-slate-700 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-900/80 text-indigo-300 flex items-center justify-center text-xs font-bold">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.full_name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-medium">
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition"
                >
                  Try Demo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

