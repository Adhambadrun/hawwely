import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { ServiceLogo } from '@/components/ui/ServiceLogo';
import { StarRating } from '@/components/ui/StarRating';
import type { Service } from '@/lib/shared/types';
import { formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';

export function ServiceCard({ service }: { service: Service }) {
  const lang = useLang();
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Card onPress={() => router.push(`/service/${service.slug}`)} style={styles.card}>
      <View style={styles.row}>
        <ServiceLogo name={service.name} color={service.brand_color} size={48} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.nameRow}>
            <Text variant="bodyBold">{lang === 'ar' ? service.name_ar : service.name}</Text>
            {service.is_featured ? <Badge label={t('services.featured')} tone="gold" /> : null}
          </View>
          <View style={styles.rating}>
            <StarRating value={service.rating} size={12} />
            <Text variant="caption" color={colors.textSecondary} ltr>
              {service.rating.toFixed(1)} · {t('services.reviews', { count: service.total_reviews })}
            </Text>
          </View>
          <Text variant="caption" color={colors.textSecondary} numberOfLines={2}>
            {lang === 'ar' ? service.description_ar : service.description}
          </Text>
        </View>
      </View>
      <View style={styles.tags}>
        {service.payout_methods.slice(0, 4).map((p) => (
          <Badge key={p} label={t(`payout.${p}`)} tone="neutral" />
        ))}
        <Badge label={`${formatNumber(service.supported_corridors.length, lang)} ${lang === 'ar' ? 'دول' : 'countries'}`} tone="navy" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
