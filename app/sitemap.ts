import type { MetadataRoute } from 'next';
import { getCorridors } from '@/lib/api/corridors';
import { getServices } from '@/lib/api/services';
import { getBlogPosts } from '@/lib/api/content';
import { localizedUrl } from '@/lib/seo';
import { currencyToSlug } from '@/lib/utils/constants';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

function entry(path: string, opts: { priority?: number; changeFrequency?: Entry['changeFrequency']; lastModified?: string | Date } = {}): Entry {
  return {
    url: localizedUrl('ar', path),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? 'daily',
    priority: opts.priority ?? 0.7,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [corridors, services, { posts }] = await Promise.all([getCorridors(), getServices(), getBlogPosts()]);

  const staticPages: Entry[] = [
    entry('/', { priority: 1, changeFrequency: 'hourly' }),
    entry('/compare', { priority: 0.9, changeFrequency: 'hourly' }),
    entry('/send-money', { priority: 0.9 }),
    entry('/rates', { priority: 0.9, changeFrequency: 'hourly' }),
    entry('/services', { priority: 0.8, changeFrequency: 'weekly' }),
    entry('/alerts', { priority: 0.6, changeFrequency: 'monthly' }),
    entry('/blog', { priority: 0.7, changeFrequency: 'weekly' }),
    entry('/reviews', { priority: 0.6, changeFrequency: 'weekly' }),
    entry('/report-rate', { priority: 0.4, changeFrequency: 'monthly' }),
    entry('/about', { priority: 0.5, changeFrequency: 'monthly' }),
    entry('/faq', { priority: 0.6, changeFrequency: 'monthly' }),
    entry('/contact', { priority: 0.4, changeFrequency: 'yearly' }),
    entry('/privacy', { priority: 0.2, changeFrequency: 'yearly' }),
    entry('/terms', { priority: 0.2, changeFrequency: 'yearly' }),
  ];

  const corridorPages = corridors.flatMap((c) => {
    const slug = currencyToSlug(c.send_currency);
    return [entry(`/send-money/${slug}`, { priority: 0.9, changeFrequency: 'hourly' }), entry(`/rates/${slug}`, { priority: 0.8, changeFrequency: 'hourly' })];
  });

  const servicePages = services.map((s) => entry(`/services/${s.slug}`, { priority: 0.7, changeFrequency: 'weekly' }));

  const corridorServicePages = corridors.flatMap((c) =>
    services
      .filter((s) => s.supported_corridors.includes(`${c.send_currency}-EGP` as never))
      .map((s) => entry(`/send-money/${currencyToSlug(c.send_currency)}/${s.slug}`, { priority: 0.6 })),
  );

  const blogPages = posts.map((p) => entry(`/blog/${p.slug}`, { priority: 0.6, changeFrequency: 'monthly', lastModified: p.published_at ?? undefined }));

  return [...staticPages, ...corridorPages, ...servicePages, ...corridorServicePages, ...blogPages];
}
