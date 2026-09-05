'use client';

import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Mail, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { subscribeSchema } from '@/lib/utils/validators';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils/helpers';

export function Newsletter({ className, variant = 'section' }: { className?: string; variant?: 'section' | 'inline' }) {
  const t = useTranslations('home');
  const currency = useStore((s) => s.currency);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = subscribeSchema.safeParse({ email, preferred_corridor: `${currency}-EGP` });
    if (!parsed.success) {
      setStatus('error');
      setMessage(t('newsletterInvalid'));
      return;
    }
    setStatus('loading');
    try {
      await axios.post('/api/subscribe', parsed.data);
      setStatus('success');
      setMessage(t('newsletterSuccess'));
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(t('newsletterError'));
    }
  };

  const form = (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row" noValidate>
      <label className="sr-only" htmlFor="newsletter-email">
        {t('newsletterPlaceholder')}
      </label>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-secondary" aria-hidden />
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletterPlaceholder')}
          className="input ps-12 py-3.5 text-body"
          dir="ltr"
          aria-invalid={status === 'error' || undefined}
        />
      </div>
      <Button type="submit" size="lg" variant={variant === 'section' ? 'secondary' : 'primary'} loading={status === 'loading'} className="shrink-0">
        <Send className="h-4 w-4" />
        {t('newsletterButton')}
      </Button>
    </form>
  );

  if (variant === 'inline') {
    return (
      <div className={className}>
        {form}
        {message && (
          <p role="status" className={cn('mt-2 text-small font-medium', status === 'success' ? 'text-primary-700' : 'text-danger')}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className={cn('relative overflow-hidden bg-brand-gradient', className)} aria-labelledby="newsletter-title">
      <div className="hero-dots absolute inset-0 opacity-40" aria-hidden />
      <div className="container-content relative flex flex-col items-center py-14 text-center md:py-20">
        <h2 id="newsletter-title" className="text-section-m font-extrabold text-white md:text-section">
          {t('newsletterTitle')}
        </h2>
        <p className="mt-3 max-w-xl text-white/90">{t('newsletterSubtitle')}</p>
        <div className="mt-8 w-full max-w-xl">{form}</div>
        {message && (
          <p role="status" className={cn('mt-3 rounded-pill bg-white/90 px-4 py-1.5 text-small font-semibold', status === 'success' ? 'text-primary-700' : 'text-danger')}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
