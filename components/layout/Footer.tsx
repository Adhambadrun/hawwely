import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/shared/Logo';
import { getCorridors } from '@/lib/api/corridors';
import { SOCIAL_LINKS, currencyToSlug } from '@/lib/utils/constants';
import { LanguageSwitch } from './LanguageSwitch';

export async function Footer() {
  const locale = (await getLocale()) as 'ar' | 'en';
  const t = await getTranslations('footer');
  const nav = await getTranslations('nav');
  const corridors = (await getCorridors()).slice(0, 8);
  const year = new Date().getFullYear();

  const product = [
    { href: '/compare', label: nav('compare') },
    { href: '/rates', label: nav('rates') },
    { href: '/services', label: nav('services') },
    { href: '/alerts', label: nav('alerts') },
    { href: '/reviews', label: nav('reviews') },
    { href: '/report-rate', label: nav('reportRate') },
  ];
  const company = [
    { href: '/about', label: nav('about') },
    { href: '/blog', label: nav('blog') },
    { href: '/faq', label: nav('faq') },
    { href: '/contact', label: nav('contact') },
  ];
  const legal = [
    { href: '/privacy', label: nav('privacy') },
    { href: '/terms', label: nav('terms') },
  ];
  const socials = [
    { key: 'facebook', label: 'Facebook', href: SOCIAL_LINKS.facebook },
    { key: 'twitter', label: 'X', href: SOCIAL_LINKS.twitter },
    { key: 'tiktok', label: 'TikTok', href: SOCIAL_LINKS.tiktok },
    { key: 'instagram', label: 'Instagram', href: SOCIAL_LINKS.instagram },
    { key: 'telegram', label: 'Telegram', href: SOCIAL_LINKS.telegram },
    { key: 'whatsapp', label: 'WhatsApp', href: SOCIAL_LINKS.whatsapp },
  ];

  return (
    <footer className="border-t border-white/10 bg-navy-900 text-white/80" role="contentinfo">
      <div className="container-content grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo dark locale={locale} />
          <p className="mt-3 text-body font-semibold text-white">{t('tagline')}</p>
          <p className="mt-2 max-w-sm text-small">{t('description')}</p>
          <div className="mt-6">
            <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-white/60">{t('followUs')}</p>
            <ul className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-pill border border-white/15 px-3 text-caption font-semibold text-white/80 transition hover:border-primary hover:text-primary-light">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <FooterColumn title={t('product')} links={product} />
        <FooterColumn title={t('company')} links={[...company, ...legal]} />
        <div>
          <h3 className="mb-3 text-small font-bold text-white">{t('corridors')}</h3>
          <ul className="space-y-2">
            {corridors.map((c) => (
              <li key={c.id}>
                <Link href={`/send-money/${currencyToSlug(c.send_currency)}`} className="text-small transition hover:text-primary-light">
                  <span aria-hidden>{c.flag_emoji}</span> {locale === 'ar' ? c.send_country_ar : c.send_country} → {locale === 'ar' ? 'مصر' : 'Egypt'}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-content flex flex-col gap-4 py-6 text-caption md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>{t('copyright', { year })}</p>
            <p className="text-white/50">{t('disclaimer')}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60">{t('madeWith')}</span>
            <LanguageSwitch variant="text" className="text-white hover:text-primary-light" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 text-small font-bold text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-small transition hover:text-primary-light">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
