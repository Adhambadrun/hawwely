import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { colors, radius, fonts } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { Flag } from '@/components/ui/Flag';
import { useStore } from '@/store/useStore';
import { getCorridorByCurrency, compareLocally } from '@/lib/api/client';
import { CURRENCY_META, MAX_AMOUNT } from '@/lib/shared/constants';
import { formatEgp, formatNumber, groupDigits, parseAmount } from '@/lib/shared/formatters';
import { useLang } from '@/lib/hooks/useLang';
import { haptic } from '@/lib/utils/haptics';

const QUICK: Record<string, number[]> = {
  default: [500, 1000, 2000, 5000],
  KWD: [50, 100, 150, 300],
  JOD: [100, 200, 300, 500],
};

/** Hero comparison form: country picker (modal) + amount + quick chips + CTA. */
export function CompareForm({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const lang = useLang();
  const { currency, amount, setAmount } = useStore();
  const corridor = getCorridorByCurrency(currency);
  const [text, setText] = useState(groupDigits(amount));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parsed = parseAmount(text);
  const preview = useMemo(() => {
    if (!parsed || parsed <= 0) return null;
    const res = compareLocally(currency, parsed);
    return res?.results[0]?.amount_received ?? null;
  }, [currency, parsed]);

  function onChange(v: string) {
    const digits = v.replace(/[^\d.]/g, '');
    const n = parseAmount(digits);
    setText(n ? groupDigits(Math.floor(n)) : digits);
    setError(null);
  }

  function submit() {
    const n = parseAmount(text);
    if (!text.trim()) return setError(t('common.amountRequired'));
    if (!Number.isFinite(n) || n <= 0) return setError(t('common.amountInvalid'));
    if (n > MAX_AMOUNT) return setError(t('common.amountTooLarge'));
    haptic.medium();
    setLoading(true);
    setAmount(n);
    router.push({ pathname: '/compare/results', params: { currency, amount: String(n) } });
    setTimeout(() => setLoading(false), 600);
  }

  const quick = QUICK[currency] ?? QUICK.default;
  const symbol = CURRENCY_META[currency]?.symbol ?? currency;

  return (
    <View style={styles.form}>
      {!compact ? (
        <Text variant="captionBold" color={colors.textSecondary}>
          {t('home.iAmIn')}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.iAmIn')}
        onPress={() => router.push('/(modals)/currency-picker')}
        style={({ pressed }) => [styles.picker, pressed && { opacity: 0.85 }]}
      >
        <Flag emoji={corridor?.flag_emoji ?? '🌍'} size={26} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold">{corridor ? (lang === 'ar' ? corridor.send_country_ar : corridor.send_country) : currency}</Text>
          <Text variant="caption" color={colors.textSecondary} ltr>
            {currency} · {lang === 'ar' ? CURRENCY_META[currency]?.name_ar : CURRENCY_META[currency]?.name}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.textSecondary} />
      </Pressable>

      <Input
        label={compact ? undefined : t('home.amount')}
        value={text}
        onChangeText={onChange}
        onSubmitEditing={submit}
        keyboardType="decimal-pad"
        returnKeyType="done"
        numeric
        error={error ?? undefined}
        placeholder="2,000"
        maxLength={12}
        end={
          <Text style={styles.symbol} ltr>
            {symbol}
          </Text>
        }
      />

      <View style={styles.chips}>
        {quick.map((q) => (
          <Chip key={q} small label={formatNumber(q, lang)} selected={parsed === q} onPress={() => onChange(String(q))} />
        ))}
      </View>

      {preview != null ? (
        <View style={styles.preview}>
          <Text variant="caption" color={colors.textSecondary}>
            {t('home.familyGets')}
          </Text>
          <Text variant="numLarge" color={colors.primaryDark} ltr>
            {formatEgp(preview, lang)}
          </Text>
          <Text variant="caption" color={colors.textMuted}>
            {t('home.atBestRate')}
          </Text>
        </View>
      ) : null}

      <Button title={loading ? t('home.comparing') : t('home.compareButton')} size="lg" fullWidth loading={loading} onPress={submit} hapticStyle="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  picker: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 10, backgroundColor: colors.white },
  symbol: { fontFamily: fonts.interSemiBold, color: colors.textSecondary, fontSize: 16 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  preview: { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: 12, alignItems: 'center', gap: 2 },
});
