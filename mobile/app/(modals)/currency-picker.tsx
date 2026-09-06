import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Search } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { TopBar } from '@/components/layout/TopBar';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Flag } from '@/components/ui/Flag';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCorridors } from '@/lib/api/client';
import { CURRENCY_META } from '@/lib/shared/constants';
import { useStore } from '@/store/useStore';
import { useLang } from '@/lib/hooks/useLang';
import { haptic } from '@/lib/utils/haptics';

export default function CurrencyPickerModal() {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currency, setCurrency } = useStore();
  const [q, setQ] = useState('');
  const corridors = useMemo(() => getCorridors(), []);
  const filtered = corridors.filter((c) => {
    if (!q.trim()) return true;
    const s = q.trim().toLowerCase();
    const meta = CURRENCY_META[c.send_currency];
    return `${c.send_country} ${c.send_country_ar} ${c.send_currency} ${meta.name} ${meta.name_ar}`.toLowerCase().includes(s);
  });
  const popular = filtered.slice(0, 4);
  const rest = q.trim() ? filtered : filtered.slice(4);

  function choose(cur: typeof currency) {
    haptic.success();
    setCurrency(cur);
    router.back();
  }

  const Item = ({ item }: { item: (typeof corridors)[number] }) => {
    const active = item.send_currency === currency;
    const meta = CURRENCY_META[item.send_currency];
    return (
      <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => choose(item.send_currency)} style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && { opacity: 0.85 }]}>
        <Flag emoji={item.flag_emoji} size={28} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold">{lang === 'ar' ? item.send_country_ar : item.send_country}</Text>
          <Text variant="caption" color={colors.textSecondary} ltr>
            {item.send_currency} · {lang === 'ar' ? meta.name_ar : meta.name}
          </Text>
        </View>
        {active ? <Check size={20} color={colors.primary} /> : null}
      </Pressable>
    );
  };

  return (
    <Screen plain>
      <TopBar close title={t('currencyPicker.title')} />
      <View style={{ paddingHorizontal: 16 }}>
        <Input value={q} onChangeText={setQ} placeholder={t('currencyPicker.search')} start={<Search size={18} color={colors.textMuted} />} autoFocus={false} returnKeyType="search" />
      </View>
      <FlatList
        data={rest}
        keyExtractor={(c) => c.id}
        renderItem={Item}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 24 }}
        ListHeaderComponent={
          !q.trim() ? (
            <View>
              <Text variant="captionBold" color={colors.textSecondary} style={styles.section}>
                {t('currencyPicker.popular')}
              </Text>
              {popular.map((c) => (
                <Item key={c.id} item={c} />
              ))}
              <Text variant="captionBold" color={colors.textSecondary} style={styles.section}>
                {t('currencyPicker.all')}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={q.trim() ? <EmptyState title={t('currencyPicker.empty')} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 8, marginBottom: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
});
