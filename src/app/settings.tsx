import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Segmented } from '../components/Segmented';
import { SectionLabel } from '../components/SectionLabel';
import { useTheme } from '../theme/ThemeProvider';
import type { ThemeMode } from '../theme/ThemeProvider';
import { fonts, fontSize, lineHeight, size, space } from '../theme/tokens';
import type { Palette } from '../theme/tokens';

const MODE_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, mode, setMode } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.back}
        >
          <Text style={styles.backLabel}>BACK</Text>
        </Pressable>

        <Text style={styles.heading}>Settings</Text>

        <SectionLabel label="APPEARANCE" />
        <Segmented options={MODE_OPTIONS} value={mode} onChange={setMode} />
        <Text style={styles.note}>System follows your phone setting.</Text>
      </ScrollView>
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
      paddingTop: space.md,
    },
    back: {
      minHeight: size.touch,
      alignSelf: 'flex-start',
      justifyContent: 'center',
    },
    backLabel: {
      fontFamily: fonts.monoStrong,
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
      marginBottom: space.md,
    },
    note: {
      fontFamily: fonts.ui,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.textSecondary,
      marginTop: space.sm,
    },
  });
}
