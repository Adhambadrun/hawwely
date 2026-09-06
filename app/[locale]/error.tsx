'use client';

import { useEffect } from 'react';
import { ServerCrash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errors');
  const common = useTranslations('common');
  useEffect(() => {
    console.error('[hawwely] page error:', error);
  }, [error]);

  return (
    <div className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-6 rounded-full bg-red-50" aria-hidden />
        <ServerCrash className="relative h-16 w-16 text-danger" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold text-navy">{t('errorTitle')}</h1>
      <p className="mt-2 max-w-md text-content-secondary">{t('errorText')}</p>
      {error.digest && <p className="num mt-2 text-caption text-content-secondary/60">#{error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>{t('tryAgain')}</Button>
        <Link href="/" className="btn-outline">
          {common('backHome')}
        </Link>
      </div>
    </div>
  );
}
