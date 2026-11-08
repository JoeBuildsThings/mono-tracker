import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Checkbox } from './Checkbox';
import type { TodayTask } from '../db/todayQuery';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, fontSize, lineHeight, radius, size, space } from '../theme/tokens';
import type { Palette } from '../theme/tokens';

interface Props {
  task: TodayTask;
  onToggle: (task: TodayTask) => void;
}

export function TaskRow({ task, onToggle }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const done = task.is_completed === 1;

  return (
    <Pressable
      onPress={() => onToggle(task)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={task.title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Checkbox checked={done} />
      <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
        {task.title}
      </Text>
      {task.overdue && !done ? <Text style={styles.overdue}>OVERDUE</Text> : null}
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
    titleDone: {
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    overdue: {
      fontFamily: fonts.monoStrong,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.overdue,
    },
  });
}
