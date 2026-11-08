import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fonts, fontSize, lineHeight, size } from '../theme/tokens';
import type { Palette } from '../theme/tokens';

interface Props {
  label: string;
  count?: number;
  hint?: string;
  onPress?: () => void;
}

export function SectionLabel({ label, count, hint, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const right = count === undefined ? '' : hint ? `${count}  ${hint}` : `${count}`;

  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      {right ? <Text style={styles.count}>{right}</Text> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      {content}
    </Pressable>
  );
}

function makeStyles(colors: Palette) {
  return StyleSheet.create({
    row: {
      minHeight: size.touch,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontFamily: fonts.monoStrong,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.textSecondary,
      letterSpacing: 1,
    },
    count: {
      fontFamily: fonts.mono,
      fontSize: fontSize.caption,
      lineHeight: lineHeight.caption,
      color: colors.textSecondary,
    },
  });
}
