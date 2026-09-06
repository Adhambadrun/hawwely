import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { LiveBadge } from '@/components/layout/LiveBadge';
import { SourceNote } from '@/components/layout/SourceNote';
import { ErrorView } from '@/components/layout/ErrorView';
import { Text } from '@/components/ui/Text';
import { Skeleton } from '@/components/ui/Skeleton';
import { RateRow } from '@/components/rates/RateRow';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { fetchRates } from '@/lib/api/client';

export default function RatesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const rates = useAsyncData(fetchRates, []);

  return (
    <Screen plain>
      <FlatList
        data={rates.data?.rates ?? []}
        keyExtractor={(r) => r.currency}
        renderItem={({ item }) => <RateRow row={item} />}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }]}
        refreshControl={<RefreshControl refreshing={rates.refreshing} onRefresh={rates.refresh} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="h1">{t('rates.title')}</Text>
              <LiveBadge />
            </View>
            <Text variant="small" color={colors.textSecondary}>
              {t('rates.subtitle')}
            </Text>
            {rates.data ? <SourceNote updatedAt={rates.data.updated_at} source={rates.data.source} /> : null}
          </View>
        }
        ListEmptyComponent={
          rates.loading ? (
            <View style={{ gap: 10 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={84} />
              ))}
            </View>
          ) : rates.error ? (
            <ErrorView onRetry={rates.refresh} />
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { paddingHorizontal: 16 }, header: { gap: 4, marginBottom: 16 } });
