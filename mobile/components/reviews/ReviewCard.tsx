import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { colors } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { StarRating } from '@/components/ui/StarRating';
import type { Review } from '@/lib/shared/types';
import { formatDate, formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { getCorridorById } from '@/lib/api/client';

export function ReviewCard({ review }: { review: Review }) {
  const lang = useLang();
  const { t } = useTranslation();
  const corridor = review.corridor_id ? getCorridorById(review.corridor_id) : undefined;
  const title = lang === 'ar' ? review.title_ar ?? review.title : review.title ?? review.title_ar;
  const body = lang === 'ar' ? review.body_ar ?? review.body : review.body ?? review.body_ar;
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text variant="smallBold" color={colors.navy}>
            {(review.author_name ?? '؟').slice(0, 1)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text variant="smallBold">{review.author_name ?? (lang === 'ar' ? 'مستخدم' : 'User')}</Text>
            {review.is_verified ? <BadgeCheck size={14} color={colors.primary} /> : null}
          </View>
          <Text variant="caption" color={colors.textMuted}>
            {corridor ? `${corridor.flag_emoji} ${lang === 'ar' ? corridor.send_country_ar : corridor.send_country} · ` : ''}
            {formatDate(review.created_at, lang)}
          </Text>
        </View>
        <StarRating value={review.rating} size={14} />
      </View>
      {title ? <Text variant="bodyBold">{title}</Text> : null}
      {body ? (
        <Text variant="small" color={colors.textSecondary}>
          {body}
        </Text>
      ) : null}
      {review.amount_sent && review.send_currency ? (
        <Text variant="caption" color={colors.textMuted} ltr>
          {formatNumber(review.amount_sent, lang)} {review.send_currency}
          {review.amount_received ? ` → ${formatNumber(review.amount_received, lang)} EGP` : ''}
        </Text>
      ) : null}
      {review.would_recommend != null ? (
        <Text variant="caption" color={review.would_recommend ? colors.success : colors.danger}>
          {review.would_recommend ? '👍 ' : '👎 '}
          {t('review.recommend')} {review.would_recommend ? t('common.yes') : t('common.no')}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.navyLight, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
