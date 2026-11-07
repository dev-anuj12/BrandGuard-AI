import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { ToastProvider } from '../components/ui/Toast';
import CookieConsent from '../components/CookieConsent';

export const metadata: Metadata = {
  metadataBase: new URL('https://brandguard-ai-eight.vercel.app'),
  title: {
    default: 'BrandGuard AI — AI Brand Governance & Digital Protection Platform',
    template: '%s | BrandGuard AI',
  },
  description: 'Enterprise AI-powered brand governance, content compliance, fake domain detection, and digital asset protection platform.',
  keywords: [
    'brand governance',
    'content compliance',
    'brand protection',
    'phishing domain detection',
    'trademark monitoring',
    'AI content review',
    'brand compliance SaaS',
  ],
  authors: [{ name: 'BrandGuard AI Engineering Team' }],
  creator: 'BrandGuard AI',
  publisher: 'BrandGuard AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'BrandGuard AI — AI Brand Governance & Digital Protection Platform',
    description: 'Every content decision should be explainable, evidence-backed and human-controlled. Internal compliance review meets external threat defense.',
    url: 'https://brandguard-ai-eight.vercel.app',
    siteName: 'BrandGuard AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrandGuard AI — Enterprise Brand Governance & Protection',
    description: 'AI-assisted brand compliance review, regulatory claim validation, and digital brand perimeter defense.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-600 selection:text-white font-sans">
        {/* Skip to Main Content Link for Keyboard Accessibility (WCAG 2.2 AA) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <CookieConsent />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
