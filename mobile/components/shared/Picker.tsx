import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, radius } from '@/theme';
import { Text } from '@/components/ui/Text';
import { haptic } from '@/lib/utils/haptics';

export interface PickerOption { value: string; label: string; icon?: string }

/** Bottom-sheet style single select used by forms (service / corridor). */
export function Picker({ label, value, options, onChange, placeholder, error }: { label: string; value: string; options: PickerOption[]; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const selected = options.find((o) => o.value === value);
  return (
    <View style={{ gap: 6 }}>
      <Text variant="smallBold">{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => setOpen(true)} style={[styles.field, error ? { borderColor: colors.danger } : null]}>
        {selected?.icon ? <Text style={{ fontSize: 20 }}>{selected.icon}</Text> : null}
        <Text variant="body" color={selected ? colors.text : colors.textMuted} style={{ flex: 1 }} numberOfLines={1}>
          {selected?.label ?? placeholder ?? t('common.select')}
        </Text>
        <ChevronDown size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.sheetHead}>
            <Text variant="h3">{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10} accessibilityLabel={t('common.close')}>
              <X size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 420 }}>
            {options.map((o) => {
              const active = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  accessibilityRole="menuitem"
                  onPress={() => {
                    haptic.selection();
                    onChange(o.value);
                    setOpen(false);
                  }}
                  style={[styles.option, active && styles.optionActive]}
                >
                  {o.icon ? <Text style={{ fontSize: 22 }}>{o.icon}</Text> : null}
                  <Text variant={active ? 'bodyBold' : 'body'} style={{ flex: 1 }}>
                    {o.label}
                  </Text>
                  {active ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.white, paddingHorizontal: 14 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionActive: { backgroundColor: colors.primaryLight, borderRadius: radius.sm },
});
