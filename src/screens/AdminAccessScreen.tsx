import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import { COLORS, RADIUS, SPACING } from '../config/theme'

export default function AdminAccessScreen() {
  const { logout } = useAuth()
  return (
    <View style={s.page}>
      <View style={s.mark}><Text style={s.markText}>D</Text></View>
      <View style={s.pill}><Text style={s.pillText}>ADMIN ACCOUNT</Text></View>
      <Text style={s.title}>Admin tools live on the web</Text>
      <Text style={s.copy}>The DoForYou mobile app is built for task creators and runners. Administrative dashboards and controls are not available in the mobile app.</Text>
      <View style={s.note}>
        <Text style={s.noteIcon}>🔐</Text>
        <Text style={s.noteText}>Your account and permissions have not changed. Sign out here, then use the authorised web admin portal for administration.</Text>
      </View>
      <Button title="Sign out of mobile" onPress={() => { void logout() }} fullWidth size="lg" />
    </View>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  mark: { width: 68, height: 68, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  markText: { color: COLORS.white, fontSize: 36, fontWeight: '900' },
  pill: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 14 },
  pillText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: COLORS.primaryDark },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '800', textAlign: 'center', color: COLORS.textPrimary, letterSpacing: -0.6 },
  copy: { fontSize: 15, lineHeight: 23, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: RADIUS.lg, padding: 15, marginVertical: 24 },
  noteIcon: { fontSize: 20 },
  noteText: { flex: 1, fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
})
