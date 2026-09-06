import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { OfflineBanner } from './OfflineBanner';

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
  /** Render without ScrollView (for FlatList screens). */
  plain?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  bottomInset?: boolean;
  background?: string;
}

/** Page wrapper: safe-area aware, themed background, optional pull-to-refresh, offline banner. */
export function Screen({ children, plain, refreshing, onRefresh, padded = true, bottomInset = true, background = colors.background, contentContainerStyle, ...rest }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const pad = padded ? styles.padded : null;
  if (plain) {
    return (
      <View style={[styles.root, { backgroundColor: background }]}>
        <OfflineBanner />
        {children}
      </View>
    );
  }
  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <OfflineBanner />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
        contentContainerStyle={[pad, { paddingBottom: (bottomInset ? insets.bottom : 0) + 32 }, contentContainerStyle]}
        {...rest}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  padded: { paddingHorizontal: 16, paddingTop: 12 },
});
