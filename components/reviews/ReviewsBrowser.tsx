'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import type { Corridor, Review, Service } from '@/lib/types';
import { ReviewList } from './ReviewList';

export function ReviewsBrowser({ reviews, services, corridors }: { reviews: Review[]; services: Service[]; corridors: Corridor[] }) {
  const t = useTranslations('reviews');
  const locale = useLocale() as 'ar' | 'en';
  const [service, setService] = useState('');
  const [corridor, setCorridor] = useState('');
  const [minRating, setMinRating] = useState('');

  const filtered = useMemo(
    () =>
      reviews.filter((r) => (!service || r.service_id === service) && (!corridor || r.corridor_id === corridor) && (!minRating || r.rating >= Number(minRating))),
    [reviews, service, corridor, minRating],
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select id="f-service" label={t('filterService')} value={service} onChange={(e) => setService(e.target.value)} options={[{ value: '', label: t('allServices') }, ...services.map((s) => ({ value: s.id, label: locale === 'ar' ? s.name_ar : s.name }))]} />
        <Select id="f-corridor" label={t('filterCorridor')} value={corridor} onChange={(e) => setCorridor(e.target.value)} options={[{ value: '', label: t('allCorridors') }, ...corridors.map((c) => ({ value: c.id, label: `${c.flag_emoji} ${locale === 'ar' ? c.send_country_ar : c.send_country}` }))]} />
        <Select id="f-rating" label={t('filterRating')} value={minRating} onChange={(e) => setMinRating(e.target.value)} options={[{ value: '', label: t('allRatings') }, ...[4, 3, 2].map((n) => ({ value: String(n), label: t('starsAndUp', { stars: n }) }))]} />
      </div>
      <p className="mt-4 text-caption text-content-secondary" aria-live="polite">
        {t('totalReviews', { count: filtered.length })}
      </p>
      <ReviewList reviews={filtered} className="mt-4" />
    </div>
  );
}
