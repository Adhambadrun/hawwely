import { useEffect } from 'react';
import { StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { colors, radius } from '@/theme';

export function Skeleton({ width = '100%', height = 16, round, style }: { width?: DimensionValue; height?: number; round?: boolean; style?: StyleProp<ViewStyle> }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View accessibilityElementsHidden style={[styles.base, { width, height, borderRadius: round ? height / 2 : radius.sm }, anim, style]} />;
}

const styles = StyleSheet.create({ base: { backgroundColor: colors.border } });
