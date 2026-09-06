import { Text as RNText, type TextProps as RNTextProps, type TextStyle, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

export type TextVariant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
  /** Force LTR rendering for numbers / codes inside RTL text. */
  ltr?: boolean;
}

/** Themed text. Defaults to Cairo body; use `num*` variants for numerals (Inter, tabular). */
export function Text({ variant = 'body', color, center, ltr, style, ...rest }: TextProps) {
  const base = typography[variant] as TextStyle;
  return <RNText {...rest} style={[base, color ? { color } : null, center ? styles.center : null, ltr ? styles.ltr : null, style]} />;
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  ltr: { writingDirection: 'ltr' },
});

export const muted = colors.textSecondary;
