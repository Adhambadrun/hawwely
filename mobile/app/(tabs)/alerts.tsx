import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellPlus, BellRing } from 'lucide-react-native';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { ErrorView } from '@/components/layout/ErrorView';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCard } from '@/components/alerts/AlertCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAsyncData } from '@/lib/hooks/useAsyncData';
import { deleteAlert, listAlerts } from '@/lib/api/alerts';
import { fetchRates } from '@/lib/api/client';
import { useStore, type LocalAlert } from '@/store/useStore';
import { haptic } from '@/lib/utils/haptics';

export default function AlertsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();
  const localAlerts = useStore((s) => s.localAlerts);
  const alerts = useAsyncData(() => listAlerts(user?.id ?? null), [user?.id, localAlerts.length]);
  const rates = useAsyncData(() => fetchRates(), []);
  const rateFor = (currency: string) => rates.data?.rates.find((r) => r.currency === currency)?.mid_market_rate ?? null;

  useFocusEffect(
    useCallback(() => {
      alerts.refresh().catch(() => undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]),
  );

  const items: LocalAlert[] = alerts.data ?? [];
  const active = items.filter((a) => a.is_active);

  function confirmDelete(a: LocalAlert) {
    haptic.warning();
    Alert.alert(t('alerts.delete'), t('alerts.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAlert(user?.id ?? null, a.id);
            alerts.setData(items.filter((x) => x.id !== a.id));
            toast.success(t('common.done'));
          } catch {
            toast.error(t('common.error'));
          }
        },
      },
    ]);
  }

  return (
    <Screen contentContainerStyle={{ paddingTop: insets.top + 12 }} refreshing={alerts.refreshing} onRefresh={alerts.refresh}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text variant="h1">{t('alerts.title')}</Text>
          <Text variant="small" color={colors.textSecondary}>
            {t('alerts.subtitle')}
          </Text>
        </View>
      </View>

      <Button title={t('alerts.addNew')} icon={<BellPlus size={18} color={colors.white} />} fullWidth size="lg" onPress={() => router.push('/alert/create')} style={{ marginBottom: 16 }} />

      {!user && !authLoading ? (
        <Card style={styles.loginCard} onPress={() => router.push('/(tabs)/profile')}>
          <Text variant="smallBold">{t('alerts.loginRequired')}</Text>
          <Text variant="caption" color={colors.textSecondary}>
            {t('alerts.loginHint')}
          </Text>
        </Card>
      ) : null}

      {alerts.loading && !alerts.data ? (
        <View style={{ gap: 10 }}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={96} />
          ))}
        </View>
      ) : alerts.error ? (
        <ErrorView onRetry={alerts.refresh} />
      ) : items.length === 0 ? (
        <EmptyState icon={<BellRing size={36} color={colors.primary} />} title={t('alerts.noAlerts')} text={t('alerts.noAlertsHint')} />
      ) : (
        <>
          <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 8 }}>
            {t('alerts.activeCount', { count: active.length })}
          </Text>
          {items.map((a) => (
            <AlertCard key={a.id} alert={a} currentRate={rateFor(a.currency)} onDelete={confirmDelete} />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  loginCard: { marginBottom: 16, gap: 4, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  alert: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
