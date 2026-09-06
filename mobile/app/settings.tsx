import { Alert, I18nManager, Platform, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';
import * as Application from 'expo-application';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useStore } from '@/store/useStore';
import { initI18n, type AppLanguage } from '@/i18n';
import { cacheClear } from '@/lib/utils/storage';
import { notifyLocal, registerForPushNotifications } from '@/lib/notifications';
import { haptic } from '@/lib/utils/haptics';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, hapticsEnabled, setHaptics, offlineCacheEnabled, setOfflineCache, notifPrefs, setNotifPref, setPushToken } = useStore();

  async function changeLanguage(l: AppLanguage) {
    if (l === language) return;
    haptic.selection();
    setLanguage(l);
    initI18n(l);
    const wantRTL = l === 'ar';
    if (Platform.OS !== 'web' && I18nManager.isRTL !== wantRTL) {
      I18nManager.allowRTL(wantRTL);
      I18nManager.forceRTL(wantRTL);
      Alert.alert(t('settings.language'), t('settings.languageRestart'), [
        { text: t('settings.later'), style: 'cancel' },
        { text: t('settings.restart'), onPress: () => Updates.reloadAsync().catch(() => undefined) },
      ]);
    }
  }

  async function toggleRateAlerts(v: boolean) {
    setNotifPref('rateAlerts', v);
    if (v) {
      const { granted, token } = await registerForPushNotifications();
      if (token) setPushToken(token);
      if (!granted) toast.warning(t('alerts.permissionDenied'));
      else await notifyLocal(t('notifications.testTitle'), t('notifications.testBody'));
    }
  }

  return (
    <Screen padded={false}>
      <TopBar title={t('settings.title')} />
      <View style={styles.content}>
        <SectionHeader title={t('settings.general')} />
        <Card style={{ gap: 14 }}>
          <View style={{ gap: 8 }}>
            <Text variant="smallBold">{t('settings.language')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label={t('settings.arabic')} selected={language === 'ar'} onPress={() => changeLanguage('ar')} />
              <Chip label={t('settings.english')} selected={language === 'en'} onPress={() => changeLanguage('en')} />
            </View>
          </View>
          <Row label={t('settings.haptics')} value={hapticsEnabled} onChange={setHaptics} />
        </Card>

        <SectionHeader title={t('settings.notifications')} />
        <Card style={{ gap: 4 }}>
          <Row label={t('settings.rateAlerts')} value={notifPrefs.rateAlerts} onChange={toggleRateAlerts} />
          <Row label={t('settings.weeklyDigest')} value={notifPrefs.weeklyDigest} onChange={(v) => setNotifPref('weeklyDigest', v)} />
          <Row label={t('settings.promos')} value={notifPrefs.promos} onChange={(v) => setNotifPref('promos', v)} last />
        </Card>

        <SectionHeader title={t('settings.data')} />
        <Card style={{ gap: 12 }}>
          <Row label={t('settings.offlineCache')} value={offlineCacheEnabled} onChange={setOfflineCache} last />
          <Button
            title={t('profile.clearCache')}
            variant="outline"
            onPress={async () => {
              await cacheClear();
              haptic.success();
              toast.success(t('profile.cacheCleared'));
            }}
          />
        </Card>

        <SectionHeader title={t('settings.about')} />
        <Card style={{ gap: 4 }}>
          <Text variant="bodyBold">{t('app.name')}</Text>
          <Text variant="caption" color={colors.textSecondary} ltr>
            {t('profile.version', { version: `${Application.nativeApplicationVersion ?? '1.0.0'} (${Application.nativeBuildVersion ?? '1'})` })}
          </Text>
          <Text variant="caption" color={colors.textMuted} style={{ marginTop: 8 }}>
            {t('common.disclaimer')}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

function Row({ label, value, onChange, last }: { label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Switch value={value} onValueChange={(v) => (haptic.selection(), onChange(v))} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
});
