import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING } from '../../config/theme'

export default function AdminAccessScreen() {
  const { logout } = useAuth()

  return (
    <View style={styles.page}>
      <View style={styles.mark}><Text style={styles.markText}>DFY</Text></View>
      <View style={styles.iconWrap}><Text style={styles.icon}>⌘</Text></View>
      <Text style={styles.eyebrow}>ADMIN ACCOUNT</Text>
      <Text style={styles.title}>The admin console lives on the web.</Text>
      <Text style={styles.body}>
        The DoForYou mobile app is built for task creators and runners. For security, admin tools and account management are not available in this app.
      </Text>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Use the admin web portal</Text>
        <Text style={styles.noticeBody}>Sign out here, then open the authorised DoForYou admin portal in your browser.</Text>
      </View>
      <Button title="Sign out of mobile" onPress={() => { void logout() }} fullWidth size="lg" />
      <Text style={styles.footer}>DoForYou · Tasks made easier</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 58, height: 58, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  markText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900', letterSpacing: -0.5 },
  iconWrap: { width: 76, height: 76, borderRadius: 27, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: '#FFD9BC', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  icon: { fontSize: 36, color: COLORS.primaryDark, fontWeight: '700' },
  eyebrow: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '900', letterSpacing: 1.8, marginBottom: 10 },
  title: { color: COLORS.textPrimary, fontSize: 27, lineHeight: 33, fontWeight: '800', textAlign: 'center', maxWidth: 330, marginBottom: 12 },
  body: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 340 },
  notice: { width: '100%', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: 18, marginTop: 25, marginBottom: 18 },
  noticeTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 5 },
  noticeBody: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  footer: { color: COLORS.textMuted, fontSize: 11, marginTop: 25 },
})
