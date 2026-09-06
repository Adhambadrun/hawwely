import { forwardRef, type ReactNode } from 'react';
import { I18nManager, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  start?: ReactNode;
  end?: ReactNode;
  numeric?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input({ label, error, hint, start, end, numeric, style, ...rest }, ref) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="smallBold" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {start}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          style={[styles.input, numeric ? styles.numeric : null, style]}
          textAlign={numeric ? 'left' : I18nManager.isRTL ? 'right' : 'left'}
          {...rest}
        />
        {end}
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.msg} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color={colors.textSecondary} style={styles.msg}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: colors.text },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, paddingHorizontal: 14 },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: fonts.cairo, fontSize: 16, color: colors.text, paddingVertical: 12 },
  numeric: { fontFamily: fonts.interSemiBold, fontSize: 20, writingDirection: 'ltr' },
  msg: { marginTop: 2 },
});
