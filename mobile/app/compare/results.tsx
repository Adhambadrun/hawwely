import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, SearchX, Pencil } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { SourceNote } from '@/components/layout/SourceNote';
import { ErrorView } from '@/components/layout/ErrorView';
import { Text } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResultCard } from '@/components/compare/ResultCard';
import { ResultsSkeleton } from '@/components/compare/ResultsSkeleton';
import { SavingsBanner } from '@/components/compare/SavingsBanner';
import { SortBar, type SortKey } from '@/components/compare/SortBar';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { fetchComparison } from '@/lib/api/client';
import type { PayoutMethod, SendCurrency } from '@/lib/shared/types';
import { isSendCurrency } from '@/lib/shared/constants';
import { formatNumber } from '@/lib/shared/formatters';
import { useStore } from '@/store/useStore';
import { useLang } from '@/lib/hooks/useLang';
import { comparisonShareText, shareText } from '@/lib/utils/share';
import { haptic } from '@/lib/utils/haptics';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ currency?: string; amount?: string; payout?: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useStore();
  const currency: SendCurrency = isSendCurrency(params.currency) ? params.currency : store.currency;
  const amount = Number(params.amount) > 0 ? Number(params.amount) : store.amount;
  const [payout, setPayout] = useState<PayoutMethod | null>((params.payout as PayoutMethod) || store.payout);
  const [sort, setSort] = useState<SortKey>('received');

  const cmp = useAsyncData(() => fetchComparison(currency, amount, payout), [currency, amount, payout]);

  useEffect(() => {
    const best = cmp.data?.results[0];
    if (!cmp.data || !best) return;
    store.pushRecent({ currency, amount, bestService: best.service.name, bestServiceAr: best.service.name_ar, received: best.amount_received, savings: cmp.data.summary.max_savings, at: Date.now() });
    haptic.success();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmp.data]);

  const sorted = useMemo(() => {
    const list = [...(cmp.data?.results ?? [])];
    if (sort === 'speed') list.sort((a, b) => a.transfer_speed_minutes - b.transfer_speed_minutes || b.amount_received - a.amount_received);
    else if (sort === 'rating') list.sort((a, b) => b.service.rating - a.service.rating || b.amount_received - a.amount_received);
    return list;
  }, [cmp.data, sort]);

  const best = cmp.data?.results[0]?.amount_received ?? 0;

  return (
    <Screen plain>
      <TopBar
        title={t('results.title')}
        subtitle={`${formatNumber(amount, lang)} ${currency} → ${t('common.egp')} · ${cmp.data ? (lang === 'ar' ? cmp.data.corridor.send_country_ar : cmp.data.corridor.send_country) : ''}`}
        action={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconBtn onPress={() => router.back()} icon={<Pencil size={18} color={colors.text} />} label={t('corridor.changeAmount')} />
            {cmp.data ? <IconBtn onPress={() => shareText(comparisonShareText(cmp.data!), t('results.share'))} icon={<Share2 size={18} color={colors.text} />} label={t('results.share')} /> : null}
          </View>
        }
      />
      <FlatList
        data={sorted}
        keyExtractor={(r) => r.service.id}
        renderItem={({ item, index }) => <ResultCard item={item} index={index} currency={currency} bestReceived={best} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        ListHeaderComponent={
          <View>
            {cmp.data ? <SavingsBanner data={cmp.data} /> : null}
            <SortBar sort={sort} onSort={setSort} payout={payout} onPayout={(p) => (setPayout(p), store.setPayout(p))} />
            {cmp.data ? (
              <View style={styles.mid}>
                <Text variant="caption" color={colors.textSecondary}>
                  {t('results.midMarket')}
                </Text>
                <Text variant="numSmall" ltr>
                  1 {currency} = {formatNumber(cmp.data.mid_market_rate, lang, { maximumFractionDigits: 4 })} EGP
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          cmp.loading ? (
            <ResultsSkeleton />
          ) : cmp.error ? (
            <ErrorView onRetry={cmp.refresh} />
          ) : (
            <EmptyState icon={<SearchX size={36} color={colors.textSecondary} />} title={t('results.noResults')} text={t('results.noResultsHint')} actionLabel={t('results.payoutAny')} onAction={() => setPayout(null)} />
          )
        }
        ListFooterComponent={
          cmp.data ? (
            <View style={{ gap: 6 }}>
              {cmp.data.skipped.length ? (
                <Text variant="caption" color={colors.textMuted}>
                  {cmp.data.skipped.map((s) => `${lang === 'ar' ? s.service_name_ar : s.service_name}: ${s.reason === 'below_min' ? t('common.min', { amount: `${s.min_amount ?? ''} ${currency}` }) : s.reason === 'above_max' ? t('common.max', { amount: `${s.max_amount ?? ''} ${currency}` }) : '—'}`).join(' · ')}
                </Text>
              ) : null}
              <SourceNote updatedAt={cmp.data.summary.last_updated} source={cmp.data.source} />
              <Text variant="caption" color={colors.textMuted} style={{ marginTop: 12 }}>
                {t('common.disclaimer')}
              </Text>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

function IconBtn({ onPress, icon, label }: { onPress: () => void; icon: React.ReactNode; label: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={styles.iconBtn}>
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  mid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
});
