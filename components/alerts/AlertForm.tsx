'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Mail, MessageCircle, Send } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import type { Corridor, NotifyChannel } from '@/lib/types';
import { alertSchema, type AlertValues } from '@/lib/utils/validators';
import { formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

export interface AlertFormProps {
  corridors: Corridor[];
  midRates: Record<string, number>;
  defaultCorridorId?: string;
  onSubmit: (values: AlertValues) => Promise<void> | void;
  submitting?: boolean;
  className?: string;
}

const CHANNELS: { value: NotifyChannel; icon: typeof Mail }[] = [
  { value: 'email', icon: Mail },
  { value: 'whatsapp', icon: MessageCircle },
  { value: 'telegram', icon: Send },
];

export function AlertForm({ corridors, midRates, defaultCorridorId, onSubmit, submitting = false, className }: AlertFormProps) {
  const t = useTranslations('alerts');
  const locale = useLocale() as 'ar' | 'en';
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AlertValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: { corridor_id: defaultCorridorId ?? corridors[0]?.id ?? '', direction: 'above', notify_via: ['email'], target_rate: undefined as unknown as number },
  });

  const corridorId = watch('corridor_id');
  const direction = watch('direction');
  const corridor = useMemo(() => corridors.find((c) => c.id === corridorId), [corridors, corridorId]);
  const current = corridor ? midRates[corridor.send_currency] : undefined;
  const example = current ? formatRate(current * (direction === 'above' ? 1.02 : 0.98), locale) : '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)} noValidate>
      <Select
        id="alert-corridor"
        label={t('corridor')}
        options={corridors.map((c) => ({ value: c.id, label: `${c.flag_emoji} ${locale === 'ar' ? c.send_country_ar : c.send_country} (${c.send_currency}/EGP)` }))}
        error={errors.corridor_id?.message}
        {...register('corridor_id')}
      />

      <fieldset>
        <legend className="label">{t('notifyWhen')}</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {(['above', 'below'] as const).map((d) => (
            <label key={d} className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-btn border px-3 py-2.5 text-small font-semibold transition', direction === d ? 'border-primary bg-primary-50 text-primary-800' : 'border-card-border bg-white text-navy hover:border-navy-200')}>
              <input type="radio" value={d} className="sr-only" {...register('direction')} />
              {d === 'above' ? '📈' : '📉'} {t(d === 'above' ? 'goesAbove' : 'goesBelow')}
            </label>
          ))}
        </div>
      </fieldset>

      <Input
        id="alert-target"
        type="number"
        step="0.0001"
        min="0"
        inputMode="decimal"
        dir="ltr"
        label={t('targetRate')}
        hint={current ? `${t('currentRate', { rate: formatRate(current, locale) })} · ${t('targetHint', { example })}` : undefined}
        error={errors.target_rate?.message}
        {...register('target_rate')}
      />

      <Controller
        control={control}
        name="notify_via"
        render={({ field }) => (
          <fieldset>
            <legend className="label">{t('notifyVia')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {CHANNELS.map(({ value, icon: Icon }) => {
                const checked = field.value?.includes(value);
                return (
                  <label key={value} className={cn('flex cursor-pointer flex-col items-center gap-1 rounded-btn border px-2 py-3 text-caption font-semibold transition', checked ? 'border-primary bg-primary-50 text-primary-800' : 'border-card-border bg-white text-navy hover:border-navy-200')}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={(e) => field.onChange(e.target.checked ? [...(field.value ?? []), value] : (field.value ?? []).filter((v) => v !== value))}
                    />
                    <Icon className="h-5 w-5" aria-hidden />
                    {t(value)}
                  </label>
                );
              })}
            </div>
            {errors.notify_via && <p className="mt-1.5 text-caption text-danger">{errors.notify_via.message as string}</p>}
          </fieldset>
        )}
      />

      <Button type="submit" fullWidth size="lg" loading={submitting}>
        <Bell className="h-4 w-4" aria-hidden />
        {submitting ? t('creating') : t('create')}
      </Button>
    </form>
  );
}
