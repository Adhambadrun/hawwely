import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing, Check, Mail, MessageCircle, Smartphone, TrendingDown, TrendingUp } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Picker } from '@/components/shared/Picker';
import { toast } from '@/components/ui/Toast';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { useAuth } from '@/lib/hooks/useAuth';
import { fetchRates, getCorridors } from '@/lib/api/client';
import { createAlert } from '@/lib/api/alerts';
import { registerForPushNotifications } from '@/lib/notifications';
import { alertSchema, type AlertValues } from '@/lib/utils/validators';
import { formatRate } from '@/lib/shared/formatters';
import { isSendCurrency } from '@/lib/shared/constants';
import { useLang } from '@/lib/hooks/useLang';
import { useStore } from '@/store/useStore';
import { haptic } from '@/lib/utils/haptics';

type Channel = 'push' | 'email' | 'whatsapp';

export default function CreateAlertScreen() {
  const { currency: qCurrency } = useLocalSearchParams<{ currency?: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const { user } = useAuth();
  const { currency: storeCurrency, setPushToken } = useStore();
  const corridors = useMemo(() => getCorridors(), []);
  const startCurrency = isSendCurrency(qCurrency) ? qCurrency : storeCurrency;
  const rates = useAsyncData(fetchRates, []);
  const schema = useMemo(() => alertSchema(), []);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AlertValues>({
    resolver: zodResolver(schema),
    defaultValues: { corridor_id: corridors.find((c) => c.send_currency === startCurrency)?.id ?? corridors[0]?.id, target_rate: '', direction: 'above', notify_via: ['push'] },
  });
  const corridorId = watch('corridor_id');
  const direction = watch('direction');
  const channels = watch('notify_via');
  const corridor = corridors.find((c) => c.id === corridorId);
  const current = rates.data?.rates.find((r) => r.corridor_id === corridorId)?.mid_market_rate ?? null;

  useEffect(() => {
    if (current && !watch('target_rate')) setValue('target_rate', formatRate(current * 1.01, 'en'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, corridorId]);

  const suggestions = current ? [1.005, 1.01, 1.02, 1.03].map((m) => current * (direction === 'above' ? m : 2 - m)) : [];

  function toggleChannel(c: Channel) {
    const next = channels.includes(c) ? channels.filter((x) => x !== c) : [...channels, c];
    setValue('notify_via', next.length ? next : ['push']);
  }

  async function onSubmit(v: AlertValues) {
    try {
      if (v.notify_via.includes('push')) {
        const { granted, token } = await registerForPushNotifications();
        if (!granted) setPermissionDenied(true);
        if (token) setPushToken(token);
      }
      if (!user && v.notify_via.some((c) => c !== 'push')) {
        toast.info(t('alerts.loginRequired'), t('alerts.loginHint'));
      }
      await createAlert(user?.id ?? null, { corridor_id: v.corridor_id, currency: corridor?.send_currency ?? 'SAR', target_rate: Number(v.target_rate.replace(/,/g, '')), direction: v.direction, notify_via: v.notify_via as Channel[] });
      haptic.success();
      toast.success(t('alerts.created'));
      router.replace('/(tabs)/alerts');
    } catch (err) {
      haptic.error();
      toast.error(t('common.error'), err instanceof Error ? err.message : undefined);
    }
  }

  return (
    <Screen padded={false}>
      <TopBar title={t('alerts.addNew')} subtitle={t('alerts.subtitle')} />
      <View style={styles.content}>
        <Card style={{ gap: 16 }}>
          <Controller control={control} name="corridor_id" render={({ field }) => <Picker label={t('alerts.corridor')} value={field.value} onChange={field.onChange} options={corridors.map((c) => ({ value: c.id, label: `${lang === 'ar' ? c.send_country_ar : c.send_country} (${c.send_currency} → EGP)`, icon: c.flag_emoji }))} />} />

          {current ? (
            <View style={styles.current}>
              <Text variant="small" color={colors.textSecondary}>
                {t('alerts.currentRate', { rate: '' })}
              </Text>
              <Text variant="numLarge" color={colors.primaryDark} ltr>
                {formatRate(current, lang)}
              </Text>
            </View>
          ) : null}

          <View style={{ gap: 8 }}>
            <Text variant="smallBold">{t('alerts.notifyWhen')}</Text>
            <View style={styles.dirRow}>
              {(['above', 'below'] as const).map((d) => {
                const active = direction === d;
                const Icon = d === 'above' ? TrendingUp : TrendingDown;
                return (
                  <Pressable key={d} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => (haptic.selection(), setValue('direction', d))} style={[styles.dir, active && styles.dirActive]}>
                    <Icon size={18} color={active ? colors.white : colors.navy} />
                    <Text variant="smallBold" color={active ? colors.white : colors.navy}>
                      {d === 'above' ? t('alerts.goesAbove') : t('alerts.goesBelow')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Controller control={control} name="target_rate" render={({ field }) => <Input label={t('alerts.targetRate')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="decimal-pad" numeric error={errors.target_rate?.message} hint={current ? t('alerts.targetHint', { rate: formatRate(current, lang) }) : undefined} end={<Text variant="captionBold" color={colors.textSecondary}>EGP</Text>} />} />
          {suggestions.length ? (
            <View style={{ gap: 6 }}>
              <Text variant="caption" color={colors.textSecondary}>
                {t('alerts.quickTargets')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {suggestions.map((s) => (
                  <Chip key={s} small label={formatRate(s, 'en')} onPress={() => setValue('target_rate', formatRate(s, 'en'))} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ gap: 8 }}>
            <Text variant="smallBold">{t('alerts.notifyVia')}</Text>
            {(
              [
                { c: 'push' as Channel, Icon: Smartphone, label: t('alerts.push') },
                { c: 'email' as Channel, Icon: Mail, label: t('alerts.email') },
                { c: 'whatsapp' as Channel, Icon: MessageCircle, label: t('alerts.whatsapp') },
              ] as const
            ).map(({ c, Icon, label }) => {
              const on = channels.includes(c);
              return (
                <Pressable key={c} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => (haptic.selection(), toggleChannel(c))} style={[styles.channel, on && styles.channelOn]}>
                  <Icon size={18} color={on ? colors.primaryDark : colors.textSecondary} />
                  <Text variant="small" style={{ flex: 1 }}>
                    {label}
                  </Text>
                  <View style={[styles.check, on && styles.checkOn]}>{on ? <Check size={14} color={colors.white} /> : null}</View>
                </Pressable>
              );
            })}
            {permissionDenied ? (
              <Text variant="caption" color={colors.danger}>
                {t('alerts.permissionDenied')}
              </Text>
            ) : null}
          </View>

          <Button title={isSubmitting ? t('alerts.creating') : t('alerts.create')} size="lg" fullWidth loading={isSubmitting} icon={<BellRing size={18} color={colors.white} />} onPress={handleSubmit(onSubmit)} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  current: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: 12 },
  dirRow: { flexDirection: 'row', gap: 8 },
  dir: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  dirActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  channel: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  channelOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
