import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, lineHeight, radius, space } from '../theme/tokens';

interface Option<T> {
  key: T;
  label: string;
}

interface Props<T> {
  options: Option<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function Segmented<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={String(o.key)}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  chip: {
    flexGrow: 1,
    minWidth: 44,
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.accent },
  label: {
    fontFamily: fonts.uiStrong,
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    color: colors.textSecondary,
  },
  labelSelected: { color: colors.onAccent },
});
