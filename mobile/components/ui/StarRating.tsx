import { Pressable, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/theme';
import { haptic } from '@/lib/utils/haptics';

export function StarRating({ value, size = 16, onChange, max = 5 }: { value: number; size?: number; onChange?: (v: number) => void; max?: number }) {
  return (
    <View style={styles.row} accessibilityRole={onChange ? 'adjustable' : 'text'} accessibilityLabel={`${value} / ${max}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= Math.round(value);
        const star = <Star size={size} color={filled ? colors.gold : colors.border} fill={filled ? colors.gold : 'transparent'} />;
        return onChange ? (
          <Pressable
            key={i}
            hitSlop={6}
            onPress={() => {
              haptic.selection();
              onChange(i + 1);
            }}
          >
            {star}
          </Pressable>
        ) : (
          <View key={i}>{star}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2, alignItems: 'center' } });
