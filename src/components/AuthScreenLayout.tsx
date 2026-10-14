import React, { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = {
  children: ReactNode; // top block: header, heading, card
  footer?: ReactNode; // bottom block: pinned above the safe area
};

/**
 * Shared layout for the auth screens.
 * - one centred column (same side margins for every element)
 * - content stays at the top, `footer` is pushed to the bottom (no dead space)
 * - still scrolls when the keyboard is open
 */
export default function AuthScreenLayout({ children, footer }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.column}>
            {children}
            <View style={styles.spacer} />
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  column: { flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center' },
  spacer: { flex: 1, minHeight: 16 },
});
