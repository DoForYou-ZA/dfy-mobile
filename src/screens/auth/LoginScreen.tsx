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
    if (!email.trim() || !password) { setError('Enter your email and password to continue.'); return }
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'We could not sign you in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>D</Text></View>
            <Text style={styles.brandName}>DoForYou<Text style={styles.brandDot}>.</Text></Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>YOUR DAY, MADE EASIER</Text>
            <Text style={styles.heroTitle}>Good things happen{ '\n' }when we help.</Text>
            <Text style={styles.heroSubtitle}>Find a helping hand, or earn by lending yours.</Text>
          </View>
          <View style={styles.promiseRow}>
            <View style={styles.promisePill}><Text style={styles.promiseIcon}>✓</Text><Text style={styles.promiseText}>Trusted community</Text></View>
            <View style={styles.promisePill}><Text style={styles.promiseIcon}>↗</Text><Text style={styles.promiseText}>Tasks that move you</Text></View>
          </View>
          <View style={styles.decorCircle} />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in to pick up where you left off.</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorMark}>!</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
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
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} accessibilityRole="button">
                <Text style={styles.showPassword}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </View>

          <Button
            title="Sign in"
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password}
            fullWidth
            size="lg"
            style={styles.signInButton}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New to DoForYou? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} accessibilityRole="button">
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footer}>A little help goes a long way.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  hero: {
    backgroundColor: '#FFF0D9',
    paddingHorizontal: SPACING.lg,
    paddingTop: 28,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }],
    ...SHADOW.primary,
  },
  brandMarkText: { color: COLORS.white, fontSize: 25, fontWeight: '900' },
  brandName: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.7 },
  brandDot: { color: COLORS.primary },
  heroCopy: { marginTop: 38, maxWidth: 330, zIndex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#A75B00', marginBottom: 12 },
  heroTitle: { fontSize: 34, lineHeight: 39, fontWeight: '800', letterSpacing: -1.2, color: COLORS.textPrimary },
  heroSubtitle: { fontSize: 15, lineHeight: 23, color: '#655849', marginTop: 12, maxWidth: 290 },
  promiseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24, zIndex: 1 },
  promisePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.78)', paddingVertical: 8, paddingHorizontal: 11, borderRadius: RADIUS.full },
  promiseIcon: { color: COLORS.accent, fontSize: 13, fontWeight: '900' },
  promiseText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '700' },
  decorCircle: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 28, borderColor: 'rgba(255,138,0,0.10)', right: -72, top: 95 },
  formCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginHorizontal: SPACING.md, marginTop: -12, borderWidth: 1, borderColor: COLORS.borderLight,
    ...SHADOW.md,
  },
  formTitle: { fontSize: 25, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.6 },
  formSubtitle: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, marginTop: 5, marginBottom: 24 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF0EF', borderWidth: 1, borderColor: '#F7C9C5', borderRadius: RADIUS.md, padding: 12, marginBottom: 16 },
  errorMark: { width: 22, height: 22, textAlign: 'center', textAlignVertical: 'center', borderRadius: 11, overflow: 'hidden', color: '#B42318', backgroundColor: '#FEE4E2', fontWeight: '900' },
  errorText: { flex: 1, color: '#B42318', fontSize: 13, lineHeight: 19 },
  inputGroup: { marginBottom: 17 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 15, paddingVertical: 14, fontSize: 15, color: COLORS.textPrimary, backgroundColor: '#FFFCF8' },
  showPassword: { color: COLORS.accent, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  signInButton: { marginTop: 6, borderRadius: RADIUS.md },
  signupRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  signupText: { color: COLORS.textSecondary, fontSize: 13 },
  signupLink: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '800' },
  footer: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginTop: 22 },
})
