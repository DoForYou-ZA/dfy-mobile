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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.brandHeader}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>dfy</Text></View>
            <Text style={styles.brandName}>DoForYou<Text style={styles.brandDot}>.</Text></Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>YOUR TASKS. YOUR COMMUNITY.</Text>
            <Text style={styles.heroTitle}>Make room for what matters.</Text>
            <Text style={styles.heroSubtitle}>
              Find a helping hand, or turn your skills into your next opportunity.
            </Text>
          </View>
          <View style={styles.orbitOne} />
          <View style={styles.orbitTwo} />
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeading}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Sign in to pick up where you left off.</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
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
              autoCorrect={false}
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
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(v => !v)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
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
            style={styles.submitButton}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>New to DoForYou? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.switchLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustRow}>
            <View style={styles.trustDot} />
            <Text style={styles.trustText}>Made for everyday tasks across South Africa</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  brandHeader: {
    backgroundColor: COLORS.background, minHeight: 292,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? 30 : 42,
    paddingBottom: 48, overflow: 'hidden', position: 'relative',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 1 },
  brandMark: {
    width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }],
    ...SHADOW.primary,
  },
  brandMarkText: { color: COLORS.white, fontSize: 16, fontWeight: '900', letterSpacing: -0.5 },
  brandName: { fontSize: 21, color: COLORS.textPrimary, fontWeight: '800', letterSpacing: -0.6 },
  brandDot: { color: COLORS.primary },
  heroCopy: { marginTop: 34, maxWidth: 350, zIndex: 1 },
  eyebrow: { fontSize: 10, letterSpacing: 1.6, color: COLORS.primaryDark, fontWeight: '800', marginBottom: 12 },
  heroTitle: { fontSize: 34, lineHeight: 39, color: COLORS.textPrimary, fontWeight: '800', letterSpacing: -1 },
  heroSubtitle: { marginTop: 12, fontSize: 15, lineHeight: 23, color: COLORS.textSecondary, maxWidth: 320 },
  orbitOne: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFE8D1', right: -56, top: 118, opacity: 0.75 },
  orbitTwo: { position: 'absolute', width: 82, height: 82, borderRadius: 41, backgroundColor: '#DFF6EF', right: 24, top: 186, opacity: 0.9 },
  formCard: {
    flexGrow: 1, marginTop: -24, marginHorizontal: SPACING.md, padding: SPACING.lg,
    paddingTop: 26, backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.borderLight, borderRadius: 26, ...SHADOW.md,
  },
  formHeading: { marginBottom: 24 },
  formTitle: { fontSize: 25, fontWeight: '800', letterSpacing: -0.5, color: COLORS.textPrimary },
  formSubtitle: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, marginTop: 6 },
  errorBanner: {
    backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F8D5D8',
    borderRadius: RADIUS.md, padding: 12, marginBottom: 18,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
  },
  errorMark: { overflow: 'hidden', color: COLORS.danger, fontWeight: '800', borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 10, width: 20, height: 20, textAlign: 'center', lineHeight: 17 },
  errorText: { color: '#A43340', fontSize: 13, lineHeight: 19, flex: 1 },
  inputGroup: { marginBottom: 17 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    minHeight: 52, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14,
    paddingHorizontal: 15, paddingVertical: 12, fontSize: 15,
    color: COLORS.textPrimary, backgroundColor: '#FFFCF9',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passwordInput: { flex: 1, paddingRight: 8 },
  eyeButton: { minHeight: 48, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: COLORS.backgroundDark },
  eyeText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '800' },
  submitButton: { marginTop: 5, minHeight: 52, borderRadius: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 23 },
  switchText: { fontSize: 13, color: COLORS.textSecondary },
  switchLink: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDark },
  trustRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 26 },
  trustDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  trustText: { fontSize: 11, color: COLORS.textMuted },
})
