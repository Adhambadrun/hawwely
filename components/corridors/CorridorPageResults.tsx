'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { PAYOUT_METHODS } from '@/lib/utils/constants';

export interface CorridorPageResultsProps {
  corridor: Corridor;
  corridors: Corridor[];
  initial: ComparisonResponse | null;
  lastUpdated: string;
}

/** Corridor landing page: fixed currency, amount editable, results inline. */
export function CorridorPageResults({ corridor, corridors, initial, lastUpdated }: CorridorPageResultsProps) {
  const t = useTranslations('results');
  const tc = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlAmount = Number(params.get('amount'));
  const urlPayout = params.get('payout');
  const payout = urlPayout && (PAYOUT_METHODS as string[]).includes(urlPayout) ? (urlPayout as PayoutMethod) : null;
  const amount = urlAmount > 0 ? urlAmount : initial?.query.amount ?? 2000;

  const query = { from: corridor.send_currency as SendCurrency, amount, payout };
  const { data, loading, error, run } = useComparison(query, { auto: false, initialData: initial });
  const [current, setCurrent] = useState(query);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(query);
    void run(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [corridor.send_currency, amount, payout]);

  const onSubmit = useCallback(
    (values: { currency: SendCurrency; amount: number; payout: PayoutMethod | null }) => {
      const sp = new URLSearchParams();
      sp.set('amount', String(values.amount));
      if (values.payout) sp.set('payout', values.payout);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [router, pathname],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
      <div className="lg:sticky lg:top-24">
        <ComparisonForm
          corridors={corridors}
          fixedCurrency={corridor.send_currency}
          mode="inline"
          onSubmit={onSubmit}
          loading={loading}
          showPayoutFilter
          lastUpdated={data?.summary.last_updated ?? lastUpdated}
          midMarketRate={data?.mid_market_rate ?? initial?.mid_market_rate ?? null}
          initialAmount={current.amount}
          elevated={false}
        />
      </div>
      <div ref={resultsRef} className="min-w-0 scroll-mt-24">
        {loading && !data ? (
          <ResultsSkeleton count={5} />
        ) : error && !data ? (
          <EmptyState
            title={tc('error')}
            description={error}
            action={
              <Button variant="primary" onClick={() => void run(current, true)}>
                {tc('retry')}
              </Button>
            }
          />
        ) : data ? (
          <div className={loading ? 'opacity-60 transition-opacity' : ''} aria-busy={loading}>
            <ComparisonResults data={data} showControls showSavings showStickyBar />
          </div>
        ) : (
          <EmptyState title={t('noResults')} description={t('noResultsHint')} />
        )}
      </div>
    </div>
  );
}
