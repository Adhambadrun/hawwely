import { useState } from 'react';
import { Alert, I18nManager, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as WebBrowser from 'expo-web-browser';
import { ChevronLeft, ChevronRight, LogOut, Mail, MessageSquareText, Newspaper, Settings, Share2, Star, Flag as FlagIcon, ShieldCheck, FileText, HelpCircle, Info, Trophy, PiggyBank } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStore } from '@/store/useStore';
import { APP_URL, CONTACT_EMAIL } from '@/lib/shared/constants';
import { formatNumber } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { appShareText, shareText } from '@/lib/utils/share';
import { haptic } from '@/lib/utils/haptics';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, configured, signInWithEmail, signOut } = useAuth();
  const { totalSaved, reputation } = useStore();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight;
  const webBase = `${APP_URL}${lang === 'en' ? '/en' : ''}`;

  async function sendLink() {
    if (!EMAIL_RE.test(email.trim())) return setError(t('common.emailInvalid'));
    setError(null);
    if (!configured) return toast.info(t('auth.demoNotice'));
    setSending(true);
    const res = await signInWithEmail(email.trim());
    setSending(false);
    if (res.ok) {
      haptic.success();
      setSent(true);
    } else toast.error(t('auth.error'));
  }

  function confirmLogout() {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => signOut().then(() => toast.success(t('auth.loggedOut'))) },
    ]);
  }

  const openWeb = (path: string) => WebBrowser.openBrowserAsync(`${webBase}${path}`, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET }).catch(() => Linking.openURL(`${webBase}${path}`));

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 12 }}>
      <Text variant="h1" style={{ marginBottom: 12 }}>
        {t('profile.title')}
      </Text>

      {/* Account card */}
      <Card style={{ gap: 12 }}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text variant="h3" color={colors.white}>
              {(user?.email ?? '؟').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyBold" ltr={!!user}>
              {user?.email ?? t('profile.guest')}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              {user ? t('profile.loggedIn') : t('profile.guestHint')}
            </Text>
          </View>
          {user ? <Badge label={t('alerts.active')} tone="primary" /> : null}
        </View>
        {!user ? (
          sent ? (
            <View style={styles.sentBox}>
              <Mail size={18} color={colors.primaryDark} />
              <Text variant="small" color={colors.primaryDark} style={{ flex: 1 }}>
                {t('auth.checkEmail')}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <Input label={t('auth.email')} value={email} onChangeText={(v) => (setEmail(v), setError(null))} placeholder={t('auth.emailPlaceholder')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={error ?? undefined} style={{ writingDirection: 'ltr', textAlign: 'left' }} />
              <Button title={sending ? t('auth.sending') : t('auth.sendLink')} loading={sending} fullWidth onPress={sendLink} />
              {!configured ? (
                <Text variant="caption" color={colors.textMuted}>
                  {t('auth.demoNotice')}
                </Text>
              ) : null}
            </View>
          )
        ) : (
          <Button title={t('profile.logout')} variant="outline" icon={<LogOut size={16} color={colors.navy} />} onPress={confirmLogout} />
        )}
      </Card>

      {/* Stats */}
      <View style={styles.stats}>
        <Card style={styles.stat}>
          <PiggyBank size={20} color={colors.primary} />
          <Text variant="numLarge" ltr>
            {formatNumber(totalSaved, lang)}
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            {t('profile.totalSaved')} ({t('common.egp')})
          </Text>
        </Card>
        <Card style={styles.stat}>
          <Trophy size={20} color={colors.gold} />
          <Text variant="numLarge" ltr>
            {formatNumber(reputation, lang)}
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            {t('profile.reputation')}
          </Text>
        </Card>
      </View>

      {/* Contribute */}
      <Group>
        <Row icon={<Star size={18} color={colors.gold} />} label={t('profile.writeReview')} onPress={() => router.push('/review')} Chevron={Chevron} />
        <Row icon={<FlagIcon size={18} color={colors.danger} />} label={t('profile.reportRate')} onPress={() => router.push('/report')} Chevron={Chevron} />
        <Row icon={<Newspaper size={18} color={colors.navy} />} label={t('profile.blog')} onPress={() => router.push('/blog')} Chevron={Chevron} last />
      </Group>

      {/* App */}
      <Group>
        <Row icon={<Settings size={18} color={colors.textSecondary} />} label={t('profile.settings')} onPress={() => router.push('/settings' as Href)} Chevron={Chevron} />
        <Row icon={<Share2 size={18} color={colors.primary} />} label={t('profile.shareApp')} onPress={() => shareText(appShareText(), t('app.name'))} Chevron={Chevron} />
        <Row icon={<MessageSquareText size={18} color={colors.whatsapp} />} label={t('profile.contact')} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} Chevron={Chevron} />
        <Row icon={<HelpCircle size={18} color={colors.navy} />} label={t('profile.help')} onPress={() => openWeb('/faq')} Chevron={Chevron} last />
      </Group>

      {/* Legal */}
      <Group>
        <Row icon={<Info size={18} color={colors.textSecondary} />} label={t('profile.about')} onPress={() => openWeb('/about')} Chevron={Chevron} />
        <Row icon={<ShieldCheck size={18} color={colors.textSecondary} />} label={t('profile.privacy')} onPress={() => openWeb('/privacy')} Chevron={Chevron} />
        <Row icon={<FileText size={18} color={colors.textSecondary} />} label={t('profile.terms')} onPress={() => openWeb('/terms')} Chevron={Chevron} last />
      </Group>

      <Text variant="caption" color={colors.textMuted} center style={{ marginTop: 16 }} ltr>
        {t('profile.version', { version: Application.nativeApplicationVersion ?? '1.0.0' })}
      </Text>
    </Screen>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <Card padded={false} style={{ marginTop: 16 }}>{children}</Card>;
}

function Row({ icon, label, onPress, Chevron, last }: { icon: React.ReactNode; label: string; onPress: () => void; Chevron: typeof ChevronRight; last?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      style={({ pressed }) => [styles.item, !last && styles.itemBorder, pressed && { backgroundColor: colors.background }]}
    >
      <View style={styles.itemIcon}>{icon}</View>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Chevron size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  sentBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.primaryLight, padding: 12, borderRadius: radius.md },
  stats: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
});
