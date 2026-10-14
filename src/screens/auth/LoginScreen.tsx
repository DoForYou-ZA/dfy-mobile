import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Linking, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import AuthBrandHeader from '../../components/AuthBrandHeader'
import { COLORS, RADIUS, SHADOW } from '../../config/theme'

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthBrandHeader />

        <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Good things happen when we help.</Text>
          <Text style={styles.heroSubtitle}>
            Find a helping hand, offer your skills, and get everyday things moving.
          </Text>
          
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeading}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Sign in to pick up where you left off.</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <View style={styles.errorMark}><Text style={styles.errorMarkText}>!</Text></View>
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
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.revealButton}
                onPress={() => setShowPassword(value => !value)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.revealText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => {
              const subject = encodeURIComponent('Password reset assistance')
              const accountEmail = email.trim() || '(please add the email address for my account)'
              const body = encodeURIComponent(
                `Hello DoForYou Support,\n\nI need help regaining access to my account. Please advise me on the secure next steps to reset my password.\n\nAccount email: ${accountEmail}\n\nThank you.`
              )
              void Linking.openURL(`mailto:info@doforyou.co.za?subject=${subject}&body=${body}`).catch(() => {
                Alert.alert(
                  'Contact DoForYou support',
                  'We could not open your email app. Please email info@doforyou.co.za with the subject “Password reset assistance”.'
                )
              })
            }}
            accessibilityRole="button"
            accessibilityLabel="Request password reset help from DoForYou support"
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign in to DFY  →"
            onPress={handleLogin}
            loading={loading}
            disabled={!email.trim() || !password}
            fullWidth
            size="lg"
            style={styles.signInButton}
          />

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.75}
          >
            <Text style={styles.switchText}>New to DoForYou? </Text>
            <Text style={styles.switchLink}>Create an account</Text>
          </TouchableOpacity>

          <View style={styles.trustRow}>
            <View style={styles.trustDot} />
            <Text style={styles.trustText}>Your tasks and payments are managed securely.</Text>
          </View>
        </View>
        <Text style={styles.footer}>A South African task marketplace.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 },
    brandName: { color: COLORS.textPrimary, fontSize: 19, fontWeight: '900', letterSpacing: -0.5 },
  brandTagline: { color: COLORS.textSecondary, fontSize: 8, fontWeight: '800', letterSpacing: 0.8, marginTop: 3 },
  hero: { width: '100%', maxWidth: 460, marginBottom: 16, position: 'relative' },
  heroTitle: {
    color: COLORS.textPrimary, fontSize: 27, lineHeight: 31, fontWeight: '900',
    letterSpacing: -0.7, marginBottom: 6, maxWidth: 390, zIndex: 1,
  },
  heroSubtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, maxWidth: 340, zIndex: 1 },
  formCard: {
    width: '100%', maxWidth: 460, backgroundColor: COLORS.surface, borderRadius: 22, padding: 18,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.md,
  },
  formHeading: { marginBottom: 12 },
  formTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: -0.6, marginBottom: 5 },
  formSubtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: '#FFF0EE', borderColor: '#F8D2CE', borderWidth: 1,
    borderRadius: RADIUS.md, padding: 12, marginBottom: 16,
  },
  errorMark: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FBD6D2', alignItems: 'center', justifyContent: 'center' },
  errorMarkText: { color: '#AD2922', fontWeight: '900', fontSize: 13 },
  errorText: { color: '#AD2922', fontSize: 12, flex: 1, lineHeight: 18 },
  inputGroup: { marginBottom: 11 },
  label: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 5 },
  input: {
    width: '100%', minHeight: 46, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 15, paddingVertical: 12,
    fontSize: 14, color: COLORS.textPrimary, backgroundColor: '#FFFEFC',
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: '#FFFEFC',
  },
  passwordInput: { flex: 1, minHeight: 46, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  revealButton: { paddingHorizontal: 14, paddingVertical: 10 },
  revealText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '800' },
  signInButton: { marginTop: 2, borderRadius: RADIUS.md, minHeight: 52 },
  forgotRow: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  forgotText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 12, paddingVertical: 4 },
  switchText: { color: COLORS.textSecondary, fontSize: 12 },
  switchLink: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '900' },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10 },
  trustDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  trustText: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },
  footer: { width: '100%', maxWidth: 460, textAlign: 'center', marginTop: 'auto', paddingTop: 18, color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
})
