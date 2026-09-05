'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { cn } from '@/lib/utils/helpers';

/** "Save X EGP!" highlight with a one-time confetti burst when savings are meaningful. */
export function SavingsBadge({ amount, bestName, worstName, className, confetti = true }: { amount: number; bestName: string; worstName: string; className?: string; confetti?: boolean }) {
  const t = useTranslations('results');
  const locale = useLocale();
  const fired = useRef(false);

  useEffect(() => {
    if (!confetti || fired.current || amount < 100) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    fired.current = true;
    let cancelled = false;
    import('canvas-confetti')
      .then(({ default: fire }) => {
        if (cancelled) return;
        fire({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00C853', '#00E676', '#FFD700', '#1B2A4A'],
          disableForReducedMotion: true,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [amount, confetti]);

  if (amount <= 0) return null;

  return (
    <div className={cn('relative overflow-hidden rounded-card border border-primary/30 bg-gradient-to-l from-primary-50 to-white p-5 shadow-card', className)} role="status">
      <Sparkles className="absolute -end-3 -top-3 h-20 w-20 text-primary/10" aria-hidden />
      <p className="text-small font-semibold text-primary-700">{t('diffBetween')}</p>
      <p className="mt-1 text-3xl font-extrabold text-navy md:text-4xl">
        <AnimatedCounter value={amount} immediate suffix={locale === 'ar' ? ' جنيه' : ' EGP'} />
      </p>
      <p className="mt-2 text-small text-content-secondary">{t('saveHint', { amount: '', best: bestName, worst: worstName }).replace(/\s{2,}/g, ' ')}</p>
    </div>
  );
}
