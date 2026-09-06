'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Flag } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Corridor, Service } from '@/lib/types';
import { reportSchema, type ReportValues } from '@/lib/utils/validators';
import { formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';
import { useStore } from '@/store/useStore';

export function ReportRateForm({ services, corridors, currentRates, className }: { services: Service[]; corridors: Corridor[]; currentRates: Record<string, number>; className?: string }) {
  const t = useTranslations('report');
  const tc = useTranslations('common');
  const locale = useLocale() as 'ar' | 'en';
  const pushToast = useStore((s) => s.pushToast);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReportValues>({ resolver: zodResolver(reportSchema), defaultValues: { service_id: '', corridor_id: corridors[0]?.id ?? '' } });

  const serviceId = watch('service_id');
  const corridorId = watch('corridor_id');
  const sent = Number(watch('amount_sent'));
  const received = Number(watch('amount_received'));
  const implied = sent > 0 && received > 0 ? received / sent : null;
  const current = useMemo(() => currentRates[`${serviceId}:${corridorId}`], [currentRates, serviceId, corridorId]);
  const corridor = corridors.find((c) => c.id === corridorId);
  const eligible = services.filter((s) => !corridor || s.supported_corridors.includes(`${corridor.send_currency}-EGP` as never));

  const onSubmit = async (values: ReportValues) => {
    setStatus('loading');
    try {
      await axios.post('/api/reports', values);
      setStatus('done');
      pushToast({ title: t('success'), variant: 'success' });
    } catch (err) {
      setStatus('idle');
      const msg = axios.isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined;
      pushToast({ title: msg ?? t('error'), variant: 'error' });
    }
  };

  if (status === 'done') {
    return (
      <div className={cn('card p-8 text-center', className)} role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden />
        <h2 className="mt-4 text-xl font-bold text-navy">{t('success')}</h2>
        <Link href="/" className="btn-primary mt-6">
          {tc('backHome')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('card space-y-5 p-6', className)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select id="rp-corridor" label={t('corridor')} options={corridors.map((c) => ({ value: c.id, label: `${c.flag_emoji} ${locale === 'ar' ? c.send_country_ar : c.send_country} (${c.send_currency})` }))} error={errors.corridor_id?.message} {...register('corridor_id')} />
        <Select id="rp-service" label={t('service')} options={[{ value: '', label: '—' }, ...eligible.map((s) => ({ value: s.id, label: locale === 'ar' ? s.name_ar : s.name }))]} error={errors.service_id?.message} {...register('service_id')} />
      </div>
      <Input
        id="rp-rate"
        type="number"
        step="0.0001"
        inputMode="decimal"
        dir="ltr"
        label={t('rate')}
        placeholder={t('ratePlaceholder')}
        hint={current ? t('currentRate', { rate: formatRate(current, locale) }) : undefined}
        error={errors.reported_rate?.message}
        {...register('reported_rate')}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input id="rp-sent" type="number" inputMode="decimal" dir="ltr" label={`${t('amountSent')}${corridor ? ` (${corridor.send_currency})` : ''}`} error={errors.amount_sent?.message} {...register('amount_sent')} />
        <Input id="rp-received" type="number" inputMode="decimal" dir="ltr" label={t('amountReceived')} error={errors.amount_received?.message} {...register('amount_received')} />
        <Input id="rp-fee" type="number" inputMode="decimal" dir="ltr" label={`${t('fee')} (${tc('optional')})`} error={errors.fee_charged?.message} {...register('fee_charged')} />
      </div>
      {implied && (
        <p className="rounded-btn bg-navy-50 px-4 py-2 text-small font-semibold text-navy" aria-live="polite">
          {t('impliedRate', { rate: formatRate(implied, locale) })}
        </p>
      )}
      <Input id="rp-shot" type="url" inputMode="url" dir="ltr" label={t('screenshot')} hint={t('screenshotHint')} placeholder="https://" error={errors.screenshot_url?.message} {...register('screenshot_url')} />
      <Button type="submit" size="lg" fullWidth loading={status === 'loading'}>
        <Flag className="h-4 w-4" aria-hidden />
        {status === 'loading' ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
