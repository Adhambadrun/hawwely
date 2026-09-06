import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import i18n from '@/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const RATE_ALERT_CHANNEL = 'rate-alerts';

export async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(RATE_ALERT_CHANNEL, {
    name: i18n.t('notifications.channelName'),
    description: i18n.t('notifications.channelDescription'),
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#00C853',
  });
}

/** Ask for permission and return the Expo push token (null on simulator / denied / web). */
export async function registerForPushNotifications(): Promise<{ granted: boolean; token: string | null }> {
  if (Platform.OS === 'web') return { granted: false, token: null };
  await ensureNotificationChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return { granted: false, token: null };
  if (!Device.isDevice) return { granted: true, token: null };
  try {
    const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    return { granted: true, token };
  } catch (err) {
    console.warn('[hawwely] push token failed', err);
    return { granted: true, token: null };
  }
}

/** Fire a local notification immediately (used for locally-evaluated alerts and the test button). */
export async function notifyLocal(title: string, body: string, data?: Record<string, unknown>) {
  if (Platform.OS === 'web') return;
  await ensureNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
}
