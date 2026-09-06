import { useMemo, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PartyPopper } from 'lucide-react-native';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/EmptyState';
import { Picker } from '@/components/shared/Picker';
import { toast } from '@/components/ui/Toast';
import { getCorridors, getServiceBySlug, getServices, submitReview } from '@/lib/api/client';
import { reviewSchema, num, type ReviewValues } from '@/lib/utils/validators';
import { useLang } from '@/lib/hooks/useLang';
import { useStore } from '@/store/useStore';
import { haptic } from '@/lib/utils/haptics';

export default function ReviewScreen() {
  const { service: serviceSlug } = useLocalSearchParams<{ service?: string }>();
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const { currency, addReputation } = useStore();
  const services = useMemo(() => getServices(), []);
  const corridors = useMemo(() => getCorridors(), []);
  const preset = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
  const [done, setDone] = useState(false);
  const schema = useMemo(() => reviewSchema(), []);

  const { control, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<ReviewValues>({
    resolver: zodResolver(schema),
    defaultValues: { service_id: preset?.id ?? '', corridor_id: corridors.find((c) => c.send_currency === currency)?.id ?? '', rating: 0, title: '', body: '', amount_sent: '', amount_received: '', would_recommend: true, author_name: '' },
  });
  const rating = watch('rating');

  async function onSubmit(v: ReviewValues) {
    try {
      const corridor = corridors.find((c) => c.id === v.corridor_id);
      await submitReview({ service_id: v.service_id, corridor_id: v.corridor_id || undefined, rating: v.rating, title: v.title, body: v.body, amount_sent: num(v.amount_sent), amount_received: num(v.amount_received), send_currency: corridor?.send_currency, would_recommend: v.would_recommend, author_name: v.author_name || undefined });
      haptic.success();
      addReputation(10);
      setDone(true);
    } catch {
      haptic.error();
      toast.error(t('common.error'), t('common.errorText'));
    }
  }

  return (
    <Screen padded={false}>
      <TopBar title={t('review.title')} subtitle={t('review.subtitle')} />
      <View style={styles.content}>
        {done ? (
          <Card>
            <EmptyState icon={<PartyPopper size={36} color={colors.primary} />} title={t('review.success')} actionLabel={t('common.done')} onAction={() => router.back()} />
          </Card>
        ) : (
          <Card style={{ gap: 16 }}>
            <Controller control={control} name="service_id" render={({ field }) => <Picker label={t('review.service')} value={field.value} onChange={field.onChange} placeholder={t('review.selectService')} error={errors.service_id?.message} options={services.map((s) => ({ value: s.id, label: lang === 'ar' ? s.name_ar : s.name }))} />} />
            <Controller control={control} name="corridor_id" render={({ field }) => <Picker label={t('review.corridor')} value={field.value ?? ''} onChange={field.onChange} options={corridors.map((c) => ({ value: c.id, label: lang === 'ar' ? c.send_country_ar : c.send_country, icon: c.flag_emoji }))} />} />
            <View style={{ gap: 6 }}>
              <Text variant="smallBold">{t('review.rating')}</Text>
              <Controller control={control} name="rating" render={({ field }) => <StarRating value={field.value} size={36} onChange={field.onChange} />} />
              <Text variant="caption" color={rating ? colors.primaryDark : colors.textMuted}>
                {rating ? t(`review.ratingLabels.${rating}`) : ' '}
              </Text>
              {errors.rating ? (
                <Text variant="caption" color={colors.danger}>
                  {errors.rating.message}
                </Text>
              ) : null}
            </View>
            <Controller control={control} name="title" render={({ field }) => <Input label={t('review.titleField')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={t('review.titlePlaceholder')} error={errors.title?.message} maxLength={200} />} />
            <Controller control={control} name="body" render={({ field }) => <Input label={t('review.body')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={t('review.bodyPlaceholder')} error={errors.body?.message} multiline numberOfLines={5} style={{ minHeight: 120, textAlignVertical: 'top' }} maxLength={3000} />} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="amount_sent" render={({ field }) => <Input label={t('review.amountSent')} value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" numeric placeholder="2,000" />} />
              </View>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="amount_received" render={({ field }) => <Input label={t('review.amountReceived')} value={field.value} onChangeText={field.onChange} keyboardType="decimal-pad" numeric placeholder="26,000" />} />
              </View>
            </View>
            <Controller control={control} name="author_name" render={({ field }) => <Input label={`${t('review.name')}`} value={field.value} onChangeText={field.onChange} placeholder={t('review.namePlaceholder')} maxLength={100} />} />
            <Controller
              control={control}
              name="would_recommend"
              render={({ field }) => (
                <View style={styles.switchRow}>
                  <Text variant="bodyBold">{t('review.recommend')}</Text>
                  <Switch value={!!field.value} onValueChange={(v) => (haptic.selection(), field.onChange(v))} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} />
                </View>
              )}
            />
            <Button title={isSubmitting ? t('review.submitting') : t('review.submit')} size="lg" fullWidth loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 16, paddingBottom: 40 }, switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } });
