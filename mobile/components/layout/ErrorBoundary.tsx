import type { ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import i18n from '@/i18n';
import { colors } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

/** Route-level error UI (Arabic first). */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const t = i18n.isInitialized ? i18n.t.bind(i18n) : (k: string) => (k === 'common.error' ? 'حصلت مشكلة' : k === 'common.retry' ? 'حاول تاني' : 'معلش، حصلت مشكلة مؤقتة. جرب تاني بعد شوية.');
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <AlertTriangle size={36} color={colors.warning} />
      </View>
      <Text variant="h2" center>
        {t('common.error')}
      </Text>
      <Text variant="small" color={colors.textSecondary} center>
        {t('common.errorText')}
      </Text>
      {__DEV__ ? (
        <Text variant="caption" color={colors.textMuted} center ltr>
          {error.message}
        </Text>
      ) : null}
      <Button title={t('common.retry')} onPress={retry} style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8, backgroundColor: colors.background },
  icon: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
