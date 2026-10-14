import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

type Props = {
  steps: string[]; // e.g. ['Your details', 'Your role', 'Security']
  current: number; // 0-based index of the active step
};

/** Circles and labels share one column, so each label sits exactly under its circle. */
export default function StepIndicator({ steps, current }: Props) {
  const inset = `${100 / (steps.length * 2)}%` as `${number}%`;
  return (
    <View
      style={styles.row}
      accessibilityLabel={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
    >
      <View style={[styles.line, { left: inset, right: inset }]} />
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <View key={label} style={styles.step}>
            <View style={[styles.circle, (active || done) && styles.circleOn]}>
              {done ? (
                <Ionicons name="checkmark" size={16} color={colors.text} />
              ) : (
                <Text style={[styles.num, active && styles.numOn]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.label, active && styles.labelOn]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginTop: 16, marginBottom: 18 },
  line: { position: 'absolute', top: 13, height: 2, backgroundColor: colors.cardBorder },
  step: { flex: 1, alignItems: 'center' },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOn: { backgroundColor: colors.orange, borderColor: colors.orange },
  num: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  numOn: { color: colors.text },
  label: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
  labelOn: { fontFamily: fonts.medium, color: colors.button },
});
