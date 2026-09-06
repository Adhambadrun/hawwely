'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { BLOG_CATEGORIES } from '@/lib/utils/constants';

type Cat = 'all' | (typeof BLOG_CATEGORIES)[number];

/** Category tabs + debounced search; state lives in the URL (server does the filtering). */
export function BlogFilters({ category, q }: { category: string; q: string }) {
  const t = useTranslations('blog');
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState(q);
  const debounced = useDebounce(term, 350);

  useEffect(() => {
    if (debounced === q) return;
    const sp = new URLSearchParams();
    if (category && category !== 'all') sp.set('category', category);
    if (debounced) sp.set('q', debounced);
    router.replace(`${pathname}${sp.size ? `?${sp}` : ''}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const setCategory = (c: Cat) => {
    const sp = new URLSearchParams();
    if (c !== 'all') sp.set('category', c);
    if (term) sp.set('q', term);
    router.replace(`${pathname}${sp.size ? `?${sp}` : ''}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Tabs<Cat> size="sm" value={(category as Cat) || 'all'} onChange={setCategory} ariaLabel={t('title')} options={['all', ...BLOG_CATEGORIES].map((c) => ({ value: c as Cat, label: t(`categories.${c}` as never) }))} />
      <label className="relative block w-full md:max-w-xs">
        <span className="sr-only">{t('search')}</span>
        <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-secondary" aria-hidden />
        <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder={t('search')} className="input ps-12" />
      </label>
    </div>
  );
}
