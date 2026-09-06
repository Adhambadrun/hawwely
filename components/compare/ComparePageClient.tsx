'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { ComparisonForm } from '@/components/compare/ComparisonForm';
import { ComparisonResults } from '@/components/compare/ComparisonResults';
import { ResultsSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useComparison } from '@/lib/hooks/useComparison';
import type { ComparisonResponse, Corridor, PayoutMethod, SendCurrency } from '@/lib/types';
import { DEFAULT_AMOUNT, isSendCurrency, PAYOUT_METHODS } from '@/lib/utils/constants';
import { useStore } from '@/store/useStore';

export interface ComparePageClientProps {
  corridors: Corridor[];
  initial: ComparisonResponse | null;
  lastUpdated: string;
}

function readPayout(value: string | null): PayoutMethod | null {
  return value && (PAYOUT_METHODS as string[]).includes(value) ? (value as PayoutMethod) : null;
}

/**
 * /compare — inline comparison tool. State is mirrored into the URL so results
 * are shareable (?from=SAR&amount=2000&payout=instapay).
 */
export function ComparePageClient({ corridors, initial, lastUpdated }: ComparePageClientProps) {
  const t = useTranslations('results');
  const tc = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hasHydrated = useStore((s) => s.hasHydrated);
  const storeCurrency = useStore((s) => s.currency);
  const storeAmount = useStore((s) => s.amount);
  const storePayout = useStore((s) => s.payout);

  const urlFrom = params.get('from')?.toUpperCase();
  const urlAmount = Number(params.get('amount'));
  const query = useMemo(
    () => ({
      from: (isSendCurrency(urlFrom) ? urlFrom : initial?.query.from ?? 'SAR') as SendCurrency,
      amount: urlAmount > 0 ? urlAmount : initial?.query.amount ?? DEFAULT_AMOUNT,
      payout: readPayout(params.get('payout')),
    }),
    [urlFrom, urlAmount, params, initial],
  );

  const { data, loading, error, run } = useComparison(query, { auto: false, initialData: initial });
  const [submitted, setSubmitted] = useState(query);
  const resultsRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  // First load: if the URL has no explicit params, prefer the user's remembered corridor/amount.
  useEffect(() => {
    if (!hasHydrated) return;
    if (firstRun.current) {
      firstRun.current = false;
      const hasUrl = params.has('from') || params.has('amount');
      if (!hasUrl && (storeCurrency !== query.from || (storeAmount && storeAmount !== query.amount) || storePayout)) {
        const next = { from: storeCurrency, amount: storeAmount || query.amount, payout: storePayout };
        setSubmitted(next);
        void run(next);
        return;
      }
    }
    setSubmitted(query);
    void run(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, query.from, query.amount, query.payout]);

  const onSubmit = useCallback(
    (values: { currency: SendCurrency; amount: number; payout: PayoutMethod | null }) => {
      const sp = new URLSearchParams();
      sp.set('from', values.currency);
      sp.set('amount', String(values.amount));
      if (values.payout) sp.set('payout', values.payout);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [router, pathname],
  );

  const corridor = corridors.find((c) => c.send_currency === submitted.from);

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr] lg:items-start">
      <div className="lg:sticky lg:top-24">
        <ComparisonForm
          corridors={corridors}
          mode="inline"
          onSubmit={onSubmit}
          loading={loading}
          showPayoutFilter
          lastUpdated={data?.summary.last_updated ?? lastUpdated}
          midMarketRate={data?.mid_market_rate ?? initial?.mid_market_rate ?? null}
          initialAmount={submitted.amount}
          elevated={false}
        />
      </div>

      <div ref={resultsRef} className="scroll-mt-24 min-w-0">
        {loading && !data ? (
          <ResultsSkeleton count={5} />
        ) : error && !data ? (
          <EmptyState
            title={tc('error')}
            description={error}
            action={
              <Button onClick={() => void run(submitted, true)} variant="primary">
                {tc('retry')}
              </Button>
            }
          />
        ) : data ? (
          <div className={loading ? 'opacity-60 transition-opacity' : ''} aria-busy={loading}>
            <ComparisonResults data={data} showControls showSavings showStickyBar />
          </div>
        ) : (
          <EmptyState title={t('noResults')} description={corridor ? t('noResultsHint') : t('noResults')} />
        )}
      </div>
    </div>
  );
}
