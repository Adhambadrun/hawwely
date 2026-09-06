'use client';

import { useState } from 'react';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { StarRating } from '@/components/ui/StarRating';
import type { Corridor, Service } from '@/lib/types';
import { TRANSFER_SPEED_MINUTES } from '@/lib/utils/constants';
import { reviewSchema, type ReviewValues } from '@/lib/utils/validators';
import { cn } from '@/lib/utils/helpers';
import { useStore } from '@/store/useStore';

export function ReviewForm({ services, corridors, defaultServiceId, className }: { services: Service[]; corridors: Corridor[]; defaultServiceId?: string; className?: string }) {
  const t = useTranslations('reviews');
  const tc = useTranslations('common');
  const ts = useTranslations('speed');
  const locale = useLocale() as 'ar' | 'en';
  const pushToast = useStore((s) => s.pushToast);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { service_id: defaultServiceId ?? '', corridor_id: '', rating: 0, title: '', body: '', would_recommend: true, author_name: '' },
  });

  const rating = watch('rating');
  const corridorId = watch('corridor_id');
  const recommend = watch('would_recommend');
  const currency = corridors.find((c) => c.id === corridorId)?.send_currency;

  const onSubmit = async (values: ReviewValues) => {
    setStatus('loading');
    try {
      await axios.post('/api/reviews', { ...values, send_currency: currency ?? '' });
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
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/reviews" className="btn-primary">
            {t('title')}
          </Link>
          <Link href="/" className="btn-outline">
            {tc('backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('card space-y-5 p-6', className)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select id="r-service" label={t('service')} options={[{ value: '', label: '—' }, ...services.map((s) => ({ value: s.id, label: locale === 'ar' ? s.name_ar : s.name }))]} error={errors.service_id?.message} {...register('service_id')} />
        <Select id="r-corridor" label={`${t('corridor')} (${tc('optional')})`} options={[{ value: '', label: '—' }, ...corridors.map((c) => ({ value: c.id, label: `${c.flag_emoji} ${locale === 'ar' ? c.send_country_ar : c.send_country}` }))]} error={errors.corridor_id?.message} {...register('corridor_id')} />
      </div>

      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <div>
            <span className="label">{t('rating')}</span>
            <div className="flex items-center gap-3">
              <StarRating value={field.value} onChange={field.onChange} size="lg" label={t('selectRating')} />
              <span className="text-small font-semibold text-navy" aria-live="polite">
                {rating ? t(`ratingLabels.${rating}` as never) : t('selectRating')}
              </span>
            </div>
            {errors.rating && <p className="mt-1.5 text-caption text-danger">{errors.rating.message}</p>}
          </div>
        )}
      />

      <Input id="r-title" label={t('reviewTitle')} placeholder={t('reviewTitlePlaceholder')} error={errors.title?.message} {...register('title')} />
      <Textarea id="r-body" rows={5} label={t('body')} placeholder={t('bodyPlaceholder')} error={errors.body?.message} {...register('body')} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input id="r-sent" type="number" inputMode="decimal" dir="ltr" label={`${t('amountSent')}${currency ? ` (${currency})` : ''}`} error={errors.amount_sent?.message} {...register('amount_sent')} />
        <Input id="r-received" type="number" inputMode="decimal" dir="ltr" label={`${t('amountReceived')} (EGP)`} error={errors.amount_received?.message} {...register('amount_received')} />
        <Select id="r-speed" label={t('speedActual')} options={[{ value: '', label: '—' }, ...Object.keys(TRANSFER_SPEED_MINUTES).map((k) => ({ value: k, label: ts(k as never) }))]} {...register('transfer_speed_actual')} />
      </div>

      <fieldset>
        <legend className="label">{t('wouldRecommend')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              type="button"
              onClick={() => setValue('would_recommend', v)}
              className={cn('rounded-btn border px-3 py-2.5 text-small font-semibold transition', recommend === v ? (v ? 'border-primary bg-primary-50 text-primary-800' : 'border-danger bg-red-50 text-danger') : 'border-card-border bg-white text-navy')}
              aria-pressed={recommend === v}
            >
              {v ? `👍 ${tc('yes')}` : `👎 ${tc('no')}`}
            </button>
          ))}
        </div>
      </fieldset>

      <Input id="r-name" label={`${t('yourName')} (${tc('optional')})`} autoComplete="name" error={errors.author_name?.message} {...register('author_name')} />

      <Button type="submit" size="lg" fullWidth loading={status === 'loading'}>
        <Send className="h-4 w-4" aria-hidden />
        {status === 'loading' ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
