import { Linking, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X, ExternalLink, Globe, MapPin, ShieldCheck, Calendar, Star } from 'lucide-react-native';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { fetchReviews, getCorridorById, getServiceBySlug, trackClick } from '@/lib/api/client';
import { DEMO_RATES } from '@/lib/shared/data/rates';
import { formatNumber, formatRate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { useStore } from '@/store/useStore';
import { toast } from '@/components/ui/Toast';
import { haptic } from '@/lib/utils/haptics';

export default function ServiceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const service = getServiceBySlug(slug ?? '');
  const sessionId = useStore((s) => s.sessionId);
  const reviews = useAsyncData(() => (service ? fetchReviews({ serviceId: service.id, limit: 10 }) : Promise.resolve(null)), [service?.id]);

  if (!service) {
    return (
      <Screen plain>
        <TopBar />
        <EmptyState title={t('common.emptyTitle')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }
  const name = lang === 'ar' ? service.name_ar : service.name;
  const rates = DEMO_RATES.filter((r) => r.service_id === service.id);
  const pros = (lang === 'ar' ? service.pros_ar : service.pros) ?? [];
  const cons = (lang === 'ar' ? service.cons_ar : service.cons) ?? [];

  async function openSite() {
    haptic.medium();
    let url = service!.website_url;
    try {
      const res = await trackClick({ service_id: service!.id, session_id: sessionId });
      if (res.url) url = res.url;
    } catch {
      /* best-effort */
    }
    if (url) Linking.openURL(url).catch(() => toast.error(t('common.error')));
  }

  return (
    <Screen padded={false} refreshing={reviews.refreshing} onRefresh={reviews.refresh}>
      <TopBar title={name} />
      <View style={styles.content}>
        <Card style={{ gap: 14 }}>
          <View style={styles.head}>
            <ServiceLogo name={service.name} color={service.brand_color} size={64} />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text variant="h2">{name}</Text>
                {service.is_featured ? <Badge label={t('services.featured')} tone="gold" /> : null}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <StarRating value={service.rating} size={14} />
                <Text variant="small" color={colors.textSecondary} ltr>
                  {service.rating.toFixed(1)} · {t('services.reviews', { count: service.total_reviews })}
                </Text>
              </View>
            </View>
          </View>
          <Text variant="body" color={colors.textSecondary}>
            {lang === 'ar' ? service.description_ar : service.description}
          </Text>
          <Button title={t('services.sendWith', { service: name })} size="lg" fullWidth iconEnd={<ExternalLink size={16} color={colors.white} />} onPress={openSite} hapticStyle="none" />
          <Text variant="caption" color={colors.textMuted} center>
            {t('common.openInBrowser')} · {t('services.affiliateNote')}
          </Text>
        </Card>

        <View style={styles.facts}>
          <Fact icon={<Calendar size={16} color={colors.navy} />} label={t('services.founded', { year: service.founded_year ?? '—' })} />
          <Fact icon={<MapPin size={16} color={colors.navy} />} label={(lang === 'ar' ? service.headquarters_ar : service.headquarters) ?? '—'} />
        </View>
        {service.license_info ? (
          <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 10 }}>
            <ShieldCheck size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="captionBold" color={colors.textSecondary}>
                {t('services.license')}
              </Text>
              <Text variant="small">{(lang === 'ar' ? service.license_info_ar : service.license_info) ?? service.license_info}</Text>
            </View>
          </Card>
        ) : null}

        <SectionHeader title={t('services.pros')} />
        <Card style={{ gap: 8 }}>
          {pros.map((p, i) => (
            <View key={i} style={styles.li}>
              <Check size={16} color={colors.success} />
              <Text variant="small" style={{ flex: 1 }}>
                {p}
              </Text>
            </View>
          ))}
        </Card>
        <SectionHeader title={t('services.cons')} />
        <Card style={{ gap: 8 }}>
          {cons.map((c, i) => (
            <View key={i} style={styles.li}>
              <X size={16} color={colors.danger} />
              <Text variant="small" style={{ flex: 1 }}>
                {c}
              </Text>
            </View>
          ))}
        </Card>

        <SectionHeader title={t('services.payoutMethods')} />
        <View style={styles.tags}>
          {service.payout_methods.map((p) => (
            <Badge key={p} label={t(`payout.${p}`)} tone="primary" />
          ))}
        </View>
        <SectionHeader title={t('services.sendMethods')} />
        <View style={styles.tags}>
          {service.send_methods.map((p) => (
            <Badge key={p} label={t(`sendMethod.${p}`, { defaultValue: p })} tone="navy" />
          ))}
        </View>

        <SectionHeader title={t('services.currentRates')} subtitle={t('services.supportedFrom')} />
        <Card padded={false}>
          {rates.map((r, i) => {
            const corridor = getCorridorById(r.corridor_id) ?? null;
            const cur = corridor?.send_currency ?? r.fee_currency;
            return (
              <View key={r.id} style={[styles.rateRow, i < rates.length - 1 && styles.rateBorder]}>
                <Text style={{ fontSize: 22 }}>{corridor?.flag_emoji ?? '🌍'}</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="smallBold">{corridor ? (lang === 'ar' ? corridor.send_country_ar : corridor.send_country) : cur}</Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {t('results.fee')}: {formatNumber(r.fixed_fee, lang)} {r.fee_currency}
                    {r.percent_fee ? ` + ${r.percent_fee}%` : ''} · {t(`speed.${r.transfer_speed}`)}
                  </Text>
                </View>
                <Button title={t('rates.compareNow')} size="sm" variant="outline" onPress={() => router.push({ pathname: '/compare/results', params: { currency: cur } })} />
                <Text variant="num" ltr style={{ minWidth: 64, textAlign: 'right' }}>
                  {formatRate(r.exchange_rate, lang)}
                </Text>
              </View>
            );
          })}
        </Card>

        <SectionHeader title={t('services.reviewsTitle')} actionLabel={t('services.writeReview')} onAction={() => router.push({ pathname: '/review', params: { service: service.slug } })} />
        {reviews.loading ? (
          <Skeleton height={120} />
        ) : reviews.data?.reviews.length ? (
          reviews.data.reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        ) : (
          <EmptyState icon={<Star size={32} color={colors.gold} />} title={t('services.noReviews')} actionLabel={t('services.writeReview')} onAction={() => router.push({ pathname: '/review', params: { service: service.slug } })} />
        )}
        {service.website_url ? (
          <Button title={t('services.website')} variant="ghost" icon={<Globe size={16} color={colors.primaryDark} />} onPress={() => Linking.openURL(service.website_url!)} style={{ alignSelf: 'center', marginTop: 8 }} />
        ) : null}
        <View style={{ height: insets.bottom }} />
      </View>
    </Screen>
  );
}

function Fact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Card style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 }}>
      {icon}
      <Text variant="caption" style={{ flex: 1 }} numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  head: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  facts: { flexDirection: 'row', gap: 10, marginTop: 12 },
  li: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  rateBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
});
