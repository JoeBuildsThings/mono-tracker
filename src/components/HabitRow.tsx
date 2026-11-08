import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Checkbox } from './Checkbox';
import type { TodayHabit } from '../db/todayQuery';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, fontSize, lineHeight, radius, size, space } from '../theme/tokens';
import type { Palette } from '../theme/tokens';

interface Props {
  habit: TodayHabit;
  onToggle: (habit: TodayHabit) => void;
}

export function HabitRow({ habit, onToggle }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const weekly = habit.frequency_type === 'weekly';
  const figure = weekly ? `${habit.week_count}/${habit.target_count}` : `${habit.current_streak}`;
  const caption = weekly ? `${habit.current_streak} wk streak` : 'day streak';

  return (
    <Pressable
      onPress={() => onToggle(habit)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: habit.checked_today }}
      accessibilityLabel={habit.title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Checkbox checked={habit.checked_today} />
      <Text style={[styles.title, habit.checked_today && styles.titleDone]} numberOfLines={1}>
        {habit.title}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.figure}>{figure}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </Pressable>
  );
}

function makeStyles(colors: Palette) {
  return StyleSheet.create({
    row: {
      minHeight: size.row,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingHorizontal: space.md,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      marginBottom: space.sm,
    },
    pressed: { backgroundColor: colors.surfaceHigh },
    title: {
      flex: 1,
      fontFamily: fonts.ui,
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: colors.textPrimary,
    },
    titleDone: { color: colors.textSecondary },
    meta: { alignItems: 'flex-end' },
    figure: {
      fontFamily: fonts.monoStrong,
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: colors.accent,
    },
    caption: {
      fontFamily: fonts.mono,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.textSecondary,
    },
  });
}
