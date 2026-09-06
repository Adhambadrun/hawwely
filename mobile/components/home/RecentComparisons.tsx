import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { History } from 'lucide-react-native';
import { colors } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { useStore } from '@/store/useStore';
import { formatEgp, formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

export function RecentComparisons() {
  const recent = useStore((s) => s.recent);
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  if (!recent.length) return null;
  return (
    <View>
      <SectionHeader title={t('home.recentComparisons')} />
      {recent.slice(0, 3).map((r) => (
        <Card key={`${r.currency}-${r.amount}`} onPress={() => router.push({ pathname: '/compare/results', params: { currency: r.currency, amount: String(r.amount) } })} style={styles.item}>
          <View style={styles.row}>
            <History size={18} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text variant="smallBold" ltr>
                {formatNumber(r.amount, lang)} {r.currency} → EGP
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {lang === 'ar' ? r.bestServiceAr : r.bestService} · {formatEgp(r.received, lang)}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ item: { marginBottom: 8, paddingVertical: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 } });
