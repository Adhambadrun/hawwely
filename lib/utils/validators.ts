import { z } from 'zod';
import { MAX_AMOUNT, MIN_AMOUNT, SEND_CURRENCIES } from './constants';

/**
 * Zod schemas shared between client forms and API routes.
 * Error messages are Arabic by default (the UI maps them via i18n keys where needed).
 */

export const sendCurrencySchema = z.enum(SEND_CURRENCIES as unknown as [string, ...string[]]);

export const amountSchema = z.coerce
  .number({ invalid_type_error: 'من فضلك اكتب مبلغ صحيح' })
  .min(MIN_AMOUNT, { message: 'المبلغ لازم يكون أكبر من صفر' })
  .max(MAX_AMOUNT, { message: 'المبلغ كبير جداً' });

export const compareQuerySchema = z.object({
  from: z.string().trim().toUpperCase().pipe(sendCurrencySchema),
  to: z.string().trim().toUpperCase().default('EGP'),
  amount: amountSchema.default(2000),
  payout: z.enum(['bank_transfer', 'cash_pickup', 'mobile_wallet', 'instapay']).optional(),
});

export const comparisonFormSchema = z.object({
  from: sendCurrencySchema,
  amount: amountSchema,
});
export type ComparisonFormValues = z.infer<typeof comparisonFormSchema>;

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'الإيميل مش صحيح' }),
  name: z.string().trim().max(200).optional().or(z.literal('')),
  country_code: z.string().trim().length(2).optional().or(z.literal('')),
  preferred_corridor: z.string().trim().max(10).optional().or(z.literal('')),
});
export type SubscribeValues = z.infer<typeof subscribeSchema>;

export const reviewSchema = z.object({
  service_id: z.string().uuid({ message: 'اختار الخدمة' }),
  corridor_id: z.string().uuid().optional().or(z.literal('')),
  rating: z.coerce.number().int().min(1, { message: 'اختار التقييم' }).max(5),
  title: z.string().trim().min(3, { message: 'العنوان قصير جداً' }).max(200),
  body: z.string().trim().min(20, { message: 'اكتب على الأقل 20 حرف عشان تفيد غيرك' }).max(3000),
  amount_sent: z.coerce.number().positive().optional().or(z.literal('')),
  amount_received: z.coerce.number().positive().optional().or(z.literal('')),
  send_currency: z.string().trim().max(3).optional().or(z.literal('')),
  transfer_speed_actual: z.string().trim().max(50).optional().or(z.literal('')),
  would_recommend: z.boolean().optional(),
  author_name: z.string().trim().max(100).optional().or(z.literal('')),
});
export type ReviewValues = z.infer<typeof reviewSchema>;

export const reportSchema = z.object({
  service_id: z.string().uuid({ message: 'اختار الخدمة' }),
  corridor_id: z.string().uuid({ message: 'اختار البلد' }),
  reported_rate: z.coerce.number({ invalid_type_error: 'اكتب سعر الصرف' }).positive({ message: 'سعر الصرف لازم يكون أكبر من صفر' }),
  amount_sent: z.coerce.number().positive({ message: 'اكتب المبلغ اللي بعته' }).optional().or(z.literal('')),
  amount_received: z.coerce.number().positive().optional().or(z.literal('')),
  fee_charged: z.coerce.number().min(0).optional().or(z.literal('')),
  screenshot_url: z.string().url().optional().or(z.literal('')),
});
export type ReportValues = z.infer<typeof reportSchema>;

export const alertSchema = z.object({
  corridor_id: z.string().uuid({ message: 'اختار البلد' }),
  target_rate: z.coerce.number({ invalid_type_error: 'اكتب السعر المطلوب' }).positive({ message: 'السعر لازم يكون أكبر من صفر' }),
  direction: z.enum(['above', 'below']).default('above'),
  notify_via: z.array(z.enum(['email', 'whatsapp', 'telegram'])).min(1, { message: 'اختار طريقة تنبيه واحدة على الأقل' }),
});
export type AlertValues = z.infer<typeof alertSchema>;

export const clickSchema = z.object({
  service_id: z.string().uuid(),
  corridor_id: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().nonnegative().optional().nullable(),
  session_id: z.string().max(100).optional().nullable(),
});
export type ClickValues = z.infer<typeof clickSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, { message: 'اكتب اسمك' }).max(100),
  email: z.string().trim().email({ message: 'الإيميل مش صحيح' }),
  subject: z.string().trim().min(3, { message: 'اكتب الموضوع' }).max(200),
  message: z.string().trim().min(10, { message: 'الرسالة قصيرة جداً' }).max(3000),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const magicLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'الإيميل مش صحيح' }),
});
export type MagicLinkValues = z.infer<typeof magicLinkSchema>;
