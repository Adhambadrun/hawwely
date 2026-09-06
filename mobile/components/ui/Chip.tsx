import { Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';
import { Text } from './Text';
import { haptic } from '@/lib/utils/haptics';

export function Chip({ label, selected, onPress, small }: { label: string; selected?: boolean; onPress?: () => void; small?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        haptic.selection();
        onPress?.();
      }}
      style={({ pressed }) => [styles.chip, small && styles.small, selected ? styles.selected : null, pressed && { opacity: 0.8 }]}
    >
      <Text variant={small ? 'captionBold' : 'smallBold'} color={selected ? colors.white : colors.navy} style={{ lineHeight: small ? 16 : 20 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border },
  small: { paddingHorizontal: 10, paddingVertical: 5 },
  selected: { backgroundColor: colors.navy, borderColor: colors.navy },
});
