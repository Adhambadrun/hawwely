import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { I18nManager } from 'react-native';
import { colors } from '@/theme';
import { Text } from '@/components/ui/Text';

export function SectionHeader({ title, subtitle, actionLabel, onAction }: { title: string; subtitle?: string; actionLabel?: string; onAction?: () => void }) {
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text variant="h3">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color={colors.textSecondary}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="link" style={styles.action}>
          <Text variant="smallBold" color={colors.primaryDark}>
            {actionLabel}
          </Text>
          <Chevron size={16} color={colors.primaryDark} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, marginTop: 24 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 4 },
});
