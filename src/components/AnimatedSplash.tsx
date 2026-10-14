import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { colors, fonts } from '../theme';

type Props = { fontsReady: boolean; onDone: () => void };

// Letters D, F, Y each arrive their own way. The dot is drawn (not a font glyph)
// so it keeps the same size on every phone and can bounce + ripple on its own.
const LETTERS = [
  { char: 'D', delay: 50, fromX: 0, fromY: -340, fromRot: 0 },
  { char: 'F', delay: 250, fromX: -230, fromY: 0, fromRot: -35 },
  { char: 'Y', delay: 450, fromX: 0, fromY: -340, fromRot: 25 },
];

const TAGLINE = [
  { text: 'Let’s', delay: 1900 },
  { text: 'get', delay: 2000 },
  { text: 'it', delay: 2100 },
];

function Letter({
  char, delay, fromX, fromY, fromRot, fontsReady,
}: (typeof LETTERS)[number] & { fontsReady: boolean }) {
  const x = useSharedValue(fromX);
  const y = useSharedValue(fromY);
  const rot = useSharedValue(fromRot);
  const opacity = useSharedValue(0);
  const squash = useSharedValue(1);

  useEffect(() => {
    const spring = { damping: 7, stiffness: 120, mass: 0.8 };
    opacity.value = withDelay(delay, withTiming(1, { duration: 120 }));
    x.value = withDelay(delay, withSpring(0, spring));
    y.value = withDelay(delay, withSpring(0, spring));
    rot.value = withDelay(delay, withSpring(0, spring));
    squash.value = withDelay(
      delay + 380,
      withSequence(withTiming(0.8, { duration: 80 }), withSpring(1, { damping: 5 })),
    );
  }, []);

  // transformOrigin is CSS-only and ignored in React Native. Compensate for
  // the scaleY anchor by translating Y so the bottom edge stays fixed:
  // offset = (1 - scale) * halfHeight. At fontSize 64, halfHeight ≈ 32.
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value + (1 - squash.value) * 32 },
      { rotate: `${rot.value}deg` },
      { scaleY: squash.value },
    ],
  }));

  return (
    <Animated.Text style={[styles.letter, !fontsReady && styles.fallbackLetter, style]}>
      {char}
    </Animated.Text>
  );
}

function Dot() {
  const x = useSharedValue(150);
  const y = useSharedValue(-280);
  const opacity = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(750, withTiming(1, { duration: 100 }));
    x.value = withDelay(750, withTiming(0, { duration: 700 }));
    y.value = withDelay(750, withSpring(0, { damping: 5, stiffness: 90 }));
    ring.value = withDelay(1470, withTiming(1, { duration: 700 }));
  }, []);

  const dot = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.7 * (1 - ring.value),
    transform: [{ scale: 1 + ring.value * 6 }],
  }));

  return (
    <View style={styles.dotWrap}>
      <Animated.View style={[styles.dot, dot]} />
      <Animated.View style={[styles.ring, ringStyle]} />
    </View>
  );
}

function Word({ text, delay, fontsReady }: { text: string; delay: number; fontsReady: boolean }) {
  const opacity = useSharedValue(0);
  const y = useSharedValue(14);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    y.value = withDelay(delay, withTiming(0, { duration: 500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  // No trailing space: React Native trims it. Spacing comes from `gap` on the row.
  return (
    <Animated.Text style={[styles.tagline, !fontsReady && styles.fallbackTagline, style]}>
      {text}
    </Animated.Text>
  );
}

function Period() {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      2500,
      withSequence(withTiming(1.6, { duration: 270 }), withTiming(1, { duration: 180 })),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: scale.value > 0 ? 1 : 0,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.Text style={[styles.tagline, styles.period, style]}>.</Animated.Text>;
}

function MotionSplash({ fontsReady, onDone }: Props) {
  const pulse = useSharedValue(1);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  useEffect(() => {
    // Hide the native splash after the first paint, not during the layout pass.
    // onLayout fires before the frame is committed on Android new arch, causing
    // a white gap between the native splash disappearing and React painting cream.
    SplashScreen.hideAsync();

    pulse.value = withDelay(
      1500,
      withSequence(withTiming(1.05, { duration: 200 }), withTiming(1, { duration: 300 })),
    );
    const timer = setTimeout(() => onDoneRef.current(), 7000);
    return () => clearTimeout(timer);
  }, []);

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.row, rowStyle]}>
        {LETTERS.map((l) => (
          <Letter key={l.char} {...l} fontsReady={fontsReady} />
        ))}
        <Dot />
      </Animated.View>

      <View style={styles.taglineRow}>
        {TAGLINE.map((w) => (
          <Word key={w.text} {...w} fontsReady={fontsReady} />
        ))}
        {/* "done" + the orange full stop stay together so it reads "done." */}
        <View style={styles.lastWord}>
          <Word text="done" delay={2200} fontsReady={fontsReady} />
          <Period />
        </View>
      </View>
    </View>
  );
}

/** Used when the phone has "reduce motion" turned on: same logo, no movement. */
function StaticSplash({ fontsReady, onDone }: Props) {
  useEffect(() => {
    SplashScreen.hideAsync();
    const timer = setTimeout(onDone, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <Text style={[styles.letter, !fontsReady && styles.fallbackLetter]}>
        DFY<Text style={{ color: colors.orange }}>.</Text>
      </Text>
      <Text style={[styles.tagline, !fontsReady && styles.fallbackTagline, { marginTop: 18 }]}>
        Let’s get it done<Text style={styles.period}>.</Text>
      </Text>
    </View>
  );
}

export default function AnimatedSplash({ fontsReady, onDone }: Props) {
  const reduceMotion = useReducedMotion();
  return reduceMotion
    ? <StaticSplash fontsReady={fontsReady} onDone={onDone} />
    : <MotionSplash fontsReady={fontsReady} onDone={onDone} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  letter: { fontFamily: fonts.brand, fontSize: 64, letterSpacing: 0, color: colors.text },
  fallbackLetter: { fontFamily: undefined },
  // Tweak marginBottom if the dot sits too high/low against the letters.
  dotWrap: { width: 12, height: 12, marginLeft: 4, marginBottom: 10 },
  dot: { ...StyleSheet.absoluteFillObject, borderRadius: 6, backgroundColor: colors.orange },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  taglineRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 18 },
  lastWord: { flexDirection: 'row', alignItems: 'baseline' },
  tagline: { fontFamily: fonts.regular, fontSize: 16, color: colors.textSecondary },
  fallbackTagline: { fontFamily: undefined },
  period: { color: colors.orange },
});
