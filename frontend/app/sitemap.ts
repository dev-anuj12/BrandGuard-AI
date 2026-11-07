import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://brandguard-ai-eight.vercel.app';
  const currentDate = new Date().toISOString();

  const publicRoutes: Array<{ path: string; priority: number; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/features', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/demo', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/docs', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/api-docs', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/integrations', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/whats-new', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/changelog', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/roadmap', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/team', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/careers', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/partners', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/press', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/testimonials', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/status', priority: 0.7, changeFrequency: 'daily' },
    { path: '/security', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/help', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/support', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tickets', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/community', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/feedback', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/report-bug', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/login', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/register', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/cookie-preferences', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/disclaimer', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/acceptable-use', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/dpa', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/refund-policy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/security-policy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/copyright', priority: 0.4, changeFrequency: 'yearly' },
  ];

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
