'use client';

import { useState, type MouseEvent } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { getOrCreateSessionId } from '@/lib/utils/helpers';

export interface SendButtonProps extends Omit<ButtonProps, 'onClick'> {
  serviceId: string;
  serviceName: string;
  corridorId?: string | null;
  amount?: number | null;
  /** Pre-resolved destination (used as a fallback if tracking fails). */
  fallbackUrl?: string | null;
  label?: string;
}

/**
 * Affiliate CTA. Opens the provider in a new tab immediately (so mobile popup
 * blockers don't interfere), then asks /api/clicks for the tracked URL and
 * redirects the opened tab to it.
 */
export function SendButton({ serviceId, serviceName, corridorId, amount, fallbackUrl, label, children, ...props }: SendButtonProps) {
  const t = useTranslations('results');
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const win = window.open('', '_blank', 'noopener,noreferrer');

    let url = fallbackUrl ?? null;
    try {
      const res = await axios.post<{ url: string | null }>(
        '/api/clicks',
        { service_id: serviceId, corridor_id: corridorId ?? null, amount: amount ?? null, session_id: getOrCreateSessionId() },
        { timeout: 6000 },
      );
      url = res.data.url ?? url;
    } catch {
      /* tracking failure must never block the user */
    }

    if (url) {
      if (win) win.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      win?.close();
    }
    setBusy(false);
  };

  return (
    <Button onClick={handleClick} loading={busy} aria-label={t('sendWith', { service: serviceName })} {...props}>
      {children ?? (
        <>
          {label ?? t('sendNow')}
          <Arrow className="h-4 w-4" aria-hidden />
          <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </>
      )}
    </Button>
  );
}
