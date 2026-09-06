import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useStore } from '@/store/useStore';

function enabled() {
  return Platform.OS !== 'web' && useStore.getState().hapticsEnabled;
}

export const haptic = {
  light: () => enabled() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  medium: () => enabled() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined),
  heavy: () => enabled() && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined),
  selection: () => enabled() && Haptics.selectionAsync().catch(() => undefined),
  success: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  warning: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined),
  error: () => enabled() && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined),
};
