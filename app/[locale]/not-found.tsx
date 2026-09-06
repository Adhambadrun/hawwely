import { SearchX } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('errors');
  const nav = await getTranslations('nav');
  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-6 rounded-full bg-primary-50" aria-hidden />
        <SearchX className="relative h-16 w-16 text-primary" aria-hidden />
      </div>
      <p className="num text-6xl font-extrabold text-navy">{t('notFoundCode')}</p>
      <h1 className="mt-3 text-2xl font-bold text-navy">{t('notFoundTitle')}</h1>
      <p className="mt-2 max-w-md text-content-secondary">{t('notFoundText')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          {nav('home')}
        </Link>
        <Link href="/compare" className="btn-outline">
          {nav('compareNow')}
        </Link>
      </div>
    </div>
  );
}
