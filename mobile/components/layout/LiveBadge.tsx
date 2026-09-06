import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, radius } from '@/theme';
import { Text } from '@/components/ui/Text';

export function LiveBadge({ label, dark }: { label?: string; dark?: boolean }) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(withTiming(1.6, { duration: 900 }), -1, true);
  }, [scale]);
  const pulse = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 2 - scale.value }));
  return (
    <View style={[styles.badge, dark ? styles.dark : null]} accessibilityLabel={label ?? t('home.liveBadge')}>
      <View style={styles.dotWrap}>
        <Animated.View style={[styles.ring, pulse]} />
        <View style={styles.dot} />
      </View>
      <Text variant="captionBold" color={dark ? colors.white : colors.primaryDark} style={{ lineHeight: 16 }}>
        {label ?? t('home.liveBadge')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignSelf: 'flex-start' },
  dark: { backgroundColor: 'rgba(255,255,255,0.15)' },
  dotWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
});
