import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Share2, TrendingDown, TrendingUp, Lightbulb } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { SourceNote } from '@/components/layout/SourceNote';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { RateChart } from '@/components/rates/RateChart';
import { RangeTabs, type Range } from '@/components/rates/RangeTabs';
import { CompareForm } from '@/components/compare/CompareForm';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { fetchComparison, fetchHistory, getCorridorByCurrency, getFaqs } from '@/lib/api/client';
import { corridorSlugToCode } from '@/lib/shared/constants';
import { formatEgp, formatPercent, formatRate } from '@/lib/shared/formatters';
import { useStore } from '@/store/useStore';
import { useLang } from '@/lib/hooks/useLang';
import { rateShareText, shareText } from '@/lib/utils/share';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CorridorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const code = corridorSlugToCode(id ?? '') ?? (id ?? '').toUpperCase();
  const currency = code.split('-')[0];
  const corridor = getCorridorByCurrency(currency);
  const { amount, setCurrency } = useStore();
  const [range, setRange] = useState<Range>(7);

  const cmp = useAsyncData(() => (corridor ? fetchComparison(corridor.send_currency, amount) : Promise.reject(new Error('not found'))), [corridor?.id, amount]);
  const hist = useAsyncData(() => (corridor ? fetchHistory(corridor.send_currency, range) : Promise.reject(new Error('not found'))), [corridor?.id, range]);

  if (!corridor) {
    return (
      <Screen plain>
        <TopBar />
        <EmptyState title={t('common.emptyTitle')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const country = lang === 'ar' ? corridor.send_country_ar : corridor.send_country;
  const best = cmp.data?.results[0];
  const change = hist.data?.change;
  const up = (change?.percent ?? 0) >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  const faqs = getFaqs({ corridorId: corridor.id }).filter((f) => f.corridor_id === corridor.id || f.category === 'rates').slice(0, 4);

  return (
    <Screen padded={false} refreshing={cmp.refreshing || hist.refreshing} onRefresh={() => Promise.all([cmp.refresh(), hist.refresh()])}>
      <LinearGradient colors={[colors.navy, '#0F172A']} style={{ paddingBottom: 24 }}>
        <TopBar
          transparent
          light
          title={`${corridor.flag_emoji} ${t('corridor.title', { country })}`}
          subtitle={`${corridor.send_currency} → EGP`}
          action={
            best ? (
              <Button
                title=""
                variant="ghost"
                size="sm"
                icon={<Share2 size={18} color={colors.white} />}
                onPress={() => shareText(rateShareText(corridor.send_currency, cmp.data!.mid_market_rate, lang === 'ar' ? best.service.name_ar : best.service.name), t('common.share'))}
                style={{ paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.15)' }}
                accessibilityLabel={t('common.share')}
              />
            ) : null
          }
        />
        <View style={{ paddingHorizontal: 16, gap: 4 }}>
          <Text variant="caption" color="rgba(255,255,255,0.7)">
            {t('rates.midMarket')} · {t('rates.perUnit', { currency: corridor.send_currency })}
          </Text>
          {cmp.loading ? (
            <Skeleton width={160} height={40} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <Text variant="numHero" color={colors.white} ltr>
                {formatRate(cmp.data?.mid_market_rate ?? 0, lang)}
              </Text>
              {change ? (
                <View style={[styles.trend, { backgroundColor: up ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                  <Trend size={14} color={up ? '#6EE7B7' : '#FCA5A5'} />
                  <Text variant="captionBold" color={up ? '#6EE7B7' : '#FCA5A5'} ltr>
                    {formatPercent(change.percent, lang, 2, true)}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Best rate today */}
        <Card style={[styles.bestCard, { marginTop: -16 }]}>
          <Text variant="captionBold" color={colors.textSecondary}>
            {t('corridor.bestRate')} · {formatRate(amount, lang, 0)} {corridor.send_currency}
          </Text>
          {cmp.loading ? (
            <Skeleton height={56} />
          ) : best ? (
            <View style={styles.bestRow}>
              <ServiceLogo name={best.service.name} color={best.service.brand_color} size={44} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold">{lang === 'ar' ? best.service.name_ar : best.service.name}</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {t('results.rate')} {formatRate(best.exchange_rate, lang)} · {t(`speed.${best.transfer_speed}`)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="numLarge" color={colors.primaryDark} ltr>
                  {formatEgp(best.amount_received, lang)}
                </Text>
                <Badge label={t('results.cheapest')} tone="gold" />
              </View>
            </View>
          ) : (
            <Text variant="small" color={colors.textSecondary}>
              {t('results.noResults')}
            </Text>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title={t('rates.compareNow')}
              fullWidth
              style={{ flex: 1 }}
              onPress={() => {
                setCurrency(corridor.send_currency);
                router.push({ pathname: '/compare/results', params: { currency: corridor.send_currency, amount: String(amount) } });
              }}
            />
            <Button title="" variant="outline" icon={<Bell size={18} color={colors.navy} />} onPress={() => router.push({ pathname: '/alert/create', params: { currency: corridor.send_currency } })} accessibilityLabel={t('rates.setAlert')} style={{ paddingHorizontal: 14 }} />
          </View>
          <SourceNote updatedAt={cmp.data?.summary.last_updated} source={cmp.data?.source} />
        </Card>

        {/* History */}
        <SectionHeader title={t('rates.history')} subtitle={t('rates.chartTitle', { currency: corridor.send_currency })} />
        <Card style={{ gap: 12 }}>
          <RangeTabs value={range} onChange={setRange} />
          {hist.loading ? <Skeleton height={180} /> : <RateChart points={hist.data?.points ?? []} />}
          {hist.data?.stats ? (
            <View style={styles.stats}>
              <Stat label={t('rates.high')} value={formatRate(hist.data.stats.high, lang)} color={colors.success} />
              <Stat label={t('rates.average')} value={formatRate(hist.data.stats.average, lang)} />
              <Stat label={t('rates.low')} value={formatRate(hist.data.stats.low, lang)} color={colors.danger} />
            </View>
          ) : null}
        </Card>

        {/* Services in this corridor */}
        <SectionHeader title={t('corridor.services')} subtitle={cmp.data ? t('corridor.servicesCount', { count: cmp.data.summary.services_compared }) : undefined} />
        {cmp.loading ? (
          <Skeleton height={200} />
        ) : (
          <Card padded={false}>
            {(cmp.data?.results ?? []).map((r, i, arr) => (
              <View key={r.service.id} style={[styles.svcRow, i < arr.length - 1 && styles.svcBorder]}>
                <Text variant="captionBold" color={colors.textMuted} style={{ width: 22 }} ltr>
                  #{r.rank}
                </Text>
                <ServiceLogo name={r.service.name} color={r.service.brand_color} size={36} />
                <View style={{ flex: 1 }}>
                  <Text variant="smallBold">{lang === 'ar' ? r.service.name_ar : r.service.name}</Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {formatRate(r.exchange_rate, lang)} · {t(`speed.${r.transfer_speed}`)}
                  </Text>
                </View>
                <Text variant="num" ltr color={i === 0 ? colors.primaryDark : colors.text}>
                  {formatEgp(r.amount_received, lang)}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Change amount */}
        <SectionHeader title={t('corridor.changeAmount')} />
        <Card>
          <CompareForm compact />
        </Card>

        {/* Tips */}
        <SectionHeader title={t('corridor.tips', { country })} />
        <Card style={{ gap: 10 }}>
          {[t('corridor.tip1'), t('corridor.tip2'), t('corridor.tip3')].map((tip, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Lightbulb size={18} color={colors.gold} />
              <Text variant="small" style={{ flex: 1 }}>
                {tip}
              </Text>
            </View>
          ))}
        </Card>

        {/* FAQ */}
        {faqs.length ? (
          <>
            <SectionHeader title={t('corridor.faq')} />
            {faqs.map((f) => (
              <Card key={f.id} style={{ marginBottom: 10, gap: 6 }}>
                <Text variant="bodyBold">{lang === 'ar' ? f.question_ar : f.question}</Text>
                <Text variant="small" color={colors.textSecondary}>
                  {lang === 'ar' ? f.answer_ar : f.answer}
                </Text>
              </Card>
            ))}
          </>
        ) : null}
        <View style={{ height: insets.bottom }} />
      </View>
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="numSmall" color={color ?? colors.text} ltr>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  trend: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, marginBottom: 8 },
  content: { paddingHorizontal: 16 },
  bestCard: { gap: 12 },
  bestRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stats: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.md, padding: 10 },
  svcRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  svcBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
});
