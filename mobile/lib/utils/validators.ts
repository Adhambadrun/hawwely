import { z } from 'zod';
import i18n from '@/i18n';

const t = (k: string) => i18n.t(k);

/** Schemas are built lazily so error messages follow the active language. */
export const reviewSchema = () =>
  z.object({
    service_id: z.string().uuid({ message: t('review.errors.service') }),
    corridor_id: z.string().optional(),
    rating: z.number().int().min(1, { message: t('review.errors.rating') }).max(5),
    title: z.string().trim().min(5, { message: t('review.errors.title') }).max(200),
    body: z.string().trim().min(20, { message: t('review.errors.body') }).max(3000),
    amount_sent: z.string().optional(),
    amount_received: z.string().optional(),
    would_recommend: z.boolean().optional(),
    author_name: z.string().trim().max(100).optional(),
  });
export type ReviewValues = z.infer<ReturnType<typeof reviewSchema>>;

export const reportSchema = () =>
  z.object({
    service_id: z.string().uuid({ message: t('report.errors.service') }),
    corridor_id: z.string().uuid({ message: t('report.errors.corridor') }),
    reported_rate: z
      .string()
      .trim()
      .refine((v) => Number(v.replace(/,/g, '')) > 0, { message: t('report.errors.rate') }),
    amount_sent: z.string().optional(),
    amount_received: z.string().optional(),
    fee_charged: z.string().optional(),
  });
export type ReportValues = z.infer<ReturnType<typeof reportSchema>>;

export const alertSchema = () =>
  z.object({
    corridor_id: z.string().uuid(),
    target_rate: z
      .string()
      .trim()
      .min(1, { message: t('alerts.targetRequired') })
      .refine((v) => Number(v.replace(/,/g, '')) > 0, { message: t('alerts.targetInvalid') }),
    direction: z.enum(['above', 'below']),
    notify_via: z.array(z.enum(['push', 'email', 'whatsapp'])).min(1),
  });
export type AlertValues = z.infer<ReturnType<typeof alertSchema>>;

export const num = (v?: string) => {
  const n = Number((v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
