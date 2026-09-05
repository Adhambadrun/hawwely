'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/helpers';
import { NAV_ITEMS } from './nav-items';

export function HeaderNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="main">
      {NAV_ITEMS.filter((i) => i.key !== 'home').map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn('rounded-btn px-3 py-2 text-small font-semibold transition', active ? 'bg-primary-50 text-primary-700' : 'text-navy hover:bg-navy-50')}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
