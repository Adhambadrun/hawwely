import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radius } from '@/theme';
import { Text } from './Text';

type Tone = 'primary' | 'navy' | 'gold' | 'warning' | 'danger' | 'neutral' | 'success' | 'live';

const tones: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primaryLight, fg: colors.primaryDark },
  navy: { bg: colors.navyLight, fg: colors.navy },
  gold: { bg: colors.goldSoft, fg: '#8A6D00' },
  warning: { bg: '#FEF3C7', fg: '#92400E' },
  danger: { bg: '#FEE2E2', fg: '#991B1B' },
  neutral: { bg: '#F1F5F9', fg: colors.textSecondary },
  success: { bg: '#D1FAE5', fg: '#065F46' },
  live: { bg: colors.primary, fg: colors.white },
};

export function Badge({ label, tone = 'neutral', icon, style }: { label: string; tone?: Tone; icon?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]} accessibilityRole="text">
      {icon}
      <Text variant="captionBold" color={t.fg} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start' },
  label: { lineHeight: 16 },
});
