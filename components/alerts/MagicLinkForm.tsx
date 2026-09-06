'use client';

import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { magicLinkSchema } from '@/lib/utils/validators';

/** Passwordless login: Supabase magic link → /api/auth/callback?next=<path>. */
export function MagicLinkForm({ next = '/alerts', className }: { next?: string; className?: string }) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = magicLinkSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t('error'));
      return;
    }
    if (!supabase) {
      setError(t('demoNotice'));
      return;
    }
    setStatus('loading');
    setError(null);
    const base = window.location.origin;
    const target = locale === 'ar' ? next : `/${locale}${next}`;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: `${base}/api/auth/callback?next=${encodeURIComponent(target)}`, data: { preferred_language: locale } },
    });
    if (err) {
      setStatus('error');
      setError(t('error'));
      return;
    }
    setStatus('sent');
  };

  if (status === 'sent') {
    return (
      <div className={className} role="status">
        <div className="rounded-card border border-primary/30 bg-primary-50 p-5 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <p className="mt-2 font-semibold text-navy">{t('checkEmail')}</p>
          <p className="mt-1 text-caption text-content-secondary" dir="ltr">
            {email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      <Input
        id="magic-email"
        type="email"
        label={t('email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        inputMode="email"
        dir="ltr"
        error={error ?? undefined}
        required
      />
      <Button type="submit" fullWidth size="lg" loading={status === 'loading'} className="mt-4">
        <Mail className="h-4 w-4" aria-hidden />
        {status === 'loading' ? t('sending') : t('sendLink')}
      </Button>
      {!supabase && <p className="mt-3 text-center text-caption text-warning">{t('demoNotice')}</p>}
    </form>
  );
}
