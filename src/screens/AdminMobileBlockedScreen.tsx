import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Button from '../components/Button'
import { COLORS, RADIUS, SPACING } from '../config/theme'

export default function AdminMobileBlockedScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={s.page}>
      <View style={s.mark}><Text style={s.markLetter}>d</Text><View style={s.markDot} /></View>
      <Text style={s.eyebrow}>DOFORYOU ACCOUNT</Text>
      <Text style={s.title}>Admin access is desktop-only.</Text>
      <Text style={s.body}>
        The DoForYou mobile app is for task creators and runners. Administrative tools and account controls are not available here.
      </Text>
      <View style={s.note}>
        <Text style={s.noteTitle}>Your account is protected</Text>
        <Text style={s.noteBody}>No customer workspace or admin controls will be opened in this app.</Text>
      </View>
      <Button title="Sign out of this device" onPress={onSignOut} size="lg" fullWidth />
    </View>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background, alignItems: 'flex-start', justifyContent: 'center', padding: SPACING.xl },
  mark: { width: 54, height: 54, borderRadius: 18, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  markLetter: { fontSize: 35, fontWeight: '900', color: COLORS.white, marginTop: -5 },
  markDot: { position: 'absolute', right: 8, bottom: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  eyebrow: { color: COLORS.primaryDark, fontSize: 10, letterSpacing: 2.2, fontWeight: '900', marginBottom: 13 },
  title: { color: COLORS.textPrimary, fontSize: 34, lineHeight: 39, letterSpacing: -1, fontWeight: '900', maxWidth: 320 },
  body: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 23, marginTop: 15 },
  note: { marginTop: 26, marginBottom: 26, padding: 16, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, width: '100%' },
  noteTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  noteBody: { fontSize: 12, lineHeight: 18, color: COLORS.textSecondary, marginTop: 5 },
})
