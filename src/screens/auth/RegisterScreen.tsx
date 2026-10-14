import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { authApi } from '../../api'
import Button from '../../components/Button'
import BrandLogo from '../../components/BrandLogo'
import { COLORS, RADIUS, SHADOW } from '../../config/theme'

const STEPS = ['Your details', 'Your role', 'Security']

function isValidSouthAfricanMobile(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return /^(?:0[6-8]\d{8}|27[6-8]\d{8})$/.test(digits)
}

function extractDobFromId(id: string): string {
  if (id.length < 6) return ''
  const yy = id.substring(0, 2), mm = id.substring(2, 4), dd = id.substring(4, 6)
  const year = parseInt(yy) > 25 ? `19${yy}` : `20${yy}`
  return `${year}-${mm}-${dd}`
}

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '',
    userType: '', idNumber: '', dateOfBirth: '', address: '',
    password: '', confirmPassword: '',
  })

  const set = (field: string) => (val: string) =>
    setForm(f => ({ ...f, [field]: val }))

  const handleIdChange = (val: string) =>
    setForm(f => ({ ...f, idNumber: val, dateOfBirth: extractDobFromId(val) }))

  const canNext = () => {
    if (step === 1) return !!(form.firstName.trim() && form.lastName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && form.phoneNumber.replace(/\D/g, '').length === 10)
    if (step === 2) return !!(form.userType && /^\d{13}$/.test(form.idNumber) && form.address.trim())
    return false
  }

  const handleSubmit = async () => {
    if (!acceptedTerms) { setError('Please agree to the terms and privacy notice to continue.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    try {
      const res = await authApi.register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phoneNumber: form.phoneNumber,
        userType: form.userType, idNumber: form.idNumber,
        dateOfBirth: form.dateOfBirth, address: form.address,
        password: form.password,
      })
      if (res.data.success) {
        Alert.alert('Account Created!', 'Please sign in to continue.', [
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ])
      } else {
        setError(res.data.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const ROLES = [
    { value: 'creator', icon: '📋', label: 'Task Creator', desc: 'Post tasks for others' },
    { value: 'runner', icon: '🏃', label: 'Task Runner', desc: 'Complete tasks & earn' },
    { value: 'both', icon: '🤝', label: 'Both', desc: 'Post & complete tasks' },
  ]

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 }}>
          <BrandLogo size={42} />
          <View>
            <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: '900' }}>DoForYou</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 3 }}>SMALL TASKS. STRONGER COMMUNITIES.</Text>
          </View>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Join your community.</Text>
          <Text style={styles.panelSub}>Create one account to post tasks, find work, and get things moving.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create Account</Text>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {STEPS.map((s, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  step > i + 1 && styles.stepDone,
                  step === i + 1 && styles.stepActive,
                ]}>
                  <Text style={[styles.stepNum, step >= i + 1 && styles.stepNumActive]}>
                    {step > i + 1 ? '✓' : i + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, step === i + 1 && styles.stepLabelActive]}>{s}</Text>
                {i < STEPS.length - 1 && <View style={[styles.stepLine, step > i + 1 && styles.stepLineDone]} />}
              </View>
            ))}
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>First name *</Text>
                  <TextInput style={styles.input} value={form.firstName} onChangeText={set('firstName')} placeholder="John" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Last name *</Text>
                  <TextInput style={styles.input} value={form.lastName} onChangeText={set('lastName')} placeholder="Doe" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email address *</Text>
                <TextInput style={styles.input} value={form.email} onChangeText={set('email')} placeholder="e.g. you@example.com" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" />
                {!!form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && <Text style={styles.validationHint}>Enter a valid email address.</Text>}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone number (South Africa) *</Text>
                <TextInput style={styles.input} value={form.phoneNumber} onChangeText={set('phoneNumber')} placeholder="e.g. 081 234 5678 or +27 81 234 5678" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" maxLength={16} />
                {!!form.phoneNumber && form.phoneNumber.replace(/\D/g, '').length !== 10 && <Text style={styles.validationHint}>Enter a 10-digit South African mobile number.</Text>}
              </View>
              <Button title="Continue →" onPress={() => canNext() && setStep(2)} disabled={!canNext()} fullWidth size="lg" style={styles.stepPrimaryAction} />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.label}>I want to...</Text>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, form.userType === r.value && styles.roleCardSelected]}
                  onPress={() => setForm(f => ({ ...f, userType: r.value }))}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleLabel, form.userType === r.value && styles.roleLabelSelected]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                  {form.userType === r.value && <Text style={{ color: COLORS.primary, fontSize: 18 }}>✓</Text>}
                </TouchableOpacity>
              ))}
              <Text style={styles.label}>ID Number *</Text>
              <TextInput style={styles.input} value={form.idNumber} onChangeText={handleIdChange} placeholder="13-digit SA ID" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" maxLength={13} />
              {form.dateOfBirth ? <Text style={styles.hint}>Date of birth auto-filled: {form.dateOfBirth}</Text> : null}
              <Text style={styles.label}>Address *</Text>
              <TextInput style={styles.input} value={form.address} onChangeText={set('address')} placeholder="123 Main St, Johannesburg" placeholderTextColor={COLORS.textMuted} />
              <View style={styles.navRow}>
                <Button title="← Back" onPress={() => setStep(1)} variant="secondary" style={{ flex: 1 }} />
                <Button title="Continue →" onPress={() => canNext() && setStep(3)} disabled={!canNext()} style={{ flex: 1 }} />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordRow}>
                <TextInput style={[styles.input, { flex: 1 }]} value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPassword} />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput style={styles.input} value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="Repeat password" placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPassword} />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <Text style={styles.errorText}>Passwords don't match</Text>
              )}
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => setAcceptedTerms(value => !value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
                accessibilityLabel="I agree to the terms and privacy notice"
              >
                <View style={[styles.consentBox, acceptedTerms && styles.consentBoxChecked]}>
                  {acceptedTerms && <Text style={styles.consentCheck}>✓</Text>}
                </View>
                <Text style={styles.consentText}>I agree to the DoForYou terms and privacy notice.</Text>
              </TouchableOpacity>
              <View style={styles.navRow}>
                <Button title="← Back" onPress={() => setStep(2)} variant="secondary" style={{ flex: 1 }} />
                <Button title="Create Account" onPress={handleSubmit} loading={loading} disabled={!acceptedTerms || !form.password || form.password !== form.confirmPassword} style={{ flex: 1 }} />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  panel: { backgroundColor: 'transparent', paddingVertical: 0, marginBottom: 12, alignItems: 'flex-start' },
  panelTitle: { fontSize: 25, lineHeight: 30, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 7, letterSpacing: -0.8 },
  panelSub: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 0 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14, minWidth: 80, gap: 6, borderWidth: 1, borderColor: COLORS.border },
  featureIcon: { fontSize: 22, color: COLORS.primaryDark },
  featureLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  formCard: { flexGrow: 1, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 22, padding: 15, ...SHADOW.md },
  stepContent: { flexGrow: 1, gap: 12 },
  stepPrimaryAction: { marginTop: 'auto', minHeight: 52 },
  inputGroup: { gap: 5 },
  validationHint: { fontSize: 11, lineHeight: 15, color: COLORS.danger },
  formTitle: { fontSize: 23, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 10, letterSpacing: -0.4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: { width: 30, height: 30, borderRadius: 12, backgroundColor: COLORS.backgroundDark, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  stepActive: { backgroundColor: COLORS.primary },
  stepDone: { backgroundColor: COLORS.success },
  stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  stepNumActive: { color: COLORS.white },
  stepLabel: { fontSize: 11, lineHeight: 14, color: COLORS.textSecondary, textAlign: 'center' },
  stepLabelActive: { color: COLORS.primaryDark, fontWeight: '800' },
  stepLine: { position: 'absolute', top: 14, left: '60%', right: '-40%', height: 2, backgroundColor: COLORS.border },
  stepLineDone: { backgroundColor: COLORS.success },
  errorBanner: { backgroundColor: '#FFF0EE', borderWidth: 1, borderColor: '#F8D2CE', borderRadius: RADIUS.md, padding: 12, marginBottom: 16 },
  errorText: { color: '#AD2922', fontSize: 13, lineHeight: 18 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 0 },
  hint: { fontSize: 12, color: COLORS.textSecondary },
  input: { minHeight: 45, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: COLORS.textPrimary, backgroundColor: '#FFFEFC' },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 11 },
  roleCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  roleIcon: { fontSize: 24 },
  roleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  roleLabelSelected: { color: COLORS.primaryDark },
  roleDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 'auto', paddingTop: 8 },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn: { paddingHorizontal: 13, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.background },
  switchRow: { marginTop: 'auto', paddingTop: 18, alignItems: 'center' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 14, minHeight: 44 },
  consentBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  consentBoxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  consentCheck: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  consentText: { flex: 1, color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
  switchText: { fontSize: 14, color: COLORS.textSecondary },
  switchLink: { color: COLORS.primaryDark, fontWeight: '800' },
})
