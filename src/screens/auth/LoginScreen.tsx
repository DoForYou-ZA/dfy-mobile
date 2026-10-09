import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING } from '../../config/theme'

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email address and password to continue.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'We couldn’t sign you in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <View style={s.orbLarge} />
          <View style={s.orbSmall} />
          <View style={s.brandRow}>
            <View style={s.brandMark}><Text style={s.brandMarkLetter}>d</Text><View style={s.brandMarkDot} /></View>
            <Text style={s.brandName}>DoForYou</Text>
          </View>

          <View style={s.heroCopy}>
            <Text style={s.eyebrow}>YOUR TIME, YOUR WAY</Text>
            <Text style={s.heroTitle}>Make room for{ '\n' }what matters.</Text>
            <Text style={s.heroSub}>Get things done together. Find a task, lend a hand, and keep life moving.</Text>
          </View>
          <View style={s.heroFoot}>
            <View style={s.heroLine} />
            <Text style={s.heroFootText}>A community that gets it done.</Text>
          </View>
        </View>

        <View style={s.formArea}>
          <Text style={s.formTitle}>Welcome back</Text>
          <Text style={s.formSubtitle}>Sign in to pick up where you left off.</Text>

          {error ? (
            <View accessibilityRole="alert" style={s.errorBanner}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={s.inputGroup}>
            <Text style={s.label}>Email address</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Password</Text>
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, s.passwordInput]}
                placeholder="Your password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                style={s.showButton}
                onPress={() => setShowPassword(v => !v)}
              >
                <Text style={s.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Sign in  →"
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password}
            fullWidth
            size="lg"
            style={s.signIn}
          />

          <TouchableOpacity
            accessibilityRole="button"
            style={s.switchRow}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={s.switchText}>New to DoForYou? </Text>
            <Text style={s.switchLink}>Create an account</Text>
          </TouchableOpacity>

          <Text style={s.terms}>By signing in, you agree to use DoForYou respectfully and safely.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  hero: {
    backgroundColor: COLORS.ink,
    minHeight: 360,
    paddingHorizontal: SPACING.lg,
    paddingTop: 28,
    paddingBottom: 26,
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  orbLarge: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    right: -100, top: 74, backgroundColor: COLORS.inkSoft, opacity: 0.85,
  },
  orbSmall: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    right: 38, top: 152, backgroundColor: COLORS.primary, opacity: 0.96,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  brandMarkLetter: { fontSize: 25, fontWeight: '900', color: COLORS.ink, marginTop: -3 },
  brandMarkDot: { position: 'absolute', right: 6, bottom: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  brandName: { color: COLORS.white, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  heroCopy: { marginTop: 44, maxWidth: 290, zIndex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.2, color: COLORS.accent, marginBottom: 12 },
  heroTitle: { fontSize: 38, fontWeight: '800', letterSpacing: -1.3, color: COLORS.white, lineHeight: 42, marginBottom: 12 },
  heroSub: { fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.73)', maxWidth: 275 },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 26 },
  heroLine: { width: 22, height: 3, borderRadius: 2, backgroundColor: COLORS.primary },
  heroFootText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.76)' },
  formArea: { paddingHorizontal: SPACING.lg, paddingTop: 27, paddingBottom: 34 },
  formTitle: { fontSize: 25, lineHeight: 31, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.7 },
  formSubtitle: { fontSize: 14, lineHeight: 20, color: COLORS.textSecondary, marginTop: 5, marginBottom: 22 },
  errorBanner: { backgroundColor: '#FCECEA', borderWidth: 1, borderColor: '#F2D1CC', borderRadius: RADIUS.sm, padding: 13, marginBottom: 16 },
  errorText: { fontSize: 13, color: '#9A302B', lineHeight: 19 },
  inputGroup: { marginBottom: 17 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    minHeight: 52, paddingHorizontal: 15, paddingVertical: 13, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: RADIUS.sm, fontSize: 15,
    color: COLORS.textPrimary, backgroundColor: COLORS.surface,
  },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  passwordInput: { flex: 1 },
  showButton: { paddingHorizontal: 13, minHeight: 50, justifyContent: 'center', borderRadius: RADIUS.sm, backgroundColor: COLORS.backgroundDark },
  showText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '800' },
  signIn: { marginTop: 7 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 23, flexWrap: 'wrap' },
  switchText: { fontSize: 13, color: COLORS.textSecondary },
  switchLink: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDark },
  terms: { marginTop: 25, fontSize: 11, lineHeight: 17, textAlign: 'center', color: COLORS.textMuted },
})
