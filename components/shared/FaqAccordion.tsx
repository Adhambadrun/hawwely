'use client';

import { useLocale } from 'next-intl';
import { Accordion } from '@/components/ui/Accordion';
import type { Faq } from '@/lib/types';

export function FaqAccordion({ faqs, className, defaultOpenFirst = false }: { faqs: Faq[]; className?: string; defaultOpenFirst?: boolean }) {
  const locale = useLocale() as 'ar' | 'en';
  if (faqs.length === 0) return null;
  const items = faqs.map((f) => ({
    id: f.id,
    title: locale === 'ar' ? f.question_ar : f.question,
    content: <p className="whitespace-pre-line text-small leading-relaxed text-content">{locale === 'ar' ? f.answer_ar : f.answer}</p>,
  }));
  return <Accordion items={items} defaultOpen={defaultOpenFirst ? items[0]?.id : undefined} className={className} />;
}
