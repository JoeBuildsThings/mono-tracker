import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getToday } from '../db/todayQuery';
import type { TodayData, TodayHabit, TodayTask } from '../db/todayQuery';
import { checkIn, uncheck } from '../db/habitsRepo';
import { setTaskCompleted } from '../db/tasksRepo';
import { HabitRow } from '../components/HabitRow';
import { TaskRow } from '../components/TaskRow';
import { EmptyState } from '../components/EmptyState';
import { colors, fonts, fontSize, lineHeight, radius, size, space } from '../theme/tokens';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function dateLabel(d: Date): string {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

interface LabelProps {
  label: string;
  count: number;
  hint?: string;
  onPress?: () => void;
}

function SectionLabel({ label, count, hint, onPress }: LabelProps) {
  const content = (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionCount}>{hint ? `${count}  ${hint}` : `${count}`}</Text>
    </>
  );
  if (!onPress) return <View style={styles.section}>{content}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.section}>
      {content}
    </Pressable>
  );
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<TodayData>(() => getToday());
  const [anytimeOpen, setAnytimeOpen] = useState(false);

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
    console.log('add: the bottom sheet arrives in the next slice');
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
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{dateLabel(new Date()).toUpperCase()}</Text>
            <Text style={styles.heading}>Today</Text>
          </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  date: {
    fontFamily: fonts.mono,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
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
  section: {
    minHeight: size.touch,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: fonts.monoStrong,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  sectionCount: {
    fontFamily: fonts.mono,
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    color: colors.textSecondary,
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
