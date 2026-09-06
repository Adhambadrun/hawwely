import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';
import { Text } from '@/components/ui/Text';
import { useOnline } from '@/lib/hooks/useNetwork';

export function OfflineBanner() {
  const online = useOnline();
  const { t } = useTranslation();
  if (online) return null;
  return (
    <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={styles.bar} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <WifiOff size={16} color={colors.white} />
        <Text variant="captionBold" color={colors.white}>
          {t('common.offline')}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.navy, paddingVertical: 8, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
});
