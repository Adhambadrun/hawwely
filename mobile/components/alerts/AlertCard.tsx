import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react-native';
import { colors } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Flag } from '@/components/ui/Flag';
import { Button } from '@/components/ui/Button';
import { getCorridorById } from '@/lib/api/client';
import { formatDate, formatRate } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import type { LocalAlert } from '@/store/useStore';

interface Props {
  alert: LocalAlert;
  /** Current mid-market rate for the corridor, when known — shows how far the target is. */
  currentRate?: number | null;
  onDelete?: (alert: LocalAlert) => void;
  onPress?: (alert: LocalAlert) => void;
}

/** One saved rate alert: corridor, target, channel, status and distance to target. */
export function AlertCard({ alert: a, currentRate, onDelete, onPress }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
  const corridor = getCorridorById(a.corridor_id);
  const country = corridor ? (lang === 'ar' ? corridor.send_country_ar : corridor.send_country) : a.currency;
  const distance = currentRate ? ((a.target_rate - currentRate) / currentRate) * 100 : null;
  const channels = a.notify_via.map((c) => t(`alerts.${c}`)).join(' · ');

  return (
    <Card style={styles.card} onPress={onPress ? () => onPress(a) : undefined} accessibilityLabel={`${country} ${formatRate(a.target_rate, lang)}`}>
      <View style={styles.row}>
        <Flag emoji={corridor?.flag_emoji ?? '🌍'} size={26} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyBold">{country} → 🇪🇬</Text>
          <Text variant="small" color={colors.textSecondary}>
            {t('alerts.notifyWhen')} {a.direction === 'above' ? t('alerts.goesAbove') : t('alerts.goesBelow')}{' '}
            <Text variant="numSmall" ltr>
              {formatRate(a.target_rate, lang)}
            </Text>
          </Text>
          {distance !== null && a.is_active ? (
            <Text variant="caption" color={Math.abs(distance) < 1 ? colors.success : colors.textMuted} ltr>
              {t('alerts.distance', { percent: Math.abs(distance).toFixed(2), rate: formatRate(currentRate!, lang) })}
            </Text>
          ) : null}
          {a.triggered_at ? (
            <Text variant="caption" color={colors.success}>
              {t('alerts.triggeredAt', { date: formatDate(a.triggered_at, lang), rate: a.triggered_rate ? formatRate(a.triggered_rate, lang) : '—' })}
            </Text>
          ) : null}
          <Text variant="caption" color={colors.textMuted}>
            {channels ? `${channels} · ` : ''}
            {formatDate(a.created_at, lang)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          {a.is_active ? <Badge label={`🟡 ${t('alerts.waiting')}`} tone="warning" /> : <Badge label={`✅ ${t('alerts.triggered')}`} tone="success" />}
          {onDelete ? <Button title={t('alerts.delete')} variant="ghost" size="sm" icon={<Trash2 size={14} color={colors.danger} />} onPress={() => onDelete(a)} style={{ paddingHorizontal: 8 }} accessibilityLabel={t('alerts.delete')} /> : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
