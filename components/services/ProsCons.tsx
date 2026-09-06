import { CheckCircle2, XCircle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Service } from '@/lib/types';
import { cn } from '@/lib/utils/helpers';

export function ProsCons({ service, className }: { service: Service; className?: string }) {
  const t = useTranslations('services');
  const locale = useLocale() as 'ar' | 'en';
  const pros = (locale === 'ar' ? service.pros_ar : service.pros) ?? service.pros ?? [];
  const cons = (locale === 'ar' ? service.cons_ar : service.cons) ?? service.cons ?? [];
  if (pros.length === 0 && cons.length === 0) return null;
  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      <div className="card border-primary/20 bg-primary-50/40 p-5">
        <h3 className="flex items-center gap-2 font-bold text-primary-800">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
          {t('pros')}
        </h3>
        <ul className="mt-3 space-y-2 text-small text-content">
          {pros.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="card border-danger/20 bg-red-50/40 p-5">
        <h3 className="flex items-center gap-2 font-bold text-danger">
          <XCircle className="h-5 w-5" aria-hidden />
          {t('cons')}
        </h3>
        <ul className="mt-3 space-y-2 text-small text-content">
          {cons.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
