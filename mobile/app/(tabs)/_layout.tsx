import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, Home, LineChart, Building2, UserRound } from 'lucide-react-native';
import { colors, fonts } from '@/theme';
import { haptic } from '@/lib/utils/haptics';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.cairoSemiBold, fontSize: 11, marginTop: -2 },
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border, height: Platform.OS === 'ios' ? 84 : 64, paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 26 : 8 },
        tabBarHideOnKeyboard: true,
      }}
      screenListeners={{ tabPress: () => haptic.selection() }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="rates" options={{ title: t('tabs.rates'), tabBarIcon: ({ color, size }) => <LineChart color={color} size={size} /> }} />
      <Tabs.Screen name="alerts" options={{ title: t('tabs.alerts'), tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }} />
      <Tabs.Screen name="services" options={{ title: t('tabs.services'), tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
    </Tabs>
  );
}
