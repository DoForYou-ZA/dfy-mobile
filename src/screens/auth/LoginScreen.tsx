import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
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
    setError(''); setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Orange gradient panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Welcome Back!</Text>
          <Text style={styles.panelSub}>Sign in to continue your DoForYou journey</Text>
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureLabel}>Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureLabel}>Fast</Text>
            </View>
          </View>
        </View>

        {/* White form card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSubtitle}>Enter your credentials to access your account</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
            fullWidth
            size="lg"
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.switchText}>
              Don't have an account?{' '}
              <Text style={styles.switchLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flexGrow: 1 },
  panel: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  panelSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  features: { flexDirection: 'row', gap: 16 },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    padding: 16,
    minWidth: 80,
    gap: 8,
  },
  featureIcon: { fontSize: 24 },
  featureLabel: { fontSize: 13, fontWeight: '500', color: COLORS.white },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: SPACING.lg,
    paddingTop: 28,
    flex: 1,
    marginTop: -20,
    ...SHADOW.lg,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#991B1B', fontSize: 14 },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn: {
    padding: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  eyeText: { fontSize: 16 },
  switchRow: { marginTop: SPACING.lg, alignItems: 'center' },
  switchText: { fontSize: 14, color: COLORS.textSecondary },
  switchLink: { color: COLORS.primary, fontWeight: '600' },
})
