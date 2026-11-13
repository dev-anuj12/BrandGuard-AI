import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Status | BrandGuard AI',
  description: 'Real-time operational status of BrandGuard AI services.',
  openGraph: {
    title: 'Platform Status | BrandGuard AI',
    description: 'Real-time operational status of BrandGuard AI services.',
    url: 'https://brandguard-ai-eight.vercel.app/status',
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
