import type { ReactNode } from 'react';
import { I18nManager, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';
import { Text } from '@/components/ui/Text';
import { haptic } from '@/lib/utils/haptics';

/** Simple header with back/close button and optional trailing action. */
export function TopBar({ title, subtitle, close, action, transparent, light }: { title?: string; subtitle?: string; close?: boolean; action?: ReactNode; transparent?: boolean; light?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const Back = close ? X : I18nManager.isRTL ? ArrowRight : ArrowLeft;
  const fg = light ? colors.white : colors.text;
  return (
    <View style={[styles.bar, { paddingTop: (close ? 8 : insets.top) + 8 }, !transparent && styles.solid]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={close ? t('common.close') : t('common.back')}
        hitSlop={10}
        onPress={() => {
          haptic.selection();
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)');
        }}
        style={[styles.btn, light && { backgroundColor: 'rgba(255,255,255,0.15)' }]}
      >
        <Back size={20} color={fg} />
      </Pressable>
      <View style={{ flex: 1 }}>
        {title ? (
          <Text variant="h3" color={fg} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" color={light ? 'rgba(255,255,255,0.75)' : colors.textSecondary} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingBottom: 10 },
  solid: { backgroundColor: colors.background },
  btn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
});
