'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Faq } from '@/lib/types';
import { FAQ_CATEGORIES } from '@/lib/utils/constants';
import { FaqAccordion } from './FaqAccordion';

type Cat = 'all' | (typeof FAQ_CATEGORIES)[number];

export function FaqBrowser({ faqs }: { faqs: Faq[] }) {
  const t = useTranslations('faq');
  const tc = useTranslations('common');
  const locale = useLocale() as 'ar' | 'en';
  const [cat, setCat] = useState<Cat>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return faqs.filter((f) => (cat === 'all' || f.category === cat) && (!term || `${f.question} ${f.question_ar} ${f.answer} ${f.answer_ar}`.toLowerCase().includes(term)));
  }, [faqs, cat, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs<Cat> size="sm" value={cat} onChange={setCat} ariaLabel={t('title')} options={['all', ...FAQ_CATEGORIES].map((c) => ({ value: c as Cat, label: t(`categories.${c}` as never) }))} />
        <label className="relative block w-full md:max-w-xs">
          <span className="sr-only">{tc('search')}</span>
          <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-secondary" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tc('search')} className="input ps-12" />
        </label>
      </div>
      <div className="mt-8" aria-live="polite">
        {filtered.length === 0 ? <EmptyState title={tc('noResults')} description={locale === 'ar' ? 'جرب كلمة تانية أو اسألنا مباشرة.' : 'Try another keyword or ask us directly.'} /> : <FaqAccordion faqs={filtered} defaultOpenFirst />}
      </div>
    </div>
  );
}
