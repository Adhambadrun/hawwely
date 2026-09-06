import { I18nManager as RNI18n, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Text } from '@/components/ui/Text';
import type { ComparisonResponse } from '@/lib/shared/types';
import { formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { haptic } from '@/lib/utils/haptics';

/** Green gradient card on top of results: "save X EGP by choosing A instead of B". */
export function SavingsBanner({ data }: { data: ComparisonResponse }) {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const best = data.results[0];
  const worst = data.results[data.results.length - 1];
  if (!best || !worst || data.summary.max_savings <= 0) return null;
  const Chevron = RNI18n.isRTL ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptic.light();
        router.push({ pathname: '/(modals)/savings-detail', params: { data: JSON.stringify({ amount: data.query.amount, currency: data.query.from, best: lang === 'ar' ? best.service.name_ar : best.service.name, worst: lang === 'ar' ? worst.service.name_ar : worst.service.name, savings: data.summary.max_savings, bestReceived: best.amount_received, worstReceived: worst.amount_received, midReceived: best.mid_market_received }) } });
      }}
    >
      <LinearGradient colors={[colors.primary, '#00E676']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <View style={styles.icon}>
          <PiggyBank size={26} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="captionBold" color="rgba(255,255,255,0.85)">
            {t('results.compareCount', { count: data.summary.services_compared })}
          </Text>
          <Text variant="smallBold" color={colors.white}>
            {t('results.saveHint', { amount: formatNumber(data.summary.max_savings, lang, { maximumFractionDigits: 0 }), best: lang === 'ar' ? best.service.name_ar : best.service.name, worst: lang === 'ar' ? worst.service.name_ar : worst.service.name })}
          </Text>
        </View>
        <Chevron size={20} color={colors.white} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.lg, padding: 14, marginBottom: 14 },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
});
