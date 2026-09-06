import type { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/utils/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/reviews/write', '/en/reviews/write', '/_next/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
