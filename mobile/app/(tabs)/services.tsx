import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { colors } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ServiceCard } from '@/components/services/ServiceCard';
import { getCorridors, getServices } from '@/lib/api/client';
import { useLang } from '@/lib/hooks/useLang';

export default function ServicesScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [corridor, setCorridor] = useState<string | null>(null);
  const services = useMemo(() => getServices(), []);
  const corridors = useMemo(() => getCorridors(), []);

  const filtered = services.filter((s) => {
    const matchQ = q.trim() ? `${s.name} ${s.name_ar}`.toLowerCase().includes(q.trim().toLowerCase()) : true;
    const matchC = corridor ? s.supported_corridors.includes(`${corridor}-EGP` as (typeof s.supported_corridors)[number]) : true;
    return matchQ && matchC;
  });

  return (
    <Screen plain>
      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => <ServiceCard service={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="h1">{t('services.title')}</Text>
            <Text variant="small" color={colors.textSecondary}>
              {t('services.subtitle')}
            </Text>
            <Input value={q} onChangeText={setQ} placeholder={t('services.search')} start={<Search size={18} color={colors.textMuted} />} returnKeyType="search" />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{ key: 'all' }, ...corridors.map((c) => ({ key: c.send_currency }))]}
              keyExtractor={(i) => i.key}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              renderItem={({ item }) => {
                if (item.key === 'all') return <Chip small label={t('services.all')} selected={corridor === null} onPress={() => setCorridor(null)} />;
                const c = corridors.find((x) => x.send_currency === item.key)!;
                return <Chip small label={`${c.flag_emoji} ${lang === 'ar' ? c.send_country_ar : c.send_country}`} selected={corridor === c.send_currency} onPress={() => setCorridor(c.send_currency)} />;
              }}
            />
            <Text variant="caption" color={colors.textMuted}>
              {t('services.affiliateNote')}
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title={t('common.emptyTitle')} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ header: { gap: 10, marginBottom: 12 } });
