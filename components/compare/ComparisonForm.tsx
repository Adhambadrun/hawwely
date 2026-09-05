'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Select } from '@/components/ui/Select';
import type { Corridor, PayoutMethod, SendCurrency } from '@/lib/types';
import { CURRENCY_META, MAX_AMOUNT, PAYOUT_METHODS, currencyToSlug } from '@/lib/utils/constants';
import { formatEgp, timeAgo } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';
import { useStore } from '@/store/useStore';

export interface ComparisonFormProps {
  corridors: Pick<Corridor, 'id' | 'send_currency' | 'send_country' | 'send_country_ar' | 'flag_emoji'>[];
  /** Lock the corridor (corridor pages) */
  fixedCurrency?: SendCurrency;
  /** Where to go on submit: 'navigate' -> /send-money/{slug}?amount=, 'inline' -> call onSubmit only */
  mode?: 'navigate' | 'inline';
  onSubmit?: (values: { currency: SendCurrency; amount: number; payout: PayoutMethod | null }) => void;
  loading?: boolean;
  showPayoutFilter?: boolean;
  lastUpdated?: string | null;
  midMarketRate?: number | null;
  className?: string;
  elevated?: boolean;
  initialAmount?: number;
}

export function ComparisonForm({
  corridors,
  fixedCurrency,
  mode = 'navigate',
  onSubmit,
  loading = false,
  showPayoutFilter = false,
  lastUpdated,
  midMarketRate,
  className,
  elevated = true,
  initialAmount,
}: ComparisonFormProps) {
  const t = useTranslations('form');
  const tp = useTranslations('payout');
  const locale = useLocale() as 'ar' | 'en';
  const router = useRouter();

  const storeCurrency = useStore((s) => s.currency);
  const storeAmount = useStore((s) => s.amount);
  const storePayout = useStore((s) => s.payout);
  const setCurrency = useStore((s) => s.setCurrency);
  const setAmount = useStore((s) => s.setAmount);
  const setPayout = useStore((s) => s.setPayout);
  const hasHydrated = useStore((s) => s.hasHydrated);

  const [currency, setLocalCurrency] = useState<SendCurrency>(fixedCurrency ?? storeCurrency);
  const [amount, setLocalAmount] = useState<number>(initialAmount ?? storeAmount);
  const [payout, setLocalPayout] = useState<PayoutMethod | null>(storePayout);
  const [error, setError] = useState<string | null>(null);

  // Adopt persisted values once the store has hydrated (avoids hydration mismatch)
  useEffect(() => {
    if (!hasHydrated) return;
    if (!fixedCurrency) setLocalCurrency(storeCurrency);
    if (initialAmount == null) setLocalAmount(storeAmount);
    setLocalPayout(storePayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  useEffect(() => {
    if (fixedCurrency) setLocalCurrency(fixedCurrency);
  }, [fixedCurrency]);

  const options = useMemo(
    () =>
      corridors.map((c) => ({
        value: c.send_currency,
        label: `${c.flag_emoji} ${locale === 'ar' ? c.send_country_ar : c.send_country} (${c.send_currency})`,
      })),
    [corridors, locale],
  );

  const meta = CURRENCY_META[currency];
  const quickAmounts = useMemo(() => {
    const base = meta.defaultAmount;
    return [base / 2, base, base * 2.5, base * 5].map((v) => Math.round(v));
  }, [meta.defaultAmount]);

  const validate = (): boolean => {
    if (!amount) {
      setError(t('amountRequired'));
      return false;
    }
    if (amount <= 0) {
      setError(t('amountMin'));
      return false;
    }
    if (amount > MAX_AMOUNT) {
      setError(t('amountMax'));
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setCurrency(currency);
    setAmount(amount);
    setPayout(payout);
    onSubmit?.({ currency, amount, payout });
    if (mode === 'navigate') {
      const params = new URLSearchParams({ amount: String(amount) });
      if (payout) params.set('payout', payout);
      router.push(`/send-money/${currencyToSlug(currency)}?${params.toString()}`);
    }
  };

  const estimate = midMarketRate && amount > 0 ? amount * midMarketRate : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn('rounded-2xl bg-white p-5 md:p-6', elevated && 'shadow-modal ring-1 ring-black/5', className)}
      aria-label={t('compare')}
    >
      <div className="space-y-4">
        {fixedCurrency ? (
          <div>
            <span className="label">{t('iAmIn')}</span>
            <div className="input flex items-center gap-2 bg-surface text-lg font-semibold">
              <span aria-hidden>{corridors.find((c) => c.send_currency === fixedCurrency)?.flag_emoji}</span>
              {options.find((o) => o.value === fixedCurrency)?.label.replace(/^\S+\s/, '')}
            </div>
          </div>
        ) : (
          <Select
            label={t('iAmIn')}
            size="lg"
            value={currency}
            onChange={(e) => {
              const next = e.target.value as SendCurrency;
              setLocalCurrency(next);
              // Reset to a sensible default amount when the currency scale changes (e.g. SAR -> KWD)
              if (CURRENCY_META[next].defaultAmount !== meta.defaultAmount && amount === meta.defaultAmount) {
                setLocalAmount(CURRENCY_META[next].defaultAmount);
              }
            }}
            options={options}
            aria-label={t('selectCountry')}
          />
        )}

        <CurrencyInput
          label={t('amount')}
          currency={currency}
          value={amount}
          onValueChange={(v) => {
            setLocalAmount(v);
            if (error) setError(null);
          }}
          error={error ?? undefined}
          placeholder={t('amountPlaceholder')}
          aria-label={t('amount')}
        />

        <div className="flex flex-wrap gap-2" aria-label={t('quickAmounts')}>
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setLocalAmount(q)}
              className={cn(
                'num rounded-pill border px-3 py-1 text-caption font-semibold transition',
                amount === q ? 'border-primary bg-primary-50 text-primary-700' : 'border-card-border text-content-secondary hover:border-primary hover:text-primary-700',
              )}
            >
              {q.toLocaleString('en-US')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-small text-content-secondary">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
            <ArrowDown className="h-4 w-4" aria-hidden />
          </span>
          <span>
            {t('sendTo')} <span className="font-bold text-navy">🇪🇬 {t('egypt')} (EGP)</span>
          </span>
          {estimate && (
            <span className="ms-auto text-end">
              <span className="block text-caption">{t('familyGets')}</span>
              <span className="num block font-bold text-navy">≈ {formatEgp(estimate, locale)}</span>
            </span>
          )}
        </div>

        {showPayoutFilter && (
          <Select
            label={t('payoutFilter')}
            value={payout ?? ''}
            onChange={(e) => setLocalPayout((e.target.value || null) as PayoutMethod | null)}
            options={[{ value: '', label: t('payoutAny') }, ...PAYOUT_METHODS.map((m) => ({ value: m, label: tp(m) }))]}
          />
        )}

        <Button type="submit" size="xl" fullWidth loading={loading} className="text-lg">
          <Search className="h-5 w-5" aria-hidden />
          {loading ? t('comparing') : t('compare')}
        </Button>

        {lastUpdated && (
          <p className="flex items-center justify-center gap-1.5 text-caption text-content-secondary">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t('lastUpdated', { time: timeAgo(lastUpdated, locale) })}
          </p>
        )}
      </div>
    </form>
  );
}
