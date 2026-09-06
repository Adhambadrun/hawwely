import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EyeOff, Eye } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { EmptyState } from '@/components/ui/EmptyState';
import type { ComparisonResultItem } from '@/lib/shared/types';
import { formatEgp, formatMoney, formatPercent, formatRate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

export default function FeeBreakdownModal() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const parsed = useMemo(() => {
    try {
      return data ? (JSON.parse(data) as { item: ComparisonResultItem; currency: string }) : null;
    } catch {
      return null;
    }
  }, [data]);

  if (!parsed) {
    return (
      <Screen plain>
        <TopBar close />
        <EmptyState title={t('common.error')} actionLabel={t('common.close')} onAction={() => router.back()} />
      </Screen>
    );
  }
  const { item, currency } = parsed;
  const name = lang === 'ar' ? item.service.name_ar : item.service.name;
  const hiddenShare = item.loss_vs_mid_market > 0 ? (item.hidden_fee_egp / item.loss_vs_mid_market) * 100 : 0;

  return (
    <Screen padded={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <TopBar close title={t('feeBreakdown.title')} subtitle={t('feeBreakdown.via', { service: name })} />
      <View style={styles.content}>
        <Card style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <ServiceLogo name={item.service.name} color={item.service.brand_color} size={40} />
            <Text variant="h3">{name}</Text>
          </View>
          <Line label={t('feeBreakdown.amountSent')} value={formatMoney(item.amount_sent, currency, lang, { showCode: true, decimals: 2 })} />
          <Line label={t('feeBreakdown.fixedFee')} value={`− ${formatMoney(item.fixed_fee, item.fee_currency, lang, { showCode: true, decimals: 2 })}`} muted />
          <Line label={`${t('feeBreakdown.percentFee')} (${formatPercent(item.percent_fee, lang, 2)})`} value={`− ${formatMoney(Math.max(0, item.total_fee - item.fixed_fee), currency, lang, { showCode: true, decimals: 2 })}`} muted />
          <Line label={t('feeBreakdown.afterFees')} value={formatMoney(item.amount_after_fee, currency, lang, { showCode: true, decimals: 2 })} strong />
          <Line label={t('feeBreakdown.exchangeRate')} value={`× ${formatRate(item.exchange_rate, lang)}`} muted />
          <View style={styles.total}>
            <Text variant="bodyBold">{t('feeBreakdown.received')}</Text>
            <Text variant="numLarge" color={colors.primaryDark} ltr>
              {formatEgp(item.amount_received, lang)}
            </Text>
          </View>
        </Card>

        <Card style={{ marginTop: 12, gap: 4 }}>
          <Text variant="h3" style={{ marginBottom: 6 }}>
            📊 {t('feeBreakdown.midMarketTitle')}
          </Text>
          <Line label={t('feeBreakdown.midMarket')} value={`1 ${currency} = ${formatRate(item.mid_market_received / item.amount_sent, lang)}`} />
          <Line label={t('feeBreakdown.withoutFees')} value={formatEgp(item.mid_market_received, lang)} />
          <Line label={t('feeBreakdown.totalCost')} value={`${formatEgp(item.loss_vs_mid_market, lang)} (${formatPercent(item.total_cost_percent, lang, 2)})`} strong danger />
          <View style={styles.split}>
            <View style={[styles.splitItem, { backgroundColor: colors.navyLight }]}>
              <Eye size={16} color={colors.navy} />
              <Text variant="caption" color={colors.textSecondary}>
                {t('feeBreakdown.visibleFee')}
              </Text>
              <Text variant="num" ltr>
                {formatEgp(item.visible_fee_egp, lang)}
              </Text>
            </View>
            <View style={[styles.splitItem, { backgroundColor: '#FEE2E2' }]}>
              <EyeOff size={16} color={colors.danger} />
              <Text variant="caption" color={colors.textSecondary}>
                {t('feeBreakdown.hiddenFee')}
              </Text>
              <Text variant="num" color={colors.danger} ltr>
                {formatEgp(item.hidden_fee_egp, lang)}
              </Text>
            </View>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.min(100, Math.max(0, 100 - hiddenShare))}%` }]} />
          </View>
          {item.hidden_fee_egp > 0 ? (
            <Text variant="caption" color={colors.danger}>
              ⚠️ {t('feeBreakdown.hiddenWarning')}
            </Text>
          ) : (
            <Text variant="caption" color={colors.success}>
              ✓ {t('results.midMarket')} — {formatPercent(0, lang, 0)} {t('results.markup')}
            </Text>
          )}
        </Card>

        <Button title={t('feeBreakdown.understand')} size="lg" fullWidth onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    </Screen>
  );
}

function Line({ label, value, muted, strong, danger }: { label: string; value: string; muted?: boolean; strong?: boolean; danger?: boolean }) {
  return (
    <View style={styles.line}>
      <Text variant={strong ? 'smallBold' : 'small'} color={muted ? colors.textSecondary : colors.text} style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant={strong ? 'num' : 'numSmall'} color={danger ? colors.danger : muted ? colors.textSecondary : colors.text} ltr>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  total: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  split: { flexDirection: 'row', gap: 10, marginTop: 12 },
  splitItem: { flex: 1, borderRadius: radius.md, padding: 12, gap: 4, alignItems: 'center' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: '#FEE2E2', overflow: 'hidden', marginTop: 10 },
  barFill: { height: 8, backgroundColor: colors.navy },
});
