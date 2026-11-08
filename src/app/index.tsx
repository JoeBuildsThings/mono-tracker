import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getToday } from '../db/todayQuery';
import type { TodayData, TodayHabit, TodayTask } from '../db/todayQuery';
import { checkIn, uncheck } from '../db/habitsRepo';
import { setTaskCompleted } from '../db/tasksRepo';
import { HabitRow } from '../components/HabitRow';
import { TaskRow } from '../components/TaskRow';
import { EmptyState } from '../components/EmptyState';
import { AddSheet } from '../components/AddSheet';
import { SectionLabel } from '../components/SectionLabel';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, fontSize, lineHeight, radius, size, space } from '../theme/tokens';
import type { Palette } from '../theme/tokens';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateLabel(d: Date): string {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [data, setData] = useState<TodayData>(() => getToday());
  const [anytimeOpen, setAnytimeOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const refresh = useCallback(() => {
    setData(getToday());
  }, []);

  useFocusEffect(refresh);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const toggleHabit = useCallback(
    (habit: TodayHabit) => {
      if (habit.checked_today) uncheck(habit.id);
      else checkIn(habit.id);
      refresh();
    },
    [refresh]
  );

  const toggleTask = useCallback(
    (task: TodayTask) => {
      setTaskCompleted(task.id, task.is_completed === 0);
      refresh();
    },
    [refresh]
  );

  const onAdd = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const done =
    data.habits.filter((h) => h.checked_today).length + data.tasks.filter((t) => t.is_completed === 1).length;
  const total = data.habits.length + data.tasks.length;
  const isEmpty = total === 0 && data.anytime.length === 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.date}>{dateLabel(new Date()).toUpperCase()}</Text>
          <Pressable
            onPress={() => router.push('/settings' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={styles.iconButton}
          >
            <View style={styles.dots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.heading}>Today</Text>
          {total > 0 ? (
            <Text style={styles.progress}>
              {done} of {total} done
            </Text>
          ) : null}
        </View>

        {isEmpty ? <EmptyState onAdd={onAdd} /> : null}

        {data.habits.length > 0 ? (
          <>
            <SectionLabel label="HABITS" count={data.habits.length} />
            {data.habits.map((h) => (
              <HabitRow key={h.id} habit={h} onToggle={toggleHabit} />
            ))}
          </>
        ) : null}

        {data.tasks.length > 0 ? (
          <>
            <SectionLabel label="TASKS" count={data.tasks.length} />
            {data.tasks.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={toggleTask} />
            ))}
          </>
        ) : null}

        {data.anytime.length > 0 ? (
          <>
            <SectionLabel
              label="ANYTIME"
              count={data.anytime.length}
              hint={anytimeOpen ? 'HIDE' : 'SHOW'}
              onPress={() => setAnytimeOpen((open) => !open)}
            />
            {anytimeOpen
              ? data.anytime.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)
              : null}
          </>
        ) : null}
      </ScrollView>

      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Add"
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + space.lg },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>

      <AddSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onCreated={refresh} />
    </View>
  );
}

function makeStyles(colors: Palette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: space.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: size.touch,
    },
    date: {
      fontFamily: fonts.mono,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.textSecondary,
      letterSpacing: 1,
    },
    iconButton: {
      width: size.touch,
      height: size.touch,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dots: {
      flexDirection: 'row',
      gap: space.xs,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.textSecondary,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: space.md,
    },
    heading: {
      fontFamily: fonts.uiStrong,
      fontSize: fontSize.display,
      lineHeight: lineHeight.display,
      color: colors.textPrimary,
    },
    progress: {
      fontFamily: fonts.mono,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.accent,
      marginBottom: space.sm,
    },
    fab: {
      position: 'absolute',
      right: space.lg,
      width: size.fab,
      height: size.fab,
      borderRadius: radius.lg,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabPressed: { opacity: 0.8 },
    fabLabel: {
      fontFamily: fonts.mono,
      fontSize: fontSize.heading,
      lineHeight: lineHeight.heading,
      color: colors.onAccent,
    },
  });
}
