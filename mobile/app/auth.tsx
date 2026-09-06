import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme';

/** Landing route for the magic-link deep link (hawwely://auth). Session is handled by useAuth. */
export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const id = setTimeout(() => router.replace('/(tabs)/alerts'), 600);
    return () => clearTimeout(id);
  }, [router]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
