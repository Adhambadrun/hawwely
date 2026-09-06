import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Chip } from '@/components/ui/Chip';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';
import type { PayoutMethod } from '@/lib/shared/types';
import { PAYOUT_METHODS } from '@/lib/shared/constants';

export type SortKey = 'received' | 'speed' | 'rating';

export function SortBar({ sort, onSort, payout, onPayout }: { sort: SortKey; onSort: (s: SortKey) => void; payout: PayoutMethod | null; onPayout: (p: PayoutMethod | null) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Text variant="caption" color={colors.textSecondary} style={styles.label}>
          {t('results.sortBy')}
        </Text>
        <Chip small label={t('results.sortReceived')} selected={sort === 'received'} onPress={() => onSort('received')} />
        <Chip small label={t('results.sortSpeed')} selected={sort === 'speed'} onPress={() => onSort('speed')} />
        <Chip small label={t('results.sortRating')} selected={sort === 'rating'} onPress={() => onSort('rating')} />
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Text variant="caption" color={colors.textSecondary} style={styles.label}>
          {t('results.payoutFilter')}
        </Text>
        <Chip small label={t('results.payoutAny')} selected={payout === null} onPress={() => onPayout(null)} />
        {PAYOUT_METHODS.map((p) => (
          <Chip key={p} small label={t(`payout.${p}`)} selected={payout === p} onPress={() => onPayout(p)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingEnd: 8 },
  label: { marginEnd: 2 },
});
