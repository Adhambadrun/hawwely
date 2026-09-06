'use client';

import { TriangleAlert } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { ComparisonResultItem } from '@/lib/types';
import { formatEgp, formatMoney, formatPercent, formatRate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

function Row({ label, value, strong = false, muted = false, className }: { label: string; value: string; strong?: boolean; muted?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 py-1.5', className)}>
      <span className={cn('text-small', muted ? 'text-content-secondary' : 'text-navy', strong && 'font-bold')}>{label}</span>
      <span className={cn('num text-small', muted ? 'text-content-secondary' : 'text-navy', strong && 'text-base font-extrabold')} dir="ltr">
        {value}
      </span>
    </div>
  );
}

/** Inline (expandable) breakdown body — used inside cards and inside the modal. */
export function FeeBreakdownBody({ item, midMarketRate }: { item: ComparisonResultItem; midMarketRate: number }) {
  const t = useTranslations('feeBreakdown');
  const locale = useLocale() as 'ar' | 'en';
  const cur = item.fee_currency;
  const name = locale === 'ar' ? item.service.name_ar : item.service.name;
  const percentFeeAmount = item.amount_sent * (item.percent_fee / 100);

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-surface p-4">
        <Row label={t('amountSent')} value={formatMoney(item.amount_sent, cur, locale, { decimals: 2, showCode: true })} />
        <Row label={`− ${t('fixedFee')}`} value={`− ${formatMoney(item.fixed_fee, cur, locale, { decimals: 2, showCode: true })}`} muted />
        <Row label={`− ${t('percentFee', { percent: formatPercent(item.percent_fee, locale, 2) })}`} value={`− ${formatMoney(percentFeeAmount, cur, locale, { decimals: 2, showCode: true })}`} muted />
        <div className="my-1 border-t border-dashed border-card-border" />
        <Row label={t('afterFees')} value={formatMoney(item.amount_after_fee, cur, locale, { decimals: 2, showCode: true })} strong />
        <Row label={`× ${t('exchangeRate')}`} value={`${formatRate(item.exchange_rate, locale, 4)} EGP/${cur}`} muted />
        <div className="my-1 border-t border-dashed border-card-border" />
        <Row label={t('received')} value={formatEgp(item.amount_received, locale, 2)} strong className="text-primary-700" />
      </div>

      <div>
        <p className="mb-2 text-small font-bold text-navy">{t('midMarketTitle')}</p>
        <div className="rounded-card border border-card-border p-4">
          <Row label={t('midMarket')} value={`${formatRate(midMarketRate, locale, 4)} EGP/${cur}`} />
          <Row label={t('withoutFees')} value={formatEgp(item.mid_market_received, locale, 2)} />
          <div className="my-1 border-t border-dashed border-card-border" />
          <Row label={t('totalCost')} value={`${formatEgp(item.loss_vs_mid_market, locale, 2)} (${formatPercent(item.total_cost_percent, locale, 2)})`} strong />
          <Row label={`├── ${t('visibleFee')}`} value={formatEgp(item.visible_fee_egp, locale, 2)} muted />
          <Row label={`└── ${t('hiddenFee')} ⚠️`} value={formatEgp(item.hidden_fee_egp, locale, 2)} muted />
        </div>
        {item.hidden_fee_egp > item.visible_fee_egp && (
          <p className="mt-3 flex items-start gap-2 rounded-btn bg-amber-50 p-3 text-caption text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {t('hiddenWarning')}
          </p>
        )}
      </div>
      <p className="sr-only">{name}</p>
    </div>
  );
}

export function FeeBreakdownModal({ item, midMarketRate, open, onClose }: { item: ComparisonResultItem | null; midMarketRate: number; open: boolean; onClose: () => void }) {
  const t = useTranslations('feeBreakdown');
  const locale = useLocale();
  if (!item) return null;
  const name = locale === 'ar' ? item.service.name_ar : item.service.name;
  return (
    <Modal open={open} onClose={onClose} title={t('title', { service: name })} footer={<Button fullWidth onClick={onClose}>{t('understand')}</Button>}>
      <FeeBreakdownBody item={item} midMarketRate={midMarketRate} />
    </Modal>
  );
}
