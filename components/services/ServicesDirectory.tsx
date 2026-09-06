'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import type { PayoutMethod, Service } from '@/lib/types';
import { ServiceListCard } from './ServiceListCard';

type Filter = 'all' | 'cheapest' | 'fastest' | PayoutMethod;

export function ServicesDirectory({ services, cheapestSlugs, fastestSlugs }: { services: Service[]; cheapestSlugs: string[]; fastestSlugs: string[] }) {
  const t = useTranslations('services');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return services.filter((s) => {
      if (term && !`${s.name} ${s.name_ar} ${s.slug}`.toLowerCase().includes(term)) return false;
      switch (filter) {
        case 'all':
          return true;
        case 'cheapest':
          return cheapestSlugs.includes(s.slug);
        case 'fastest':
          return fastestSlugs.includes(s.slug);
        default:
          return s.payout_methods.includes(filter);
      }
    });
  }, [services, q, filter, cheapestSlugs, fastestSlugs]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-sm">
          <span className="sr-only">{t('search')}</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-secondary" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} className="input ps-12" />
        </label>
        <Tabs<Filter>
          size="sm"
          value={filter}
          onChange={setFilter}
          ariaLabel={t('title')}
          options={[
            { value: 'all', label: t('all') },
            { value: 'cheapest', label: t('cheapest') },
            { value: 'fastest', label: t('fastest') },
            { value: 'cash_pickup', label: t('cash') },
            { value: 'bank_transfer', label: t('bank') },
            { value: 'instapay', label: t('instapay') },
            { value: 'mobile_wallet', label: t('wallet') },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t('noMatch')} description={t('noMatchHint')} className="mt-8" />
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {filtered.map((s, i) => (
            <li key={s.id}>
              <ServiceListCard service={s} index={i} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
