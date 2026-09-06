import { useRef, useState } from 'react';
import { Dimensions, FlatList, I18nManager, Pressable, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BellRing, PiggyBank, Scale } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';
import { haptic } from '@/lib/utils/haptics';

const { width } = Dimensions.get('window');

export default function Onboarding() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setOnboarded = useStore((s) => s.setOnboarded);
  const list = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const slides = [
    { key: '1', Icon: Scale, title: t('onboarding.screen1.title'), text: t('onboarding.screen1.description'), colors: [colors.primary, '#00E676'] as const },
    { key: '2', Icon: PiggyBank, title: t('onboarding.screen2.title'), text: t('onboarding.screen2.description'), colors: [colors.navy, '#2B4170'] as const },
    { key: '3', Icon: BellRing, title: t('onboarding.screen3.title'), text: t('onboarding.screen3.description'), colors: ['#B8860B', colors.gold] as const },
  ];

  function finish() {
    haptic.success();
    setOnboarded(true);
    router.replace('/(tabs)');
  }

  function next() {
    if (index >= slides.length - 1) return finish();
    haptic.light();
    list.current?.scrollToIndex({ index: index + 1, animated: true });
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.min(slides.length - 1, Math.max(0, i)));
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={slides[index].colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={finish} hitSlop={12} accessibilityRole="button">
          <Text variant="smallBold" color="rgba(255,255,255,0.85)">
            {t('onboarding.skip')}
          </Text>
        </Pressable>
      </View>
      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        inverted={I18nManager.isRTL}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(s) => s.key}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Animated.View entering={FadeInUp.duration(500)} style={styles.iconWrap}>
              <item.Icon size={72} color={colors.white} strokeWidth={1.6} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(120).duration(500)} style={{ gap: 12, alignItems: 'center' }}>
              <Text variant="h1" color={colors.white} center>
                {item.title}
              </Text>
              <Text variant="body" color="rgba(255,255,255,0.88)" center style={{ maxWidth: 320 }}>
                {item.text}
              </Text>
            </Animated.View>
          </View>
        )}
      />
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots} accessibilityLabel={`${index + 1}/${slides.length}`}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button title={index === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')} variant={index === slides.length - 1 ? 'gold' : 'secondary'} size="lg" fullWidth onPress={next} hapticStyle="none" style={index === slides.length - 1 ? null : { backgroundColor: 'rgba(255,255,255,0.18)' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 32 },
  iconWrap: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingHorizontal: 24, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 24, backgroundColor: colors.white, borderRadius: radius.full },
});
