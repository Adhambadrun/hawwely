import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius } from '@/theme';
import { Text } from '@/components/ui/Text';
import { haptic } from '@/lib/utils/haptics';

export type Range = 7 | 30 | 90;

export function RangeTabs({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  const { t } = useTranslation();
  const items: { v: Range; label: string }[] = [
    { v: 7, label: t('rates.days7') },
    { v: 30, label: t('rates.days30') },
    { v: 90, label: t('rates.days90') },
  ];
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {items.map((it) => {
        const active = it.v === value;
        return (
          <Pressable
            key={it.v}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              haptic.selection();
              onChange(it.v);
            }}
            style={[styles.tab, active && styles.active]}
          >
            <Text variant="captionBold" color={active ? colors.white : colors.textSecondary}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: radius.full, padding: 3 },
  tab: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: radius.full },
  active: { backgroundColor: colors.navy },
});
