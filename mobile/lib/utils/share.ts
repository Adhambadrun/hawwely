import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import i18n from '@/i18n';
import { APP_URL } from '@/lib/shared/constants';
import { formatNumber } from '@/lib/shared/formatters';
import type { ComparisonResponse } from '@/lib/shared/types';
import { haptic } from './haptics';

type Lang = 'ar' | 'en';
const lang = (): Lang => (i18n.language === 'en' ? 'en' : 'ar');

export function comparisonShareText(data: ComparisonResponse): string {
  const best = data.results[0];
  const l = lang();
  return i18n.t('share.comparison', {
    amount: formatNumber(data.query.amount, l),
    currency: data.query.from,
    best: best ? (l === 'ar' ? best.service.name_ar : best.service.name) : '—',
    bestAmount: best ? formatNumber(best.amount_received, l, { maximumFractionDigits: 0 }) : '—',
    savings: formatNumber(data.summary.max_savings, l, { maximumFractionDigits: 0 }),
    url: `${APP_URL}${l === 'en' ? '/en' : ''}/send-money/${data.query.from.toLowerCase()}-to-egp?amount=${data.query.amount}`,
  });
}

export function rateShareText(currency: string, rate: number, service: string): string {
  const l = lang();
  return i18n.t('share.rate', { currency, rate: formatNumber(rate, l, { maximumFractionDigits: 4 }), service, url: `${APP_URL}${l === 'en' ? '/en' : ''}/rates/${currency.toLowerCase()}-to-egp` });
}

export function appShareText(): string {
  return i18n.t('share.app', { url: APP_URL });
}

export async function shareText(message: string, title?: string): Promise<boolean> {
  haptic.light();
  try {
    if (Platform.OS === 'web') {
      const nav = globalThis.navigator as Navigator | undefined;
      if (nav?.share) {
        await nav.share({ text: message, title });
        return true;
      }
      await Clipboard.setStringAsync(message);
      return true;
    }
    const result = await Share.share({ message, title }, { dialogTitle: title });
    return result.action !== Share.dismissedAction;
  } catch {
    return false;
  }
}

export async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
  haptic.success();
}
