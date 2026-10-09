import React, { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { authApi } from '../../api'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING } from '../../config/theme'

const STEPS = ['Your details', 'How you’ll use DFY', 'Secure your account']

function extractDobFromId(id: string): string {
  if (id.length < 6) return ''
  const yy = id.substring(0, 2)
  const mm = id.substring(2, 4)
  const dd = id.substring(4, 6)
  const year = parseInt(yy, 10) > 25 ? `19${yy}` : `20${yy}`
  return `${year}-${mm}-${dd}`
}

const ROLES = [
  { value: 'creator', symbol: '＋', label: 'Post tasks', desc: 'Get help with the things you need done.' },
  { value: 'runner', symbol: '↗', label: 'Complete tasks', desc: 'Put your skills to work and earn.' },
  { value: 'both', symbol: '↔', label: 'Both', desc: 'Post tasks and help others, too.' },
]

type FieldProps = {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  secureTextEntry?: boolean
  autoComplete?: 'off' | 'name' | 'email' | 'tel' | 'street-address' | 'new-password'
}

function Field({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, secureTextEntry, autoComplete,
}: FieldProps) {
  return (
    <View style={s.fieldGroup}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        autoComplete={autoComplete || 'off'}
      />
    </View>
  )
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

  const setField = (field: keyof typeof form) => (value: string) =>
    setForm(current => ({ ...current, [field]: value }))

  const handleIdChange = (value: string) =>
    setForm(current => ({ ...current, idNumber: value, dateOfBirth: extractDobFromId(value) }))

  const canContinue = () => {
    if (step === 1) return !!(form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phoneNumber.trim())
    if (step === 2) return !!(form.userType && form.idNumber.trim() && form.address.trim())
    return !!(form.password && form.confirmPassword)
  }

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phoneNumber.trim()) {
      setStep(1)
      setError('Complete your personal details before creating your account.')
      return
    }
    if (!form.userType || !form.idNumber.trim() || !form.address.trim()) {
      setStep(2)
      setError('Choose how you’ll use DoForYou and complete the required details.')
      return
    }
    if (form.password !== form.confirmPassword) { setError('Your passwords do not match.'); return }
    if (form.password.length < 6) { setError('Use a password with at least 6 characters.'); return }

    setError('')
    setLoading(true)
    try {
      const response = await authApi.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        userType: form.userType,
        idNumber: form.idNumber.trim(),
        dateOfBirth: form.dateOfBirth,
        address: form.address.trim(),
        password: form.password,
      })
      if (response.data.success) {
        Alert.alert('You’re on your way', 'Your DoForYou account is ready. Sign in to continue.', [
          { text: 'Sign in', onPress: () => navigation.navigate('Login') },
        ])
      } else {
        setError(response.data.message || 'We couldn’t create your account. Please try again.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'We couldn’t create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <KeyboardAvoidingView style={s.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.backRow} accessibilityRole="button">
            <Text style={s.backArrow}>‹</Text><Text style={s.backText}>Back to sign in</Text>
          </TouchableOpacity>
          <View style={s.brandRow}>
            <View style={s.brandMark}><Text style={s.brandMarkText}>d</Text><View style={s.brandDot} /></View>
            <Text style={s.brandName}>DoForYou</Text>
          </View>
          <Text style={s.eyebrow}>JOIN YOUR COMMUNITY</Text>
          <Text style={s.heroTitle}>Let’s get you{ '\n' }started.</Text>
          <Text style={s.heroSubtitle}>One account. Two ways to make life a little easier.</Text>
        </View>

        <View style={s.form}>
          <View style={s.stepHeader}>
            <View>
              <Text style={s.stepCount}>STEP 0{step} OF 03</Text>
              <Text style={s.formTitle}>{step === 1 ? 'A little about you' : step === 2 ? 'Make DFY yours' : 'Almost there'}</Text>
            </View>
            <View style={s.progressDots}>
              {STEPS.map((_, index) => (
                <View key={index} style={[s.progressDot, step >= index + 1 && s.progressDotActive]} />
              ))}
            </View>
          </View>
          <Text style={s.formSubtitle}>{STEPS[step - 1]}</Text>

          {error ? (
            <View accessibilityRole="alert" style={s.errorBanner}><Text style={s.errorText}>{error}</Text></View>
          ) : null}

          {step === 1 && (
            <View>
              <View style={s.twoColumns}>
                <View style={{ flex: 1 }}>
                  <Field label="First name" value={form.firstName} onChangeText={setField('firstName')} placeholder="First name" autoComplete="name" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Last name" value={form.lastName} onChangeText={setField('lastName')} placeholder="Last name" autoComplete="name" />
                </View>
              </View>
              <Field label="Email address" value={form.email} onChangeText={setField('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <Field label="Phone number" value={form.phoneNumber} onChangeText={setField('phoneNumber')} placeholder="e.g. 082 123 4567" keyboardType="phone-pad" autoComplete="tel" />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={s.sectionLabel}>I’m here to…</Text>
              <View style={s.roleList}>
                {ROLES.map(role => {
                  const selected = form.userType === role.value
                  return (
                    <TouchableOpacity
                      key={role.value}
                      style={[s.roleCard, selected && s.roleCardSelected]}
                      onPress={() => setField('userType')(role.value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                    >
                      <View style={[s.roleSymbol, selected && s.roleSymbolSelected]}>
                        <Text style={[s.roleSymbolText, selected && s.roleSymbolTextSelected]}>{role.symbol}</Text>
                      </View>
                      <View style={s.roleCopy}>
                        <Text style={s.roleTitle}>{role.label}</Text>
                        <Text style={s.roleDescription}>{role.desc}</Text>
                      </View>
                      <View style={[s.radioOuter, selected && s.radioOuterSelected]}>
                        {selected ? <View style={s.radioInner} /> : null}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
              <Field label="South African ID number" value={form.idNumber} onChangeText={handleIdChange} placeholder="Enter your ID number" keyboardType="number-pad" />
              <Field label="Residential address" value={form.address} onChangeText={setField('address')} placeholder="Street, suburb, city" autoComplete="street-address" />
              <Text style={s.helperText}>Your details help keep the community accountable and safe.</Text>
            </View>
          )}

          {step === 3 && (
            <View>
              <Field label="Create a password" value={form.password} onChangeText={setField('password')} placeholder="At least 6 characters" secureTextEntry={!showPassword} autoComplete="new-password" />
              <Field label="Confirm password" value={form.confirmPassword} onChangeText={setField('confirmPassword')} placeholder="Enter it again" secureTextEntry={!showPassword} autoComplete="new-password" />
              <TouchableOpacity style={s.showPasswordRow} onPress={() => setShowPassword(value => !value)} accessibilityRole="button">
                <View style={[s.checkbox, showPassword && s.checkboxSelected]}>{showPassword ? <Text style={s.checkboxTick}>✓</Text> : null}</View>
                <Text style={s.showPasswordText}>Show passwords</Text>
              </TouchableOpacity>
              <View style={s.securityNote}>
                <Text style={s.securitySymbol}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.securityTitle}>You’re in control</Text>
                  <Text style={s.securityBody}>Use a password you don’t use on other sites. You can update your details later.</Text>
                </View>
              </View>
            </View>
          )}

          <View style={s.actions}>
            {step > 1 ? (
              <Button title="Back" onPress={() => { setError(''); setStep(value => value - 1) }} variant="outline-secondary" size="lg" style={{ flex: 1 }} />
            ) : null}
            {step < 3 ? (
              <Button title="Continue  →" onPress={() => { setError(''); if (canContinue()) setStep(value => value + 1) }} disabled={!canContinue()} size="lg" style={{ flex: 2 }} />
            ) : (
              <Button title="Create account" onPress={handleSubmit} loading={loading} disabled={!canContinue()} size="lg" style={{ flex: 2 }} />
            )}
          </View>

          <TouchableOpacity style={s.signInRow} onPress={() => navigation.navigate('Login')} accessibilityRole="button">
            <Text style={s.signInText}>Already have an account? </Text>
            <Text style={s.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 25 },
  hero: { backgroundColor: COLORS.ink, paddingHorizontal: SPACING.lg, paddingTop: 17, paddingBottom: 29, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 9, paddingRight: 12 },
  backArrow: { color: COLORS.white, fontSize: 27, marginRight: 5, marginTop: -3 },
  backText: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '600' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  brandMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { fontSize: 24, fontWeight: '900', color: COLORS.ink, marginTop: -3 },
  brandDot: { position: 'absolute', right: 5, bottom: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  brandName: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 2.1, color: COLORS.accent, marginTop: 30, marginBottom: 10 },
  heroTitle: { fontSize: 36, lineHeight: 39, fontWeight: '900', letterSpacing: -1.2, color: COLORS.white },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 19, marginTop: 9, maxWidth: 290 },
  form: { paddingHorizontal: SPACING.lg, paddingTop: 28 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepCount: { color: COLORS.primaryDark, letterSpacing: 1.6, fontSize: 9, fontWeight: '900', marginBottom: 6 },
  formTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: -0.7 },
  progressDots: { flexDirection: 'row', gap: 5 },
  progressDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.border },
  progressDotActive: { width: 18, backgroundColor: COLORS.primary },
  formSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 5, marginBottom: 21 },
  errorBanner: { backgroundColor: '#FCECEA', borderWidth: 1, borderColor: '#F2D1CC', borderRadius: RADIUS.sm, padding: 12, marginBottom: 15 },
  errorText: { color: '#9A302B', fontSize: 13, lineHeight: 19 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  fieldGroup: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 7 },
  input: { minHeight: 50, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.surface },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  roleList: { gap: 9, marginBottom: 20 },
  roleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  roleCardSelected: { borderColor: COLORS.primary, backgroundColor: '#FFF6F2' },
  roleSymbol: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.backgroundDark, alignItems: 'center', justifyContent: 'center' },
  roleSymbolSelected: { backgroundColor: COLORS.primaryLight },
  roleSymbolText: { fontSize: 20, color: COLORS.textSecondary, fontWeight: '800' },
  roleSymbolTextSelected: { color: COLORS.primaryDark },
  roleCopy: { flex: 1 },
  roleTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '800' },
  roleDescription: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  helperText: { fontSize: 11, lineHeight: 17, color: COLORS.textMuted, marginTop: -3, marginBottom: 8 },
  showPasswordRow: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', marginVertical: 1, paddingVertical: 7 },
  checkbox: { width: 17, height: 17, borderRadius: 5, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxTick: { color: COLORS.white, fontSize: 11, fontWeight: '900' },
  showPasswordText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  securityNote: { marginTop: 19, padding: 15, borderRadius: RADIUS.md, backgroundColor: '#E8F4EC', borderWidth: 1, borderColor: '#CDE5D5', flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  securitySymbol: { fontSize: 18, fontWeight: '900', color: COLORS.success },
  securityTitle: { fontSize: 12, fontWeight: '900', color: '#225E44' },
  securityBody: { fontSize: 11, color: '#376B53', lineHeight: 17, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  signInRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 23, marginBottom: 22 },
  signInText: { color: COLORS.textSecondary, fontSize: 12 },
  signInLink: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '900' },
})
