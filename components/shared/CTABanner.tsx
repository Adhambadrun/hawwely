import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/helpers';

export async function CTABanner({ title, text, buttonLabel, href = '/compare', className }: { title?: string; text?: string; buttonLabel?: string; href?: string; className?: string }) {
  const t = await getTranslations('blog');
  const locale = await getLocale();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  return (
    <section className={cn('relative overflow-hidden rounded-card bg-navy-gradient p-8 text-white md:p-12', className)}>
      <div className="hero-dots absolute inset-0 opacity-60" aria-hidden />
      <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">{title ?? t('ctaTitle')}</h2>
          <p className="mt-2 max-w-xl text-white/80">{text ?? t('ctaText')}</p>
        </div>
        <Link href={href} className="btn-primary shrink-0 px-6 py-3 text-body">
          {buttonLabel ?? t('ctaButton')}
          <Arrow className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
