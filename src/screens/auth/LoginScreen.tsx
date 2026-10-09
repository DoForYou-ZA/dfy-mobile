import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../../config/theme'

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>D</Text></View>
            <Text style={styles.brandName}>DoForYou<Text style={styles.brandDot}>.</Text></Text>
          </View>
          <View style={styles.hero}>
            <View style={styles.heroDecor} />
            <Text style={styles.eyebrow}>A LITTLE HELP GOES A LONG WAY</Text>
            <Text style={styles.heroTitle}>Your day, made easier.</Text>
            <Text style={styles.heroSubtitle}>Find a helping hand or earn by helping someone else.</Text>
            <View style={styles.featureRow}>
              <View style={styles.featureChip}><Text style={styles.featureIcon}>✓</Text><Text style={styles.featureLabel}>Trusted tasks</Text></View>
              <View style={styles.featureChip}><Text style={styles.featureIcon}>↗</Text><Text style={styles.featureLabel}>Local community</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in to pick up where you left off.</Text>

          {error ? (
            <View style={styles.errorBanner}><Text style={styles.errorText}>⚠  {error}</Text></View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button title="Sign in  →" onPress={handleLogin} loading={loading} disabled={!email || !password} fullWidth size="lg" style={styles.submitButton} />

          <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchText}>New to DoForYou? <Text style={styles.switchLink}>Create an account</Text></Text>
          </TouchableOpacity>
          <Text style={styles.secureNote}>Your account is protected. Your task journey starts here.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 20 },
  top: { paddingHorizontal: SPACING.md, paddingTop: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, marginBottom: 20 },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.primary },
  brandMarkText: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  brandName: { color: COLORS.textPrimary, fontSize: 21, fontWeight: '900', letterSpacing: -0.7 },
  brandDot: { color: COLORS.primary },
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: COLORS.primary, borderRadius: 27, padding: 22, paddingTop: 23, paddingBottom: 21, marginBottom: 22 },
  heroDecor: { position: 'absolute', width: 150, height: 150, borderRadius: 75, right: -60, top: -62, backgroundColor: 'rgba(255,255,255,0.12)' },
  eyebrow: { color: '#FFE9D7', fontSize: 9, fontWeight: '900', letterSpacing: 1.35, marginBottom: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, marginBottom: 8, maxWidth: 280 },
  heroSubtitle: { color: '#FFF5ED', fontSize: 14, lineHeight: 21, maxWidth: 290 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 19 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.16)' },
  featureIcon: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  featureLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  formCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 25, borderWidth: 1, borderColor: COLORS.borderLight, padding: 22, marginHorizontal: SPACING.md, ...SHADOW.md },
  formTitle: { fontSize: 25, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 5 },
  formSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 23, lineHeight: 20 },
  errorBanner: { backgroundColor: COLORS.dangerLight, borderWidth: 1, borderColor: '#F8CACA', borderRadius: RADIUS.md, padding: 12, marginBottom: 16 },
  errorText: { color: COLORS.dangerDark, fontSize: 13, lineHeight: 19 },
  inputGroup: { marginBottom: 17 },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: COLORS.textPrimary, backgroundColor: '#FFFEFC' },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  passwordInput: { flex: 1, minWidth: 0 },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 14, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.background },
  eyeText: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
  submitButton: { marginTop: 4, borderRadius: RADIUS.md, paddingVertical: 15 },
  switchRow: { marginTop: 21, alignItems: 'center' },
  switchText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  switchLink: { color: COLORS.primaryDark, fontWeight: '900' },
  secureNote: { color: COLORS.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 18 },
})
