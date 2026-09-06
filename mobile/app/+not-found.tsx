import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: '404' }} />
      <View style={styles.wrap}>
        <Text variant="hero" color={colors.primary} ltr>
          404
        </Text>
        <Text variant="h2" center>
          {t('common.emptyTitle')}
        </Text>
        <Link href="/(tabs)" asChild>
          <Button title={t('common.back')} />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({ wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: colors.background } });
