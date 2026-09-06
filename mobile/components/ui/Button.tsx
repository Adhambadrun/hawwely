import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radius, shadow } from '@/theme';
import { Text } from './Text';
import { haptic } from '@/lib/utils/haptics';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  hapticStyle?: 'light' | 'medium' | 'none';
}

const bg: Record<Variant, string> = { primary: colors.primary, secondary: colors.navy, outline: 'transparent', ghost: 'transparent', danger: colors.danger, gold: colors.gold };
const fg: Record<Variant, string> = { primary: colors.white, secondary: colors.white, outline: colors.navy, ghost: colors.primaryDark, danger: colors.white, gold: colors.navy };
const heights: Record<Size, number> = { sm: 38, md: 48, lg: 56 };

export function Button({ title, variant = 'primary', size = 'md', loading, disabled, icon, iconEnd, fullWidth, style, hapticStyle = 'light', onPress, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={(e) => {
        if (hapticStyle === 'light') haptic.light();
        if (hapticStyle === 'medium') haptic.medium();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant], height: heights[size], opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
        variant === 'outline' && styles.outline,
        variant === 'primary' && !isDisabled && shadow.green,
        fullWidth && styles.full,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text variant={size === 'sm' ? 'smallBold' : 'bodyBold'} color={fg[variant]} style={styles.label}>
            {title}
          </Text>
          {iconEnd}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  outline: { borderWidth: 1.5, borderColor: colors.border },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { lineHeight: 22 },
});
