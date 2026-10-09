import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native'
import { authApi } from '../../api'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../../config/theme'

const STEPS = ['Personal Info', 'Role & Details', 'Security']

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
    if (step === 1) return !!(form.firstName && form.lastName && form.email && form.phoneNumber)
    if (step === 2) return !!(form.userType && form.idNumber && form.address)
    return false
  }

  const handleSubmit = async () => {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 28 }}>
          <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.primary }}>
            <Text style={{ color: COLORS.white, fontSize: 27, fontWeight: '900' }}>D</Text>
          </View>
          <View>
            <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: '900' }}>DoForYou</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 3 }}>HELPING YOUR COMMUNITY MOVE</Text>
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
            <View style={{ gap: 12 }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput style={styles.input} value={form.firstName} onChangeText={set('firstName')} placeholder="John" placeholderTextColor={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput style={styles.input} value={form.lastName} onChangeText={set('lastName')} placeholder="Doe" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput style={styles.input} value={form.email} onChangeText={set('email')} placeholder="your@email.com" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput style={styles.input} value={form.phoneNumber} onChangeText={set('phoneNumber')} placeholder="0812345678" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" />
              <Button title="Continue →" onPress={() => canNext() && setStep(2)} disabled={!canNext()} fullWidth size="lg" style={{ marginTop: 8 }} />
            </View>
          )}

          {step === 2 && (
            <View style={{ gap: 12 }}>
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
            <View style={{ gap: 12 }}>
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
              <View style={styles.navRow}>
                <Button title="← Back" onPress={() => setStep(2)} variant="secondary" style={{ flex: 1 }} />
                <Button title="Create Account" onPress={handleSubmit} loading={loading} disabled={!form.password || form.password !== form.confirmPassword} style={{ flex: 1 }} />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.switchRow} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 26 },
  panel: { backgroundColor: 'transparent', paddingVertical: 0, marginBottom: 22, alignItems: 'flex-start' },
  panelTitle: { fontSize: 31, lineHeight: 36, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 7, letterSpacing: -0.8 },
  panelSub: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 0 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14, minWidth: 80, gap: 6, borderWidth: 1, borderColor: COLORS.border },
  featureIcon: { fontSize: 22, color: COLORS.primaryDark },
  featureLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  formCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 25, padding: 20, ...SHADOW.md },
  formTitle: { fontSize: 23, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.md, letterSpacing: -0.4 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepCircle: { width: 30, height: 30, borderRadius: 12, backgroundColor: COLORS.backgroundDark, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  stepActive: { backgroundColor: COLORS.primary },
  stepDone: { backgroundColor: COLORS.success },
  stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  stepNumActive: { color: COLORS.white },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
  stepLabelActive: { color: COLORS.primaryDark, fontWeight: '800' },
  stepLine: { position: 'absolute', top: 14, left: '60%', right: '-40%', height: 2, backgroundColor: COLORS.border },
  stepLineDone: { backgroundColor: COLORS.success },
  errorBanner: { backgroundColor: '#FFF0EE', borderWidth: 1, borderColor: '#F8D2CE', borderRadius: RADIUS.md, padding: 12, marginBottom: 16 },
  errorText: { color: '#AD2922', fontSize: 13, lineHeight: 18 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 7 },
  hint: { fontSize: 12, color: COLORS.textSecondary },
  input: { minHeight: 49, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: COLORS.textPrimary, backgroundColor: '#FFFEFC' },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14 },
  roleCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  roleIcon: { fontSize: 24 },
  roleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  roleLabelSelected: { color: COLORS.primaryDark },
  roleDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn: { paddingHorizontal: 13, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.background },
  switchRow: { marginTop: SPACING.lg, alignItems: 'center' },
  switchText: { fontSize: 14, color: COLORS.textSecondary },
  switchLink: { color: COLORS.primaryDark, fontWeight: '800' },
})
