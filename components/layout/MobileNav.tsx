'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitch } from './LanguageSwitch';
import { cn } from '@/lib/utils/helpers';
import type { NavItem } from './nav-items';

export function MobileNav({ items }: { items: NavItem[] }) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-btn text-navy hover:bg-navy-50"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t('closeMenu') : t('openMenu')}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-x-0 top-[var(--header-height)] z-50 h-[calc(100dvh-var(--header-height))] overflow-y-auto bg-white transition-all duration-200',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0',
        )}
        aria-hidden={!open}
      >
        <nav className="container-content flex flex-col py-4" aria-label="mobile">
          {items.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('flex items-center gap-3 rounded-btn px-3 py-3 text-body font-semibold', active ? 'bg-primary-50 text-primary-700' : 'text-navy hover:bg-surface')}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                {t(item.key)}
              </Link>
            );
          })}
          <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
            <LanguageSwitch />
            <Link href="/compare" className="btn-primary">
              {t('compareNow')}
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
