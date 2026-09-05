'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SOCIAL_LINKS } from '@/lib/utils/constants';

export function WhatsAppFloat() {
  const t = useTranslations('whatsapp');
  const href = `${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(t('message'))}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('label')}
      title={t('label')}
      className="fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-modal transition-transform hover:scale-105 active:scale-95 print:hidden"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" aria-hidden />
    </a>
  );
}
