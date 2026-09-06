import '../global.css';
import { useCallback, useEffect, useState } from 'react';
import { AppState, I18nManager, Platform, View } from 'react-native';
import { Stack, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold } from '@expo-google-fonts/cairo';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { colors } from '@/theme';
import { Toaster } from '@/components/ui/Toast';
import { useStore } from '@/store/useStore';
import { detectDeviceLanguage, initI18n } from '@/i18n';
import { evaluateLocalAlerts } from '@/lib/api/alerts';
import { ensureNotificationChannel } from '@/lib/notifications';

export { ErrorBoundary } from '@/components/layout/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const hydrated = useStore((s) => s.hydrated);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const [i18nReady, setI18nReady] = useState(false);
  const router = useRouter();

  // Language + RTL. Arabic is the default; the layout direction follows the language.
  useEffect(() => {
    if (!hydrated) return;
    const lang = language ?? detectDeviceLanguage();
    if (!language) setLanguage(lang);
    initI18n(lang);
    const wantRTL = lang === 'ar';
    if (Platform.OS !== 'web' && I18nManager.isRTL !== wantRTL) {
      I18nManager.allowRTL(wantRTL);
      I18nManager.forceRTL(wantRTL);
      // A reload is required for the direction change to take effect; the settings
      // screen offers the restart. First launch on a fresh install is already correct
      // because Android/iOS pick RTL from the device locale.
    }
    setI18nReady(true);
  }, [hydrated, language, setLanguage]);

  // Notifications: channel + tap handling (deep link in `data.url`).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    ensureNotificationChannel().catch(() => undefined);
    const open = (res: Notifications.NotificationResponse | null) => {
      const url = res?.notification.request.content.data?.url;
      if (typeof url !== 'string' || !url) return;
      // Accept "/corridor/sar-to-egp", "hawwely://corridor/…" and "https://hawwely.com/corridor/…".
      const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^hawwely:\/\//, '/').replace(/^\/en(?=\/|$)/, '') || '/';
      router.push(path as Href);
    };
    // App launched from a notification (cold start).
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [router]);

  // Evaluate on-device alerts whenever the app comes to the foreground.
  useEffect(() => {
    if (!i18nReady) return;
    evaluateLocalAlerts().catch(() => undefined);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && evaluateLocalAlerts().catch(() => undefined));
    return () => sub.remove();
  }, [i18nReady]);

  const ready = (fontsLoaded || !!fontError) && hydrated && i18nReady;
  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayout}>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
            <Stack.Screen name="(modals)/fee-breakdown" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="(modals)/currency-picker" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="(modals)/savings-detail" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
          <Toaster />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
