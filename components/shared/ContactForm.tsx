'use client';

import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { contactSchema, type ContactValues } from '@/lib/utils/validators';
import { cn } from '@/lib/utils/helpers';
import { useStore } from '@/store/useStore';

const SUBJECTS = ['general', 'wrongRate', 'partnership', 'press', 'bug'] as const;

export function ContactForm({ className }: { className?: string }) {
  const t = useTranslations('contact');
  const pushToast = useStore((s) => s.pushToast);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues: { name: '', email: '', subject: t('subjects.general'), message: '' } });

  const onSubmit = async (values: ContactValues) => {
    setStatus('loading');
    try {
      await axios.post('/api/contact', values);
      setStatus('done');
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
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('card space-y-5 p-6', className)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="c-name" label={t('name')} autoComplete="name" error={errors.name?.message} {...register('name')} />
        <Input id="c-email" type="email" inputMode="email" dir="ltr" label={t('email')} autoComplete="email" error={errors.email?.message} {...register('email')} />
      </div>
      <Select id="c-subject" label={t('subject')} options={SUBJECTS.map((s) => ({ value: t(`subjects.${s}`), label: t(`subjects.${s}`) }))} error={errors.subject?.message} {...register('subject')} />
      <Textarea id="c-message" rows={6} label={t('message')} error={errors.message?.message} {...register('message')} />
      <Button type="submit" size="lg" fullWidth loading={status === 'loading'}>
        <Send className="h-4 w-4" aria-hidden />
        {status === 'loading' ? t('sending') : t('send')}
      </Button>
    </form>
  );
}
