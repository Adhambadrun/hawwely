import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { colors } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { timeAgo } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import type { Source } from '@/lib/api/client';

/** "Updated 5 min ago" line + demo/offline badges under rate content. */
export function SourceNote({ updatedAt, source }: { updatedAt?: string | null; source?: Source }) {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <View style={styles.row}>
      {updatedAt ? (
        <View style={styles.time}>
          <Clock size={12} color={colors.textMuted} />
          <Text variant="caption" color={colors.textMuted}>
            {t('rates.lastUpdated', { time: timeAgo(updatedAt, lang) })}
          </Text>
        </View>
      ) : null}
      {source === 'demo' ? <Badge label={t('common.demo')} tone="warning" /> : null}
      {source === 'cache' ? <Badge label={t('common.offlineShort')} tone="neutral" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  time: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
