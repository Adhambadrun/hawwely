import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Flag } from 'lucide-react-native';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Picker } from '@/components/shared/Picker';
import { toast } from '@/components/ui/Toast';
import { getCorridors, getServiceBySlug, getServices, submitReport } from '@/lib/api/client';
import { reportSchema, num, type ReportValues } from '@/lib/utils/validators';
import { useLang } from '@/lib/hooks/useLang';
import { useStore } from '@/store/useStore';
import { haptic } from '@/lib/utils/haptics';

export default function ReportScreen() {
  const { service: serviceSlug, currency: qCurrency } = useLocalSearchParams<{ service?: string; currency?: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const { currency, addReputation } = useStore();
  const services = useMemo(() => getServices(), []);
  const corridors = useMemo(() => getCorridors(), []);
  const preset = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
  const [done, setDone] = useState(false);
  const schema = useMemo(() => reportSchema(), []);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReportValues>({
    resolver: zodResolver(schema),
    defaultValues: { service_id: preset?.id ?? '', corridor_id: corridors.find((c) => c.send_currency === (qCurrency ?? currency))?.id ?? '', reported_rate: '', amount_sent: '', amount_received: '', fee_charged: '' },
  });

  async function onSubmit(v: ReportValues) {
    try {
      await submitReport({ service_id: v.service_id, corridor_id: v.corridor_id, reported_rate: num(v.reported_rate), amount_sent: num(v.amount_sent), amount_received: num(v.amount_received), fee_charged: v.fee_charged ? Number(v.fee_charged.replace(/,/g, '')) : undefined });
      haptic.success();
      addReputation(5);
      setDone(true);
    } catch {
      haptic.error();
      toast.error(t('common.error'), t('common.errorText'));
    }
  }

  return (
    <Screen padded={false}>
      <TopBar title={t('report.title')} subtitle={t('report.subtitle')} />
      <View style={styles.content}>
        {done ? (
          <Card>
            <EmptyState icon={<CheckCircle2 size={36} color={colors.primary} />} title={t('report.success')} text={t('report.points')} actionLabel={t('common.done')} onAction={() => router.back()} />
          </Card>
        ) : (
          <>
            <Card style={{ gap: 16 }}>
              <Controller control={control} name="service_id" render={({ field }) => <Picker label={t('report.service')} value={field.value} onChange={field.onChange} error={errors.service_id?.message} options={services.map((s) => ({ value: s.id, label: lang === 'ar' ? s.name_ar : s.name }))} />} />
              <Controller control={control} name="corridor_id" render={({ field }) => <Picker label={t('report.corridor')} value={field.value} onChange={field.onChange} error={errors.corridor_id?.message} options={corridors.map((c) => ({ value: c.id, label: `${lang === 'ar' ? c.send_country_ar : c.send_country} (${c.send_currency})`, icon: c.flag_emoji }))} />} />
              <Controller control={control} name="reported_rate" render={({ field }) => <Input label={t('report.rate')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType="decimal-pad" numeric placeholder={t('report.ratePlaceholder')} error={errors.reported_rate?.message} />} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Controller control={control} name="amount_sent" render={({ field }) => <Input label={t('report.amountSent')} value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" numeric placeholder="2,000" />} />
                </View>
                <View style={{ flex: 1 }}>
                  <Controller control={control} name="amount_received" render={({ field }) => <Input label={t('report.amountReceived')} value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" numeric placeholder="26,000" />} />
                </View>
              </View>
              <Controller control={control} name="fee_charged" render={({ field }) => <Input label={t('report.fee')} value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" numeric placeholder="15" />} />
              <Button title={isSubmitting ? t('report.submitting') : t('report.submit')} size="lg" fullWidth loading={isSubmitting} onPress={handleSubmit(onSubmit)} icon={<Flag size={18} color={colors.white} />} />
            </Card>
            <Card style={{ marginTop: 12, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="bodyBold">{t('report.why')}</Text>
                <Badge label={t('report.points')} tone="gold" />
              </View>
              <Text variant="small" color={colors.textSecondary}>
                {t('report.whyText')}
              </Text>
            </Card>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 16, paddingBottom: 40 } });
