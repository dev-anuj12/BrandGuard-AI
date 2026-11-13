import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation | BrandGuard AI',
  description: 'BrandGuard AI developer and user documentation — API reference, RBAC guide, and platform walkthrough.',
  openGraph: {
    title: 'Documentation | BrandGuard AI',
    description: 'BrandGuard AI developer and user documentation.',
    url: 'https://brandguard-ai-eight.vercel.app/docs',
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
