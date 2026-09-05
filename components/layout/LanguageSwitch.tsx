'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils/helpers';

export function LanguageSwitch({ className, variant = 'pill' }: { className?: string; variant?: 'pill' | 'text' }) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const target = locale === 'ar' ? 'en' : 'ar';
  const label = locale === 'ar' ? t('switchToEnglish') : t('switchToArabic');

  const switchLocale = () => {
    // @ts-expect-error -- pathname & params come from the current route and are compatible
    router.replace({ pathname, params }, { locale: target });
  };

  if (variant === 'text') {
    return (
      <button type="button" onClick={switchLocale} className={cn('inline-flex items-center gap-1.5 text-small font-semibold hover:underline', className)} aria-label={`${t('language')}: ${label}`}>
        <Languages className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className={cn('inline-flex h-9 items-center gap-1.5 rounded-pill border border-card-border bg-white px-3 text-small font-semibold text-navy transition hover:border-primary hover:text-primary-700', className)}
      aria-label={`${t('language')}: ${label}`}
      lang={target}
    >
      <Languages className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
