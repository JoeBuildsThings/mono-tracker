import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, fontSize, lineHeight, radius, space } from '../theme/tokens';
import type { Palette } from '../theme/tokens';

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <View style={styles.dot} />
      </View>
      <Text style={styles.title}>Nothing here yet</Text>
      <Text style={styles.body}>Add a habit to start a streak, or a task to clear your head.</Text>
      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonLabel}>Add your first habit</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: Palette) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      gap: space.md,
      paddingVertical: space.xxl,
      paddingHorizontal: space.lg,
    },
    ring: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    title: {
      fontFamily: fonts.uiStrong,
      fontSize: fontSize.title,
      lineHeight: lineHeight.title,
      color: colors.textPrimary,
    },
    body: {
      fontFamily: fonts.ui,
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    button: {
      minHeight: 48,
      paddingHorizontal: space.lg,
      borderRadius: radius.lg,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: { opacity: 0.8 },
    buttonLabel: {
      fontFamily: fonts.uiStrong,
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: colors.onAccent,
    },
  });
}
