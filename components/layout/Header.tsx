import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/shared/Logo';
import { CurrencyBanner } from './CurrencyBanner';
import { HeaderNav } from './HeaderNav';
import { LanguageSwitch } from './LanguageSwitch';
import { MobileNav } from './MobileNav';
import { NAV_ITEMS } from './nav-items';

export async function Header() {
  const locale = await getLocale();
  const t = await getTranslations('nav');
  return (
    <>
      <CurrencyBanner />
      <header className="sticky top-0 z-50 border-b border-card-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="container-content flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label={t('home')} className="shrink-0">
            <Logo locale={locale} />
          </Link>
          <HeaderNav />
          <div className="flex items-center gap-2">
            <LanguageSwitch className="hidden sm:inline-flex" />
            <Link href="/compare" className="btn-primary hidden sm:inline-flex">
              {t('compareNow')}
            </Link>
            <MobileNav items={NAV_ITEMS} />
          </div>
        </div>
      </header>
    </>
  );
}
