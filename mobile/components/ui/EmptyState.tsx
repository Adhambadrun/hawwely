import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';

export function EmptyState({ icon, title, text, actionLabel, onAction }: { icon?: ReactNode; title: string; text?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text variant="h3" center>
        {title}
      </Text>
      {text ? (
        <Text variant="small" color={colors.textSecondary} center style={{ maxWidth: 300 }}>
          {text}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingVertical: 40, paddingHorizontal: 24 },
  icon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
