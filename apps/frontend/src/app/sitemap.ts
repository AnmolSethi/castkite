import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.FRONTEND_URL || '';
  return ['/', '/terms', '/privacy'].map((path) => ({
    url: `${base}${path}`,
  }));
}
