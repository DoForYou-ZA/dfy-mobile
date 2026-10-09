import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView
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
    if (!email.trim() || !password) {
      setError('Enter your email address and password to continue.')
      return
    }
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
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <View style={s.brandRow}>
            <View style={s.logoMark}><Text style={s.logoLetter}>D</Text><View style={s.logoDot} /></View>
            <View>
              <Text style={s.brand}>DoForYou</Text>
              <Text style={s.brandCaption}>TASKS MADE EASIER</Text>
            </View>
          </View>

          <View style={s.heroCopy}>
            <View style={s.eyebrow}><View style={s.eyebrowDot} /><Text style={s.eyebrowText}>YOUR COMMUNITY, IN MOTION</Text></View>
            <Text style={s.title}>Good things{ '\n' }get done together.</Text>
            <Text style={s.subtitle}>Find a helping hand, or turn your skills into an opportunity.</Text>
          </View>

          <View style={s.artRow} pointerEvents="none">
            <View style={s.artCircleOne} />
            <View style={s.artCircleTwo} />
            <View style={s.artCard}>
              <View style={s.artCheck}><Text style={s.artCheckText}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.artCardTitle}>A little help goes a long way</Text>
                <Text style={s.artCardSub}>Post a task. Find your person.</Text>
              </View>
              <Text style={s.artSpark}>✦</Text>
            </View>
          </View>
        </View>

        <View style={s.formWrap}>
          <View style={s.formHeadingRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.formTitle}>Welcome back</Text>
              <Text style={s.formSubtitle}>Sign in to pick up where you left off.</Text>
            </View>
            <View style={s.signinMark}><Text style={s.signinMarkText}>↗</Text></View>
          </View>

          {error ? (
            <View style={s.errorBanner} accessibilityRole="alert">
              <Text style={s.errorLabel}>Couldn't sign you in</Text>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={s.field}>
            <Text style={s.label}>Email address</Text>
            <TextInput
              style={s.input}
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

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, s.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
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
            title="Sign in"
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password}
            fullWidth
            size="lg"
            style={s.submit}
          />

          <View style={s.signupRow}>
            <Text style={s.signupText}>New to DoForYou?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} accessibilityRole="button">
              <Text style={s.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          <View style={s.trustRow}>
            <Text style={s.trustDot}>✓</Text>
            <Text style={s.trustText}>Built for local tasks and real opportunities in South Africa</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 18 },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    backgroundColor: '#FFF0E2',
    overflow: 'hidden',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoMark: {
    width: 46, height: 46, borderRadius: 16, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    ...SHADOW.primary,
  },
  logoLetter: { color: '#FFFFFF', fontSize: 28, lineHeight: 32, fontWeight: '900' },
  logoDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent, right: 7, bottom: 7 },
  brand: { color: COLORS.textPrimary, fontWeight: '900', fontSize: 20, letterSpacing: -0.5 },
  brandCaption: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1.8, marginTop: 2 },
  heroCopy: { marginTop: 30 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary },
  eyebrowText: { fontSize: 10, letterSpacing: 1.5, color: COLORS.primaryDark, fontWeight: '800' },
  title: { color: COLORS.textPrimary, fontSize: 34, fontWeight: '900', lineHeight: 39, letterSpacing: -1.2 },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 11, maxWidth: 320 },
  artRow: { minHeight: 86, justifyContent: 'center', marginTop: 22 },
  artCircleOne: { position: 'absolute', right: -12, top: -8, width: 104, height: 104, borderRadius: 52, backgroundColor: '#FFDAB8', opacity: 0.8 },
  artCircleTwo: { position: 'absolute', right: 26, top: 8, width: 62, height: 62, borderRadius: 31, backgroundColor: '#FFE6A3', opacity: 0.9 },
  artCard: {
    flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20, marginRight: 35, ...SHADOW.sm,
  },
  artCheck: { width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center' },
  artCheckText: { color: COLORS.success, fontWeight: '900', fontSize: 18 },
  artCardTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 12 },
  artCardSub: { color: COLORS.textSecondary, marginTop: 3, fontSize: 11 },
  artSpark: { color: COLORS.primary, fontSize: 24, marginLeft: 'auto' },
  formWrap: {
    flex: 1, marginTop: -6, backgroundColor: COLORS.surface,
    paddingHorizontal: 24, paddingTop: 26, paddingBottom: 24,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.md,
  },
  formHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  formTitle: { fontSize: 25, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  formSubtitle: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary, marginTop: 4 },
  signinMark: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center' },
  signinMarkText: { fontSize: 24, color: COLORS.primaryDark, fontWeight: '700' },
  errorBanner: { backgroundColor: COLORS.dangerLight, borderWidth: 1, borderColor: '#F7D3D0', borderRadius: 16, padding: 14, marginBottom: 18 },
  errorLabel: { fontSize: 13, color: COLORS.dangerDark, fontWeight: '800', marginBottom: 4 },
  errorText: { color: COLORS.dangerDark, fontSize: 13, lineHeight: 18 },
  field: { marginBottom: 17 },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  input: { minHeight: 52, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, paddingHorizontal: 15, fontSize: 15, color: COLORS.textPrimary, backgroundColor: '#FFFEFC' },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  passwordInput: { flex: 1 },
  showButton: { minHeight: 52, paddingHorizontal: 13, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  showText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '800' },
  submit: { marginTop: 5 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 23 },
  signupText: { color: COLORS.textSecondary, fontSize: 13 },
  signupLink: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '800' },
  trustRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 26, paddingTop: 17, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  trustDot: { color: COLORS.success, fontSize: 13, fontWeight: '900' },
  trustText: { flex: 1, textAlign: 'center', color: COLORS.textMuted, fontSize: 10, lineHeight: 15 },
})
