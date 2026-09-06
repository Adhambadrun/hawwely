import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PiggyBank } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Counter } from '@/components/ui/Counter';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatEgp, formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

interface Payload { amount: number; currency: string; best: string; worst: string; savings: number; bestReceived: number; worstReceived: number; midReceived: number }

export default function SavingsDetailModal() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [perMonth, setPerMonth] = useState(1);
  const p = useMemo(() => {
    try {
      return data ? (JSON.parse(data) as Payload) : null;
    } catch {
      return null;
    }
  }, [data]);

  if (!p) {
    return (
      <Screen plain>
        <TopBar close />
        <EmptyState title={t('common.error')} actionLabel={t('common.close')} onAction={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen padded={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <TopBar close title={t('savings.title')} />
      <View style={styles.content}>
        <LinearGradient colors={[colors.primary, '#00E676']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <PiggyBank size={40} color={colors.white} />
          <Text variant="small" color="rgba(255,255,255,0.9)">
            {t('savings.perTransfer')} · {formatNumber(p.amount, lang)} {p.currency}
          </Text>
          <Counter value={p.savings * perMonth} color={colors.white} suffix={` ${t('common.egp')}`} />
          <Text variant="caption" color="rgba(255,255,255,0.85)" center>
            {t('results.saveHint', { amount: formatNumber(p.savings, lang, { maximumFractionDigits: 0 }), best: p.best, worst: p.worst })}
          </Text>
        </LinearGradient>

        <Card style={{ marginTop: 12, gap: 10 }}>
          <Text variant="smallBold">{t('savings.monthlyTransfers')}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[1, 2, 4].map((n) => (
              <Chip key={n} label={formatNumber(n, lang)} selected={perMonth === n} onPress={() => setPerMonth(n)} />
            ))}
          </View>
          <View style={styles.grid}>
            <Stat label={t('savings.perTransfer')} value={formatEgp(p.savings, lang)} />
            <Stat label={t('savings.perMonth')} value={formatEgp(p.savings * perMonth, lang)} />
            <Stat label={t('savings.perYear')} value={formatEgp(p.savings * perMonth * 12, lang)} highlight />
          </View>
        </Card>

        <Card style={{ marginTop: 12, gap: 8 }}>
          <Row label={p.best} value={formatEgp(p.bestReceived, lang)} color={colors.primaryDark} />
          <Row label={p.worst} value={formatEgp(p.worstReceived, lang)} color={colors.danger} />
          <Row label={t('results.midMarket')} value={formatEgp(p.midReceived, lang)} color={colors.textSecondary} />
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
            {t('savings.explain')}
          </Text>
        </Card>

        <Button title={t('savings.cta')} size="lg" fullWidth onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    </Screen>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.stat, highlight && { backgroundColor: colors.primaryLight }]}>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
      <Text variant="num" color={highlight ? colors.primaryDark : colors.text} ltr>
        {value}
      </Text>
    </View>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant="small">{label}</Text>
      <Text variant="num" color={color} ltr>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  hero: { borderRadius: radius.lg, padding: 20, alignItems: 'center', gap: 6 },
  grid: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.background, borderRadius: radius.md, padding: 10, gap: 2, alignItems: 'center' },
});
