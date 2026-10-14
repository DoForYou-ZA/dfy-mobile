import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../theme';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Replaces Alert.alert('Sign out?') with a branded dialog. */
export default function SignOutDialog({ visible, onCancel, onConfirm }: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.scrim} onPress={onCancel} accessibilityLabel="Dismiss">
        {/* inner Pressable stops taps on the card from closing the dialog */}
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconCircle}>
            <Ionicons name="log-out-outline" size={26} color={colors.button} />
          </View>

          <Text style={styles.title}>
            Sign out<Text style={{ color: colors.orange }}>?</Text>
          </Text>
          <Text style={styles.body}>
            You will need to sign in again to access your account.
          </Text>

          <View style={styles.row}>
            <Pressable
              style={[styles.btn, styles.cancel]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.confirm]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Text style={styles.confirmText}>Sign out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.background,
    borderRadius: radii.dialog,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.medium, fontSize: 20, color: colors.text, marginTop: 14 },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  row: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 20 },
  btn: { flex: 1, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cancel: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.inputBorder },
  cancelText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  confirm: { backgroundColor: colors.button },
  confirmText: { fontFamily: fonts.medium, fontSize: 14, color: '#FFFFFF' },
});
