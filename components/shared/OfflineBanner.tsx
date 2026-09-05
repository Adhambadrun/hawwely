'use client';

import { WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useOnline } from '@/lib/hooks/useOnline';

export function OfflineBanner() {
  const online = useOnline();
  const t = useTranslations('common');
  if (online) return null;
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-center text-small font-semibold text-navy">
      <WifiOff className="h-4 w-4" aria-hidden />
      {t('offline')}
    </div>
  );
}
