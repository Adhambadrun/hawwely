import 'server-only';
import type { BlogPost, Faq, Review, Testimonial } from '@/lib/types';
import { BLOG_POSTS } from '@/lib/data/blog';
import { FAQS } from '@/lib/data/faqs';
import { REVIEWS, TESTIMONIALS } from '@/lib/data/reviews';
import { createPublicClient } from '@/lib/supabase/public';
import { cached, TTL } from '@/lib/exchange/cache';
import { getServices } from './services';
import { getCorridors } from './corridors';

/* ---------------- Blog ---------------- */

export async function getBlogPosts(opts: { category?: string; q?: string; limit?: number; offset?: number } = {}): Promise<{ posts: BlogPost[]; total: number }> {
  const all = await cached('blog:all', TTL.catalog, async () => {
    const supabase = createPublicClient();
    if (!supabase) return BLOG_POSTS.filter((p) => p.is_published);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    if (error || !data || data.length === 0) return BLOG_POSTS.filter((p) => p.is_published);
    return data as BlogPost[];
  });

  let posts = [...all].sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''));
  if (opts.category) posts = posts.filter((p) => p.category === opts.category);
  if (opts.q) {
    const q = opts.q.toLowerCase();
    posts = posts.filter((p) =>
      [p.title, p.title_ar, p.excerpt, p.excerpt_ar, ...(p.tags ?? [])].some((t) => t?.toLowerCase().includes(q)),
    );
  }
  const total = posts.length;
  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? total;
  return { posts: posts.slice(offset, offset + limit), total };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { posts } = await getBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const { posts } = await getBlogPosts();
  return posts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export async function getPostsForCorridor(currency: string, limit = 3): Promise<BlogPost[]> {
  const { posts } = await getBlogPosts();
  const tagged = posts.filter((p) => p.tags.some((t) => t.toUpperCase() === currency.toUpperCase()));
  const rest = posts.filter((p) => !tagged.includes(p));
  return [...tagged, ...rest].slice(0, limit);
}

/* ---------------- FAQ ---------------- */

export async function getFaqs(opts: { category?: string; corridorId?: string | null; serviceId?: string | null } = {}): Promise<Faq[]> {
  const all = await cached('faqs:all', TTL.catalog, async () => {
    const supabase = createPublicClient();
    if (!supabase) return FAQS.filter((f) => f.is_active);
    const { data, error } = await supabase.from('faqs').select('*').eq('is_active', true).order('sort_order');
    if (error || !data || data.length === 0) return FAQS.filter((f) => f.is_active);
    return data as Faq[];
  });

  let faqs = [...all].sort((a, b) => a.sort_order - b.sort_order);
  if (opts.category) faqs = faqs.filter((f) => f.category === opts.category);
  if (opts.corridorId !== undefined) {
    // corridor pages: general FAQs + this corridor's FAQs
    faqs = faqs.filter((f) => f.corridor_id == null || f.corridor_id === opts.corridorId);
  }
  if (opts.serviceId !== undefined) {
    faqs = faqs.filter((f) => f.service_id == null || f.service_id === opts.serviceId);
  }
  return faqs;
}

/* ---------------- Reviews ---------------- */

export async function getReviews(opts: { serviceId?: string; corridorId?: string; minRating?: number; limit?: number } = {}): Promise<Review[]> {
  const [all, services, corridors] = await Promise.all([
    cached('reviews:all', TTL.comparison, async () => {
      const supabase = createPublicClient();
      if (!supabase) return REVIEWS.filter((r) => r.is_approved);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error || !data || data.length === 0) return REVIEWS.filter((r) => r.is_approved);
      return data as Review[];
    }),
    getServices(),
    getCorridors(),
  ]);

  const sById = new Map(services.map((s) => [s.id, s]));
  const cById = new Map(corridors.map((c) => [c.id, c]));

  let reviews = all
    .map((r) => {
      const s = sById.get(r.service_id);
      const c = r.corridor_id ? cById.get(r.corridor_id) : undefined;
      return {
        ...r,
        rating: Number(r.rating),
        service: s ? { name: s.name, name_ar: s.name_ar, slug: s.slug, logo_url: s.logo_url } : undefined,
        corridor: c ? { send_currency: c.send_currency, flag_emoji: c.flag_emoji } : undefined,
      } as Review;
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  if (opts.serviceId) reviews = reviews.filter((r) => r.service_id === opts.serviceId);
  if (opts.corridorId) reviews = reviews.filter((r) => r.corridor_id === opts.corridorId);
  if (opts.minRating) reviews = reviews.filter((r) => r.rating >= (opts.minRating as number));
  if (opts.limit) reviews = reviews.slice(0, opts.limit);
  return reviews;
}

export interface ReviewStatsData {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  recommendPercent: number;
}

export function computeReviewStats(reviews: Review[]): ReviewStatsData {
  const distribution: ReviewStatsData['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let recommend = 0;
  let recommendAnswered = 0;
  for (const r of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[rating]++;
    sum += r.rating;
    if (r.would_recommend != null) {
      recommendAnswered++;
      if (r.would_recommend) recommend++;
    }
  }
  return {
    average: reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0,
    total: reviews.length,
    distribution,
    recommendPercent: recommendAnswered ? Math.round((recommend / recommendAnswered) * 100) : 0,
  };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS;
}
