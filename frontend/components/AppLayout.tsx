'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, LayoutDashboard, FileEdit, CheckSquare, 
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, 
  Sun, Moon, Bell, Search, User, Menu, X, HelpCircle, 
  BookOpen, Sliders, Layers, ChevronDown, ShieldAlert, Globe, Activity, Share2, ShoppingBag
} from 'lucide-react';
import { getCurrentUser, clearAuthSession } from '../lib/api';
import { useTheme } from './ThemeProvider';
import BrandLogo, { BrandLogoIcon } from './BrandLogo';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppLayout({ children, pageTitle, breadcrumbs }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cur = getCurrentUser();
    if (!cur) {
      router.push('/login');
      return;
    }
    setUser(cur);
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  // Build role-specific navigation
  const getNavItems = () => {
    if (!user) return [];
    const role = user.role;

    const items = [
      {
        label: 'Unified Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
      {
        label: `${role.charAt(0) + role.slice(1).toLowerCase()} Workspace`,
        href: `/dashboard/${role.toLowerCase()}`,
        icon: User,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Domain Protection',
        href: '/protection/domains',
        icon: Globe,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Social Protection',
        href: '/protection/social',
        icon: Share2,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Counterfeit & Assets',
        href: '/protection/counterfeit',
        icon: ShoppingBag,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Threat Intelligence',
        href: '/threats',
        icon: ShieldAlert,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Create Submission',
        href: '/submit',
        icon: FileEdit,
        roles: ['CREATOR', 'ADMIN'],
      },
      {
        label: 'Workflow Pipeline',
        href: '/approvals',
        icon: CheckSquare,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
      {
        label: 'Analytics & Telemetry',
        href: '/analytics',
        icon: BarChart3,
        roles: ['MANAGER', 'ADMIN', 'REVIEWER'],
      },
      {
        label: 'Brand Knowledge Base',
        href: '/dashboard/admin',
        icon: BookOpen,
        roles: ['ADMIN'],
      },
      {
        label: 'Settings & Identity',
        href: '/settings',
        icon: Settings,
        roles: ['CREATOR', 'REVIEWER', 'MANAGER', 'ADMIN'],
      },
    ];

    return items.filter((item) => item.roles.includes(role));
  };

  const navItems = getNavItems();

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 bg-white dark:bg-[#0E131F] border-r border-slate-200 dark:border-slate-800/80 transition-all duration-200 flex flex-col justify-between shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'left-0' : '-left-full md:left-0'}`}
      >
        {/* Top Brand Bar */}
        <div>
          <div className="h-16 px-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            {collapsed ? (
              <div className="flex justify-center w-full">
                <BrandLogoIcon size="sm" />
              </div>
            ) : (
              <BrandLogo size="sm" showSubtitle={true} href="/" />
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close mobile navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Workspace Info Pill */}
          {!collapsed && (
            <div className="p-3 mx-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  Workspace
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                FinNova Technologies
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-subtle'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Theme Toggle Button in Sidebar */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition ${
              collapsed ? 'justify-center px-2' : ''
            }`}
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
            )}
            {!collapsed && (
              <span>{resolvedTheme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            )}
          </button>

          {/* User Profile Summary */}
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
              collapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.full_name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                title="Sign out"
                aria-label="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 sticky top-0 z-30 bg-white/90 dark:bg-[#0B0F19]/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs & Title */}
            <div>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {breadcrumbs.map((b, i) => (
                    <React.Fragment key={i}>
                      {b.href ? (
                        <Link href={b.href} className="hover:text-slate-700 dark:hover:text-slate-300">
                          {b.label}
                        </Link>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400">{b.label}</span>
                      )}
                      {i < breadcrumbs.length - 1 && <span>/</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
              {pageTitle && (
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none mt-0.5">
                  {pageTitle}
                </h1>
              )}
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button in Header */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Role indicator pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Role:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.role}</span>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                aria-label="User profile options"
                aria-expanded={profileOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-dropdown p-2 z-40 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Settings</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

