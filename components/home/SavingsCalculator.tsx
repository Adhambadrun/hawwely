'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, TrendingDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import type { SendCurrency } from '@/lib/types';
import { currencyToSlug } from '@/lib/utils/constants';
import { formatNumber } from '@/lib/utils/formatters';

export interface SavingsCurvePoint {
  amount: number;
  best: number;
  worst: number;
  bestName: string;
  bestNameAr: string;
  worstName: string;
  worstNameAr: string;
}

export interface SavingsCalculatorProps {
  currency: SendCurrency;
  curve: SavingsCurvePoint[];
  min?: number;
  max?: number;
  step?: number;
  initial?: number;
}

/** Linear interpolation of best/worst received between the server-computed curve points. */
function interpolate(curve: SavingsCurvePoint[], amount: number) {
  if (curve.length === 0) return null;
  if (amount <= curve[0].amount) return scale(curve[0], amount);
  const last = curve[curve.length - 1];
  if (amount >= last.amount) return scale(last, amount);
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i];
    const b = curve[i + 1];
    if (amount >= a.amount && amount <= b.amount) {
      const t = (amount - a.amount) / (b.amount - a.amount);
      return { best: a.best + (b.best - a.best) * t, worst: a.worst + (b.worst - a.worst) * t, ref: t < 0.5 ? a : b };
    }
  }
  return scale(last, amount);
}

function scale(p: SavingsCurvePoint, amount: number) {
  const k = p.amount ? amount / p.amount : 0;
  return { best: p.best * k, worst: p.worst * k, ref: p };
}

export function SavingsCalculator({ currency, curve, min = 500, max = 20000, step = 100, initial = 3000 }: SavingsCalculatorProps) {
  const t = useTranslations('home');
  const locale = useLocale() as 'ar' | 'en';
  const [amount, setAmount] = useState(initial);
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const calc = useMemo(() => interpolate(curve, amount), [curve, amount]);
  const monthlyLoss = calc ? Math.max(0, calc.worst - calc.best) : 0;
  const yearlyLoss = monthlyLoss * 12;
  const bestName = calc ? (locale === 'ar' ? calc.ref.bestNameAr : calc.ref.bestName) : '';
  const worstName = calc ? (locale === 'ar' ? calc.ref.worstNameAr : calc.ref.worstName) : '';
  const pct = ((amount - min) / (max - min)) * 100;

  return (
    <section className="section bg-navy-gradient text-white" aria-labelledby="calc-title">
      <div className="container-content">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="calc-title" className="text-h2-m font-extrabold md:text-h2">
            {t('calcTitle')}
          </h2>
          <p className="mt-3 text-body text-white/75">{t('calcSubtitle')}</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
          <label htmlFor="calc-amount" className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-body font-semibold">{t('calcMonthly')}</span>
            <span className="num text-3xl font-extrabold text-gold" dir="ltr">
              {formatNumber(amount, locale)} <span className="text-lg text-white/80">{currency}</span>
            </span>
          </label>
          <input
            id="calc-amount"
            type="range"
            min={min}
            max={max}
            step={step}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="range-slider mt-5 w-full"
            style={{ '--range-progress': `${pct}%` } as React.CSSProperties}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={amount}
            aria-valuetext={`${amount} ${currency}`}
            dir="ltr"
          />
          <div className="num mt-2 flex justify-between text-caption text-white/60" dir="ltr">
            <span>{formatNumber(min, locale)}</span>
            <span>{formatNumber(max, locale)}</span>
          </div>

          {calc && (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-card bg-white/10 p-5">
                <p className="text-caption text-white/70">{t('calcVia', { service: bestName })}</p>
                <p className="num mt-1 text-2xl font-extrabold text-primary-light" dir="ltr">
                  {formatNumber(Math.round(calc.best), locale)} <span className="text-base font-semibold">EGP</span>
                </p>
              </div>
              <div className="rounded-card bg-white/10 p-5">
                <p className="text-caption text-white/70">{t('calcVia', { service: worstName })}</p>
                <p className="num mt-1 text-2xl font-extrabold text-red-300" dir="ltr">
                  {formatNumber(Math.round(calc.worst), locale)} <span className="text-base font-semibold">EGP</span>
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-card border border-red-400/40 bg-red-500/15 p-5 text-center">
            <p className="text-small text-white/80">{t('calcIf', { amount: formatNumber(amount, locale), currency })}</p>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-lg font-bold">
              <TrendingDown className="h-6 w-6 text-red-300" aria-hidden />
              <span>{t('calcLoseLabel')}</span>
              <span className="num text-2xl text-red-200" dir="ltr">
                <AnimatedCounter value={Math.round(monthlyLoss)} durationMs={500} immediate />
              </span>
              <span className="text-white/80">{t('calcPerMonth')}</span>
              <span className="text-white/60">=</span>
              <span className="num text-2xl text-gold" dir="ltr">
                <AnimatedCounter value={Math.round(yearlyLoss)} durationMs={500} immediate />
              </span>
              <span className="text-white/80">{t('calcPerYear')}</span>
            </p>
            <p className="sr-only">{t('calcLose', { monthly: Math.round(monthlyLoss), yearly: Math.round(yearlyLoss) })}</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link href={`/send-money/${currencyToSlug(currency)}?amount=${amount}`} className="btn-primary btn-lg w-full sm:w-auto">
              {t('calcCta')}
              <Arrow className="h-5 w-5" />
            </Link>
            <p className="text-caption text-white/60">{t('calcNote')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
