import { StyleSheet, View } from 'react-native';
import { colors, radius, size } from '../theme/tokens';

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.box, checked && styles.boxChecked]}>
      {checked ? <View style={styles.tick} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: size.checkbox,
    height: size.checkbox,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tick: {
    width: 12,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.onAccent,
    transform: [{ rotate: '315deg' }],
    marginBottom: 2,
  },
});
