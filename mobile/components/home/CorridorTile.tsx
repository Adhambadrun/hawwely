import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { CorridorRateRow } from '@/lib/api/client';
import { formatRate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

export function CorridorTile({ row }: { row: CorridorRateRow }) {
  const lang = useLang();
  const router = useRouter();
  return (
    <Card onPress={() => router.push(`/corridor/${row.currency.toLowerCase()}-to-egp`)} style={styles.tile}>
      <Text style={{ fontSize: 28, lineHeight: 34 }}>{row.flag}</Text>
      <Text variant="smallBold" numberOfLines={1}>
        {lang === 'ar' ? row.country_ar : row.country}
      </Text>
      <View style={styles.rateRow}>
        <Text variant="num" ltr color={colors.primaryDark}>
          {formatRate(row.mid_market_rate, lang)}
        </Text>
        <Text variant="caption" color={colors.textMuted} ltr>
          {row.currency}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { width: 132, marginEnd: 10, gap: 4 },
  rateRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
});
