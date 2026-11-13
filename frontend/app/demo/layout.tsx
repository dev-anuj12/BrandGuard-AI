import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Demo | BrandGuard AI',
  description: 'Schedule a personalised walkthrough of BrandGuard AI compliance automation.',
  openGraph: {
    title: 'Request a Demo | BrandGuard AI',
    description: 'Schedule a personalised walkthrough of BrandGuard AI compliance automation.',
    url: 'https://brandguard-ai-eight.vercel.app/demo',
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
