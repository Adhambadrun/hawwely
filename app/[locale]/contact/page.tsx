import type { Metadata } from 'next';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ContactForm } from '@/components/shared/ContactForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/shared/JsonLd';
import { breadcrumbJsonLd, buildMetadata, localizedUrl } from '@/lib/seo';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/utils/constants';
import type { Locale } from '@/i18n/routing';

type Props = { params: { locale: Locale } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildMetadata({ locale, path: '/contact', title: t('contactTitle'), description: t('contactDescription') });
}

export default async function ContactPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, tn, tw] = await Promise.all([getTranslations('contact'), getTranslations('nav'), getTranslations('whatsapp')]);
  const channels = [
    { icon: Mail, label: t('emailUs'), value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { icon: MessageCircle, label: t('whatsappUs'), value: 'WhatsApp', href: `${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(tw('message'))}` },
    { icon: Send, label: t('telegramUs'), value: '@hawwely', href: SOCIAL_LINKS.telegram },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: tn('home'), url: localizedUrl(locale, '/') },
          { name: t('title'), url: localizedUrl(locale, '/contact') },
        ])}
      />
      <PageHeader title={t('title')} subtitle={t('subtitle')} eyebrow={<Breadcrumbs light items={[{ label: t('title') }]} />} />
      <section className="section bg-surface">
        <div className="container-content grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <ContactForm />
          <aside className="space-y-4 lg:sticky lg:top-24">
            {channels.map(({ icon: Icon, label, value, href }) => (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="card card-hover flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-navy">{label}</p>
                  <p className="truncate text-small text-content-secondary" dir="ltr">
                    {value}
                  </p>
                </div>
              </a>
            ))}
            <p className="text-small text-content-secondary">
              {t('faqHint')}{' '}
              <Link href="/faq" className="font-semibold text-primary-700 hover:underline">
                {t('faqLink')}
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
