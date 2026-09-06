import { create } from 'zustand';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react-native';
import { colors, radius, shadow } from '@/theme';
import { Text } from './Text';

type Variant = 'success' | 'error' | 'info' | 'warning';
interface ToastItem { id: number; title: string; description?: string; variant: Variant }
interface ToastStore { items: ToastItem[]; push: (t: Omit<ToastItem, 'id'>) => void; dismiss: (id: number) => void }

let seq = 0;
export const useToast = create<ToastStore>((set) => ({
  items: [],
  push: (t) => {
    const id = ++seq;
    set((s) => ({ items: [...s.items, { ...t, id }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), 3200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'success' }),
  error: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'error' }),
  info: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'info' }),
  warning: (title: string, description?: string) => useToast.getState().push({ title, description, variant: 'warning' }),
};

const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle } as const;
const accent: Record<Variant, string> = { success: colors.primary, error: colors.danger, info: colors.navy, warning: colors.warning };

export function Toaster() {
  const items = useToast((s) => s.items);
  const insets = useSafeAreaInsets();
  if (!items.length) return null;
  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
      {items.map((t) => {
        const Icon = icons[t.variant];
        return (
          <Animated.View key={t.id} entering={FadeInUp.springify().damping(18)} exiting={FadeOutUp} style={[styles.toast, { borderLeftColor: accent[t.variant] }]} accessibilityLiveRegion="polite" accessibilityRole="alert">
            <Icon size={20} color={accent[t.variant]} />
            <View style={{ flex: 1 }}>
              <Text variant="smallBold">{t.title}</Text>
              {t.description ? (
                <Text variant="caption" color={colors.textSecondary}>
                  {t.description}
                </Text>
              ) : null}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, gap: 8, zIndex: 999 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, padding: 12, borderRadius: radius.md, borderLeftWidth: 4, ...shadow.lifted },
});
