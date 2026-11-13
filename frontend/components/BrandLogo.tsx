'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogoIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 60,
  };

  const dim = pixelSizes[size] || 36;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: dim, height: dim }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Main Shield & Node Gradient */}
          <linearGradient id="bg-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#782BDB" />   {/* Rich Violet */}
            <stop offset="50%" stopColor="#A855F7" />  {/* Electric Purple */}
            <stop offset="100%" stopColor="#D946EF" /> {/* Accent Magenta */}
          </linearGradient>

          {/* Core AI Diamond Glow */}
          <linearGradient id="bg-core-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Outer Protective Shadow */}
          <filter id="bg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#A855F7" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Geometric Perimeter Container */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="10"
          fill="url(#bg-brand-grad)"
          filter="url(#bg-glow)"
        />

        {/* Inner Security Facet (Polygonal Shield Matrix) */}
        <path
          d="M20 7L31 11.5V20C31 26.5 26.3 32.2 20 34C13.7 32.2 9 26.5 9 20V11.5L20 7Z"
          fill="#090414"
          fillOpacity="0.35"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Central Geometric AI Neural Core (Grounded Decision Diamond) */}
        <path
          d="M20 12L27 20L20 28L13 20L20 12Z"
          fill="url(#bg-core-grad)"
          fillOpacity="0.95"
        />

        {/* Precision Node Axis Points */}
        <circle cx="20" cy="20" r="2.2" fill="#782BDB" />
        <line x1="20" y1="12" x2="20" y2="28" stroke="#782BDB" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <line x1="13" y1="20" x2="27" y2="20" stroke="#782BDB" strokeWidth="1" strokeDasharray="1.5 1.5" />
      </svg>
    </div>
  );
}

export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  showSubtitle = false,
  href = '/',
  className = '',
}: BrandLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className} group`}>
      <BrandLogoIcon size={size} />

      {showWordmark && (
        <div className="flex flex-col select-none">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
              BrandGuard
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-gradient-to-r from-[#782BDB] via-[#A855F7] to-[#D946EF] text-white tracking-wide shadow-xs shadow-purple-900/40">
              AI
            </span>
          </div>

          {showSubtitle && (
            <span className="text-[10px] font-medium text-slate-500 dark:text-purple-300/70 -mt-0.5 tracking-tight truncate">
              Content Governance
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

