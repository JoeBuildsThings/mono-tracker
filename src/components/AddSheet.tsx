import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Segmented } from './Segmented';
import { Checkbox } from './Checkbox';
import { createHabit } from '../db/habitsRepo';
import { createTask } from '../db/tasksRepo';
import { addDays, toLocalDateString } from '../domain/dates';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, fontSize, lineHeight, radius, size, space } from '../theme/tokens';
import type { Palette } from '../theme/tokens';

type Kind = 'habit' | 'task';
type Frequency = 'daily' | 'weekly';
type Due = 'none' | 'today' | 'tomorrow' | 'week';

const OFFSCREEN = 640;

const KIND_OPTIONS: { key: Kind; label: string }[] = [
  { key: 'habit', label: 'Habit' },
  { key: 'task', label: 'Task' },
];
const FREQ_OPTIONS: { key: Frequency; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
];
const TARGET_OPTIONS: { key: number; label: string }[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  key: n,
  label: String(n),
}));
const DUE_OPTIONS: { key: Due; label: string }[] = [
  { key: 'none', label: 'Anytime' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'Next week' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function dueDate(due: Due): string | null {
  const today = toLocalDateString();
  if (due === 'today') return today;
  if (due === 'tomorrow') return addDays(today, 1);
  if (due === 'week') return addDays(today, 7);
  return null;
}

export function AddSheet({ visible, onClose, onCreated }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
  const [kind, setKind] = useState<Kind>('habit');
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [target, setTarget] = useState(3);
  const [grace, setGrace] = useState(false);
  const [due, setDue] = useState<Due>('none');

  useEffect(() => {
    if (!visible) return;
    setKind('habit');
    setTitle('');
    setFrequency('daily');
    setTarget(3);
    setGrace(false);
    setDue('none');
    translateY.setValue(OFFSCREEN);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: OFFSCREEN,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const canSave = title.trim().length > 0;

  const save = () => {
    const t = title.trim();
    if (!t) return;
    if (kind === 'habit') {
      createHabit({
        title: t,
        frequency_type: frequency,
        target_count: frequency === 'weekly' ? target : 1,
        grace_enabled: grace,
      });
    } else {
      createTask({ title: t, due_date: dueDate(due) });
    }
    onCreated();
    close();
  };

  const field = (label: string, children: ReactNode) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView style={styles.fill} behavior="padding">
        <Pressable style={styles.scrim} onPress={close} accessibilityLabel="Close" />
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + space.md, transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <Segmented options={KIND_OPTIONS} value={kind} onChange={setKind} />

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={kind === 'habit' ? 'e.g. Meditate' : 'e.g. Buy milk'}
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              autoFocus
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={save}
              accessibilityLabel="Title"
            />

            {kind === 'habit' ? (
              <>
                {field(
                  'FREQUENCY',
                  <Segmented options={FREQ_OPTIONS} value={frequency} onChange={setFrequency} />
                )}
                {frequency === 'weekly'
                  ? field(
                      'TIMES PER WEEK',
                      <Segmented options={TARGET_OPTIONS} value={target} onChange={setTarget} />
                    )
                  : null}
                <Pressable
                  onPress={() => setGrace((g) => !g)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: grace }}
                  style={styles.graceRow}
                >
                  <Checkbox checked={grace} />
                  <Text style={styles.graceText}>Grace day: forgive one miss a week</Text>
                </Pressable>
              </>
            ) : (
              field('DUE', <Segmented options={DUE_OPTIONS} value={due} onChange={setDue} />)
            )}
          </ScrollView>

          <Pressable
            onPress={save}
            disabled={!canSave}
            accessibilityRole="button"
            style={[styles.save, !canSave && styles.saveDisabled]}
          >
            <Text style={styles.saveLabel}>Save</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(colors: Palette) {
  return StyleSheet.create({
    fill: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.scrim,
    },
    sheet: {
      maxHeight: '88%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingHorizontal: space.md,
      paddingTop: space.sm,
      gap: space.md,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.outline,
    },
    body: {
      gap: space.md,
    },
    input: {
      minHeight: size.row,
      backgroundColor: colors.surfaceHigh,
      borderRadius: radius.md,
      paddingHorizontal: space.md,
      fontFamily: fonts.ui,
      fontSize: fontSize.body,
      color: colors.textPrimary,
    },
    field: {
      gap: space.sm,
    },
    fieldLabel: {
      fontFamily: fonts.monoStrong,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.textSecondary,
      letterSpacing: 1,
    },
    graceRow: {
      minHeight: size.touch,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
    },
    graceText: {
      flex: 1,
      fontFamily: fonts.ui,
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: colors.textPrimary,
    },
    save: {
      minHeight: size.row,
      borderRadius: radius.lg,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveDisabled: { opacity: 0.4 },
    saveLabel: {
      fontFamily: fonts.uiStrong,
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: colors.onAccent,
    },
  });
}
