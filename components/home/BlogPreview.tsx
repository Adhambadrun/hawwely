import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BlogCard } from '@/components/blog/BlogCard';
import type { BlogPost } from '@/lib/types';

export async function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const t = await getTranslations('home');
  if (posts.length === 0) return null;
  return (
    <section className="section bg-surface" aria-labelledby="blog-title">
      <div className="container-content">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="blog-title" className="section-title">
              {t('blogTitle')}
            </h2>
            <p className="section-subtitle">{t('blogSubtitle')}</p>
          </div>
          <Link href="/blog" className="btn-outline shrink-0">
            {t('blogAll')}
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
