import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'

export default function AdminAccessScreen() {
  const { logout } = useAuth()

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>D</Text></View>
        <Text style={styles.brandName}>DoForYou<Text style={styles.brandDot}>.</Text></Text>
      </View>
      <View style={styles.card}>
        <View style={styles.iconWrap}><Text style={styles.icon}>↗</Text></View>
        <Text style={styles.title}>Admin tools live on web</Text>
        <Text style={styles.body}>The DoForYou mobile app is designed for task creators and runners. For safety and a clearer experience, admin and operations tools are only available through the web console.</Text>
        <View style={styles.note}><Text style={styles.noteText}>Your account has not been changed. Sign out here, then open the DoForYou web console to continue with admin work.</Text></View>
        <TouchableOpacity style={styles.button} onPress={() => logout()} accessibilityRole="button">
          <Text style={styles.buttonText}>Sign out of mobile</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>DoForYou · Helping everyday happen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 },
  brandMark: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.primary },
  brandMarkText: { color: COLORS.white, fontSize: 25, fontWeight: '900' },
  brandName: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  brandDot: { color: COLORS.primary },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: 'center', ...SHADOW.md },
  iconWrap: { width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  icon: { fontSize: 32, fontWeight: '700', color: COLORS.primaryDark },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  body: { fontSize: 14, lineHeight: 22, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12 },
  note: { width: '100%', backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 13, marginTop: 20 },
  noteText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
  button: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 15, marginTop: 20 },
  buttonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  footer: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, marginTop: 24 },
})
