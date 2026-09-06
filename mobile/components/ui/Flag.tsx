import { StyleSheet, View } from 'react-native';
import { Text } from './Text';

/** Emoji flag inside a soft circle — consistent size across platforms. */
export function Flag({ emoji, size = 32 }: { emoji: string; size?: number }) {
  return (
    <View style={[styles.wrap, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }]} accessibilityElementsHidden>
      <Text style={{ fontSize: size * 0.8, lineHeight: size + 4 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' } });
