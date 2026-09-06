import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { colors } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Flag } from '@/components/ui/Flag';
import type { CorridorRateRow } from '@/lib/api/client';
import { formatPercent, formatRate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { useTranslation } from 'react-i18next';

export const RateRow = memo(function RateRow({ row }: { row: CorridorRateRow }) {
  const lang = useLang();
  const router = useRouter();
  const { t } = useTranslation();
  const up = row.change_24h_percent >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <Card onPress={() => router.push(`/corridor/${row.currency.toLowerCase()}-to-egp`)} style={styles.card} accessibilityLabel={`${row.currency} ${formatRate(row.mid_market_rate, lang)}`}>
      <View style={styles.row}>
        <Flag emoji={row.flag} size={28} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold">{lang === 'ar' ? row.country_ar : row.country}</Text>
          <Text variant="caption" color={colors.textSecondary} ltr>
            {t('rates.perUnit', { currency: row.currency })}
          </Text>
        </View>
        <View style={styles.right}>
          <Text variant="numLarge" ltr>
            {formatRate(row.mid_market_rate, lang)}
          </Text>
          <View style={styles.trend}>
            <Trend size={12} color={up ? colors.success : colors.danger} />
            <Text variant="captionBold" color={up ? colors.success : colors.danger} ltr>
              {formatPercent(row.change_24h_percent, lang, 2, true)}
            </Text>
          </View>
        </View>
      </View>
      {row.best_service_name ? (
        <Text variant="caption" color={colors.textMuted} style={{ marginTop: 6 }}>
          {t('rates.bestService')}: {lang === 'ar' ? row.best_service_name_ar : row.best_service_name} · {formatRate(row.best_rate, lang)}
        </Text>
      ) : null}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  right: { alignItems: 'flex-end' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
