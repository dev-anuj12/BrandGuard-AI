import React from 'react';
import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'BrandGuard AI — Intelligent Brand Compliance Platform',
  description: 'AI-Powered Brand Compliance, Citation Validation & Human Approval Workflow for CodeNexus India 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-400">BrandGuard AI &copy; 2026</p>
              <p className="text-[11px] text-slate-600">Built for CodeNexus India 2026 – National Hackathon</p>
            </div>
            <div className="flex items-center space-x-6 text-slate-400">
              <span>Anuj Vishwakarma (Full-Stack & AI)</span>
              <span>•</span>
              <span>Nakshatra Titarmare (Frontend)</span>
              <span>•</span>
              <span>Lakshita Bisen (QA & DB)</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
