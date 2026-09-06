import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { LiveBadge } from '@/components/layout/LiveBadge';
import { Text } from '@/components/ui/Text';
import { CompareForm } from '@/components/compare/CompareForm';
import { RecentComparisons } from '@/components/home/RecentComparisons';
import { isSendCurrency } from '@/lib/shared/constants';
import { useStore } from '@/store/useStore';

/**
 * Stand-alone comparison form.
 * The home tab embeds the same form; this route exists so `hawwely://compare?currency=SAR&amount=1000`
 * (and the web `/compare` URL) always land somewhere meaningful.
 */
export default function CompareScreen() {
  const { t } = useTranslation();
  const { currency, amount } = useLocalSearchParams<{ currency?: string; amount?: string }>();
  const { setCurrency, setAmount } = useStore();

  useEffect(() => {
    if (currency && isSendCurrency(currency.toUpperCase())) setCurrency(currency.toUpperCase() as never);
    const n = Number(amount);
    if (amount && Number.isFinite(n) && n > 0) setAmount(n);
  }, [currency, amount, setCurrency, setAmount]);

  return (
    <Screen padded={false}>
      <TopBar title={t('compare.title')} action={<LiveBadge />} />
      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        <Text variant="small" color={colors.textSecondary}>
          {t('compare.subtitle')}
        </Text>
        <CompareForm />
        <RecentComparisons />
      </View>
    </Screen>
  );
}
