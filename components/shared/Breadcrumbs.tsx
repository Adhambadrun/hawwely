import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils/helpers';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className, light = false }: { items: Crumb[]; className?: string; light?: boolean }) {
  const locale = useLocale();
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;
  return (
    <nav aria-label="breadcrumb" className={cn('text-caption', light ? 'text-white/70' : 'text-content-secondary', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className={cn('inline-flex items-center hover:underline', light ? 'text-white/80' : 'text-content-secondary')} aria-label="home">
            <Home className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
            <Chevron className="h-3.5 w-3.5 opacity-60" aria-hidden />
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className={cn('font-semibold', light ? 'text-white' : 'text-navy')} aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
