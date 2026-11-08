import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // /p/ are the public post previews people share
      allow: ['/$', '/terms', '/privacy', '/p/'],
      disallow: '/',
    },
    sitemap: `${process.env.FRONTEND_URL || ''}/sitemap.xml`,
  };
}
