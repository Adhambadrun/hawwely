import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Bell, Search, Send } from 'lucide-react-native';
import { colors, radius, shadow } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { LiveBadge } from '@/components/layout/LiveBadge';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { SourceNote } from '@/components/layout/SourceNote';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CompareForm } from '@/components/compare/CompareForm';
import { CorridorTile } from '@/components/home/CorridorTile';
import { RecentComparisons } from '@/components/home/RecentComparisons';
import { RateRow } from '@/components/rates/RateRow';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { fetchRates } from '@/lib/api/client';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

export default function HomeScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const totalSaved = useStore((s) => s.totalSaved);
  const rates = useAsyncData(fetchRates, []);
  const name = user?.email?.split('@')[0];

  return (
    <Screen padded={false} refreshing={rates.refreshing} onRefresh={rates.refresh}>
      {/* Hero */}
      <LinearGradient colors={[colors.navy, '#0F172A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroTop}>
          <View>
            <Text variant="caption" color="rgba(255,255,255,0.7)">
              {t('app.name')} · {t('app.tagline')}
            </Text>
            <Text variant="h2" color={colors.white}>
              {name ? t('home.greetingName', { name }) : t('home.greeting')}
            </Text>
          </View>
          <LiveBadge dark />
        </View>
        {totalSaved > 0 ? (
          <View style={styles.savingsPill}>
            <Text variant="captionBold" color={colors.navy}>
              {t('home.savingsTip', { amount: formatNumber(totalSaved, lang) })}
            </Text>
          </View>
        ) : null}
      </LinearGradient>

      {/* Compare card overlapping the hero */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.formCardWrap}>
        <Card style={[styles.formCard, shadow.lifted]}>
          <Text variant="h3" style={{ marginBottom: 8 }}>
            {t('home.compareTitle')}
          </Text>
          <CompareForm />
        </Card>
      </Animated.View>

      <View style={styles.content}>
        {/* Quick actions */}
        <View style={styles.quick}>
          <QuickAction icon={<Search size={20} color={colors.primaryDark} />} label={t('tabs.rates')} onPress={() => router.push('/(tabs)/rates')} />
          <QuickAction icon={<Bell size={20} color={colors.primaryDark} />} label={t('tabs.alerts')} onPress={() => router.push('/(tabs)/alerts')} />
          <QuickAction icon={<Send size={20} color={colors.primaryDark} />} label={t('tabs.services')} onPress={() => router.push('/(tabs)/services')} />
        </View>

        {/* Popular corridors */}
        <SectionHeader title={t('home.popularCorridors')} actionLabel={t('home.seeAll')} onAction={() => router.push('/(tabs)/rates')} />
        {rates.loading ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width={132} height={110} />
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingEnd: 16 }}>
            {(rates.data?.rates ?? []).slice(0, 8).map((row) => (
              <CorridorTile key={row.currency} row={row} />
            ))}
          </ScrollView>
        )}

        {/* Today's rates */}
        <SectionHeader title={t('home.todayRates')} actionLabel={t('home.seeAll')} onAction={() => router.push('/(tabs)/rates')} />
        {rates.loading ? (
          <View style={{ gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={76} />
            ))}
          </View>
        ) : (
          <>
            {(rates.data?.rates ?? []).slice(0, 4).map((row) => (
              <RateRow key={row.currency} row={row} />
            ))}
            <SourceNote updatedAt={rates.data?.updated_at} source={rates.data?.source} />
          </>
        )}

        <RecentComparisons />

        {/* How it works */}
        <SectionHeader title={t('home.howItWorks')} />
        <Card style={{ gap: 12 }}>
          {[t('home.step1'), t('home.step2'), t('home.step3')].map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text variant="captionBold" color={colors.white} ltr>
                  {i + 1}
                </Text>
              </View>
              <Text variant="body" style={{ flex: 1 }}>
                {s}
              </Text>
            </View>
          ))}
        </Card>

        <Text variant="caption" color={colors.textMuted} center style={{ marginTop: 24 }}>
          {t('common.disclaimer')}
        </Text>
      </View>
    </Screen>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.quickItem}>
      <View style={styles.quickIcon}>{icon}</View>
      <Text variant="captionBold">{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 96, gap: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  savingsPill: { alignSelf: 'flex-start', backgroundColor: colors.gold, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  formCardWrap: { paddingHorizontal: 16, marginTop: -80 },
  formCard: { padding: 16 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  quick: { flexDirection: 'row', gap: 10 },
  quickItem: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12 },
  quickIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
