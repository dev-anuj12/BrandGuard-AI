import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | BrandGuard AI',
  description: 'Answers to common questions about BrandGuard AI — compliance rules, AI engine, roles, and integrations.',
  openGraph: {
    title: 'FAQ | BrandGuard AI',
    description: 'Answers to common questions about BrandGuard AI.',
    url: 'https://brandguard-ai-eight.vercel.app/faq',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
