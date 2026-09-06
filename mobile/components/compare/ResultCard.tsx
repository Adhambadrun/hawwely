import { memo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Zap, Info, ExternalLink, Clock } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { StarRating } from '@/components/ui/StarRating';
import type { ComparisonResultItem } from '@/lib/shared/types';
import { formatEgp, formatMoney, formatNumber, formatRate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { trackClick } from '@/lib/api/client';
import { useStore } from '@/store/useStore';
import { haptic } from '@/lib/utils/haptics';
import { toast } from '@/components/ui/Toast';

const RANK_COLORS: Record<number, string> = { 1: colors.gold, 2: colors.silver, 3: colors.bronze };

export const ResultCard = memo(function ResultCard({ item, index, currency, bestReceived }: { item: ComparisonResultItem; index: number; currency: string; bestReceived: number }) {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const sessionId = useStore((s) => s.sessionId);
  const addSavings = useStore((s) => s.addSavings);
  const [opening, setOpening] = useState(false);
  const name = lang === 'ar' ? item.service.name_ar : item.service.name;
  const diff = bestReceived - item.amount_received;

  async function send() {
    haptic.medium();
    setOpening(true);
    let url = item.affiliate_url;
    try {
      const res = await trackClick({ service_id: item.service.id, corridor_id: item.corridor_id, amount: item.amount_sent, session_id: sessionId });
      if (res.url) url = res.url;
    } catch {
      /* tracking is best-effort */
    }
    setOpening(false);
    if (item.is_cheapest) addSavings(item.savings_vs_worst);
    if (url) {
      const ok = await Linking.canOpenURL(url).catch(() => true);
      if (ok) return Linking.openURL(url);
    }
    toast.error(t('common.error'), t('common.errorText'));
  }

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 70).springify().damping(18)}>
      <Card padded={false} highlighted={item.is_cheapest} style={styles.card}>
        {item.rank <= 3 ? <View style={[styles.rankStripe, { backgroundColor: RANK_COLORS[item.rank] }]} /> : null}
        <View style={styles.body}>
          <View style={styles.head}>
            <ServiceLogo name={item.service.name} color={item.service.brand_color} size={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.nameRow}>
                <Text variant="bodyBold" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {name}
                </Text>
                {item.is_cheapest ? <Badge label={t('results.cheapest')} tone="gold" /> : null}
                {item.is_fastest ? <Badge label={t('results.fastest')} tone="primary" icon={<Zap size={10} color={colors.primaryDark} />} /> : null}
                {item.is_best_rated && !item.is_cheapest ? <Badge label={t('results.bestRated')} tone="navy" /> : null}
              </View>
              <View style={styles.rating}>
                <StarRating value={item.service.rating} size={12} />
                <Text variant="caption" color={colors.textSecondary} ltr>
                  {item.service.rating.toFixed(1)} ({formatNumber(item.service.review_count, lang)})
                </Text>
              </View>
            </View>
            <View style={styles.rankBubble}>
              <Text variant="captionBold" color={item.rank <= 3 ? colors.navy : colors.textSecondary} ltr>
                #{item.rank}
              </Text>
            </View>
          </View>

          <View style={styles.receive}>
            <Text variant="caption" color={colors.textSecondary}>
              {t('results.familyGets')}
            </Text>
            <Text variant="numHero" color={item.is_cheapest ? colors.primaryDark : colors.text} ltr>
              {formatEgp(item.amount_received, lang)}
            </Text>
            {item.is_cheapest && item.savings_vs_worst > 0 ? (
              <Badge label={t('results.saveAmount', { amount: formatNumber(item.savings_vs_worst, lang, { maximumFractionDigits: 0 }) })} tone="success" />
            ) : diff > 0 ? (
              <Text variant="caption" color={colors.danger}>
                {t('results.vsBest', { amount: formatNumber(diff, lang, { maximumFractionDigits: 0 }) })}
              </Text>
            ) : null}
          </View>

          <View style={styles.metrics}>
            <Metric label={t('results.rate')} value={formatRate(item.exchange_rate, lang)} />
            <Metric label={t('results.fee')} value={formatMoney(item.total_fee, currency, lang, { decimals: 2, showCode: true })} />
            <Metric label={t('results.speed')} value={t(`speed.${item.transfer_speed}`)} icon={<Clock size={11} color={colors.textMuted} />} />
          </View>

          {item.promo ? (
            <View style={styles.promo}>
              <Text variant="caption" color="#92400E">
                🎁 {lang === 'ar' ? item.promo.text_ar : item.promo.text}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                haptic.selection();
                router.push({ pathname: '/(modals)/fee-breakdown', params: { data: JSON.stringify({ item, currency }) } });
              }}
              style={styles.details}
              hitSlop={6}
            >
              <Info size={16} color={colors.navy} />
              <Text variant="smallBold" color={colors.navy}>
                {t('results.feeDetails')}
              </Text>
            </Pressable>
            <Button title={t('results.sendNow')} size="sm" loading={opening} onPress={send} hapticStyle="none" iconEnd={<ExternalLink size={14} color={colors.white} />} />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
});

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.metric}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        {icon}
        <Text variant="caption" color={colors.textMuted}>
          {label}
        </Text>
      </View>
      <Text variant="numSmall" ltr>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, overflow: 'hidden' },
  rankStripe: { height: 4 },
  body: { padding: 14, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankBubble: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  receive: { alignItems: 'center', gap: 4, paddingVertical: 4 },
  metrics: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.md, padding: 10 },
  metric: { flex: 1, alignItems: 'center', gap: 2 },
  promo: { backgroundColor: '#FEF3C7', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  details: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
