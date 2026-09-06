import { Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radius, shadow } from '@/theme';
import { haptic } from '@/lib/utils/haptics';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  padded?: boolean;
  highlighted?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ onPress, padded = true, highlighted, style, children, ...rest }: CardProps) {
  const inner = [styles.card, padded && styles.padded, highlighted && styles.highlight, style];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          haptic.selection();
          onPress();
        }}
        style={({ pressed }) => [...inner, pressed && styles.pressed]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={inner} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  padded: { padding: 16 },
  highlight: { borderColor: colors.primary, borderWidth: 2 },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.96 },
});
