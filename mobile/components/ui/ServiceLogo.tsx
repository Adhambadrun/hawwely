import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, fonts } from '@/theme';

function initials(name: string) {
  const w = name.split(/\s+/).filter(Boolean);
  return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[1][0]).toUpperCase();
}

const DARK_TEXT = new Set(['#9FE870', '#FFDD00', '#FFD700']);

/** Monogram on the provider's brand colour (matches the website placeholders). */
export function ServiceLogo({ name, color, size = 44 }: { name: string; color?: string | null; size?: number }) {
  const bg = color ?? colors.navy;
  const fg = DARK_TEXT.has(bg.toUpperCase()) ? '#0F172A' : colors.white;
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg }]} accessibilityLabel={name}>
      <Text style={{ fontFamily: fonts.interBold, fontSize: size * 0.4, color: fg, lineHeight: size * 0.5 }} ltr>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ box: { alignItems: 'center', justifyContent: 'center' } });
