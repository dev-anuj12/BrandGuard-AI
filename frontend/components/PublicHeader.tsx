'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Moon, Sun, Menu, X, ChevronRight 
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getCurrentUser } from '../lib/api';
import BrandLogo from './BrandLogo';

export default function PublicHeader() {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/docs', label: 'Documentation' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#060913]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo size="md" showSubtitle={true} href="/" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors py-1 px-2.5 rounded-lg ${
                  isActive
                    ? 'text-indigo-600 dark:text-white bg-indigo-50/80 dark:bg-indigo-950/40 font-bold border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs'
                    : 'hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent dark:hover:border-slate-700/60 transition"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {user ? (
            <Link
              href={`/dashboard/${user.role?.toLowerCase() || 'creator'}`}
              className="inline-flex px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/25 border border-indigo-400/30 transition items-center gap-1.5"
            >
              <span>Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-block px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/25 border border-indigo-400/30 transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-indigo-600 dark:text-indigo-400 font-bold"
            >
              Enterprise Pricing
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

