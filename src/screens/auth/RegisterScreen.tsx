import React, { useRef, useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { authApi } from '../../api'
import AuthBrandHeader from '../../components/AuthBrandHeader'
import AuthScreenLayout from '../../components/AuthScreenLayout'
import FormField from '../../components/FormField'
import StepIndicator from '../../components/StepIndicator'
import { colors, fonts, radii } from '../../theme'

const STEPS = ['Your details', 'Your role', 'Security']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LEGAL_BASE_URL = process.env.EXPO_PUBLIC_DFY_WEB_URL || 'https://dfy-fe-staging.onrender.com'
const TERMS_URL = `${LEGAL_BASE_URL}/terms`
const PRIVACY_URL = `${LEGAL_BASE_URL}/privacy`
const TERMS_VERSION = 'terms-v1'
const PRIVACY_VERSION = 'privacy-v1'

function extractDobFromId(id: string): string {
  if (!/^\d{6}/.test(id)) return ''
  const yy = Number(id.slice(0, 2))
  const month = Number(id.slice(2, 4))
  const day = Number(id.slice(4, 6))
  const today = new Date()
  const currentCentury = Math.floor(today.getFullYear() / 100) * 100
  for (const year of [currentCentury + yy, currentCentury + yy - 100]) {
    const dob = new Date(Date.UTC(year, month - 1, day))
    if (dob.getUTCFullYear() !== year || dob.getUTCMonth() !== month - 1 || dob.getUTCDate() !== day) return ''
    let age = today.getUTCFullYear() - year
    const birthdayPassed = today.getUTCMonth() > month - 1 || (today.getUTCMonth() === month - 1 && today.getUTCDate() >= day)
    if (!birthdayPassed) age--
    if (age >= 18 && age <= 110 && dob.getTime() <= Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) {
      return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0')
    }
  }
  return ''
}

function isValidSouthAfricanId(id: string): boolean {
  if (!/^\d{13}$/.test(id) || !extractDobFromId(id)) return false
  let sum = 0
  for (let i = 0; i < id.length; i++) {
    let digit = Number(id[i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

/**
 * Accepts "081 234 5678", "81 234 5678" or "+27 81 234 5678" and returns the local
 * format the app has always sent to the API ("0812345678"), or null if invalid.
 * If your backend expects "+27812345678", change the return to `+27${d}`.
 */
function toLocalSouthAfricanNumber(input: string): string | null {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('27')) d = d.slice(2)
  else if (d.startsWith('0')) d = d.slice(1)
  return /^[6-8]\d{8}$/.test(d) ? `0${d}` : null
}

const ROLES = [
  { value: 'creator', icon: 'clipboard-outline', label: 'Task Creator', desc: 'Post tasks for others' },
  { value: 'runner', icon: 'walk-outline', label: 'Task Runner', desc: 'Complete tasks & earn' },
  { value: 'both', icon: 'people-outline', label: 'Both', desc: 'Post & complete tasks' },
] as const

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phoneNumber: '',
    userType: '', idNumber: '', dateOfBirth: '', address: '',
    password: '', confirmPassword: '',
  })

  const lastRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const addressRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)

  const set = (field: string) => (val: string) => setForm((f: typeof form) => ({ ...f, [field]: val }))

  const handleIdChange = (val: string) => {
    const digits = val.replace(/\D/g, '')
    setForm((f: typeof form) => ({ ...f, idNumber: digits, dateOfBirth: extractDobFromId(digits) }))
  }

  const finishValidation = (next: Record<string, string>) => {
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Enter your first name.'
    if (!form.lastName.trim()) e.lastName = 'Enter your last name.'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!toLocalSouthAfricanNumber(form.phoneNumber)) e.phoneNumber = 'Enter a valid South African mobile number.'
    return finishValidation(e)
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!form.userType) e.userType = 'Choose how you want to use DoForYou.'
    if (!isValidSouthAfricanId(form.idNumber)) e.idNumber = 'Enter a valid 13-digit South African ID number for an adult aged 18 or older.'
    if (!form.address.trim()) e.address = 'Enter your address.'
    return finishValidation(e)
  }

  const validateStep3 = () => {
    const e: Record<string, string> = {}
    if (form.password.length < 12 || form.password.length > 72) e.password = 'Use a password between 12 and 128 characters.'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'
    return finishValidation(e)
  }

  const goBack = () => {
    setError('')
    setErrors({})
    if (step === 1) navigation.navigate('Login')
    else setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (loading) return
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('Please accept the Terms & Conditions and acknowledge the Privacy Policy to continue.')
      return
    }
    if (!validateStep3()) return
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), phoneNumber: toLocalSouthAfricanNumber(form.phoneNumber) ?? form.phoneNumber,
        userType: form.userType, idNumber: form.idNumber,
        dateOfBirth: form.dateOfBirth, address: form.address.trim(),
        password: form.password,
        termsAccepted: acceptedTerms, privacyAccepted: acceptedPrivacy,
        termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION,
        marketingConsent,
      })
      if (res.data.success) {
        Alert.alert('Account Created!', 'Please sign in to continue.', [
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        ])
      } else {
        setError(res.data.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrimary = () => {
    if (step === 1) { if (validateStep1()) setStep(2) }
    else if (step === 2) { if (validateStep2()) setStep(3) }
    else handleSubmit()
  }

  const openLink = (url: string) => {
    void Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open link', `Please open ${url} in your browser.`)
    })
  }

  const footer = (
    <View>
      {step === 3 && (
        <View>
          <View style={styles.consentRow}>
            <Pressable
              onPress={() => setAcceptedTerms(value => !value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              accessibilityLabel="Accept the Terms and Conditions"
              style={styles.consentCheckboxTouch}
            >
              <View style={[styles.consentBox, acceptedTerms && styles.consentBoxChecked]}>
                {acceptedTerms && <Ionicons name="checkmark" size={15} color={colors.text} />}
              </View>
            </Pressable>
            <Text style={styles.terms}>
              I accept the DoForYou{' '}
              <Text style={styles.link} onPress={() => openLink(TERMS_URL)} accessibilityRole="link">
                Terms & Conditions
              </Text>.
            </Text>
          </View>
          <View style={styles.consentRow}>
            <Pressable
              onPress={() => setAcceptedPrivacy(value => !value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedPrivacy }}
              accessibilityLabel="Acknowledge the Privacy Policy"
              style={styles.consentCheckboxTouch}
            >
              <View style={[styles.consentBox, acceptedPrivacy && styles.consentBoxChecked]}>
                {acceptedPrivacy && <Ionicons name="checkmark" size={15} color={colors.text} />}
              </View>
            </Pressable>
            <Text style={styles.terms}>
              I acknowledge the DoForYou{' '}
              <Text style={styles.link} onPress={() => openLink(PRIVACY_URL)} accessibilityRole="link">
                Privacy Policy
              </Text>.
            </Text>
          </View>
          <View style={styles.consentRow}>
            <Pressable
              onPress={() => setMarketingConsent(value => !value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: marketingConsent }}
              accessibilityLabel="Receive optional marketing updates"
              style={styles.consentCheckboxTouch}
            >
              <View style={[styles.consentBox, marketingConsent && styles.consentBoxChecked]}>
                {marketingConsent && <Ionicons name="checkmark" size={15} color={colors.text} />}
              </View>
            </Pressable>
            <Text style={styles.terms}>Send me optional DoForYou product updates and offers.</Text>
          </View>
        </View>
      )}

      <Pressable
        style={({ pressed }: { pressed: boolean }) => [styles.button, pressed && !loading && styles.pressed, loading && styles.loading]}
        onPress={handlePrimary}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={step === 3 ? 'Create account' : 'Continue'}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <View style={styles.buttonInner}>
            <Text style={styles.buttonText}>{step === 3 ? 'Create Account' : 'Continue'}</Text>
            <Ionicons name={step === 3 ? 'checkmark' : 'arrow-forward'} size={18} color={colors.text} />
          </View>
        )}
      </Pressable>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8} accessibilityRole="link" style={styles.switchLink}>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  )

  return (
    <AuthScreenLayout footer={footer}>
      <AuthBrandHeader />

      <View style={styles.headingRow}>
        <Pressable
          onPress={goBack}
          style={styles.back}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={step === 1 ? 'Back to sign in' : 'Back to previous step'}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.heading}>Join your community.</Text>
      </View>

      <Text style={styles.subtitle}>Create one account to post tasks, find work, and get things moving.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Account</Text>
        <StepIndicator steps={STEPS} current={step - 1} />

        {!!error && (
          <View style={styles.errorBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {step === 1 && (
          <View>
            <View style={styles.nameRow}>
              <FormField
                label="First name *"
                value={form.firstName}
                onChangeText={set('firstName')}
                error={errors.firstName}
                placeholder="John"
                autoCapitalize="words"
                autoComplete="given-name"
                textContentType="givenName"
                returnKeyType="next"
                onSubmitEditing={() => lastRef.current?.focus()}
                containerStyle={styles.half}
              />
              <FormField
                ref={lastRef}
                label="Last name *"
                value={form.lastName}
                onChangeText={set('lastName')}
                error={errors.lastName}
                placeholder="Doe"
                autoCapitalize="words"
                autoComplete="family-name"
                textContentType="familyName"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                containerStyle={styles.half}
              />
            </View>
            <FormField
              ref={emailRef}
              label="Email address *"
              value={form.email}
              onChangeText={set('email')}
              error={errors.email}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <FormField
              ref={phoneRef}
              label="Phone number (South Africa) *"
              prefix="+27"
              value={form.phoneNumber}
              onChangeText={set('phoneNumber')}
              error={errors.phoneNumber}
              placeholder="81 234 5678"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={14}
              returnKeyType="done"
              onSubmitEditing={handlePrimary}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.groupLabel}>I want to...</Text>
            {ROLES.map((r) => {
              const selected = form.userType === r.value
              return (
                <Pressable
                  key={r.value}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                  onPress={() => setForm((f: typeof form) => ({ ...f, userType: r.value }))}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${r.label}. ${r.desc}`}
                >
                  <View style={[styles.roleIcon, selected && styles.roleIconSelected]}>
                    <Ionicons name={r.icon} size={22} color={selected ? colors.button : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color={colors.orange} />}
                </Pressable>
              )
            })}
            {!!errors.userType && <Text style={styles.fieldError}>{errors.userType}</Text>}

            <FormField
              label="ID number *"
              value={form.idNumber}
              onChangeText={handleIdChange}
              error={errors.idNumber}
              placeholder="13-digit SA ID"
              keyboardType="number-pad"
              maxLength={13}
              returnKeyType="next"
              onSubmitEditing={() => addressRef.current?.focus()}
              containerStyle={{ marginTop: 14, marginBottom: form.dateOfBirth ? 4 : 14 }}
            />
            {!!form.dateOfBirth && <Text style={styles.hint}>Date of birth auto-filled: {form.dateOfBirth}</Text>}

            <FormField
              ref={addressRef}
              label="Address *"
              value={form.address}
              onChangeText={set('address')}
              error={errors.address}
              placeholder="123 Main St, Johannesburg"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
              returnKeyType="done"
              onSubmitEditing={handlePrimary}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <FormField
              label="Password *"
              value={form.password}
              onChangeText={set('password')}
              error={errors.password}
              placeholder="Min 6 characters"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              right={
                <Pressable
                  onPress={() => setShowPassword((v: boolean) => !v)}
                  style={styles.eye}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.textSecondary} />
                </Pressable>
              }
            />
            <FormField
              ref={confirmRef}
              label="Confirm password *"
              value={form.confirmPassword}
              onChangeText={set('confirmPassword')}
              error={errors.confirmPassword}
              placeholder="Repeat password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>
        )}
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  back: {
    position: 'absolute', left: 0, top: 0, zIndex: 1, width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  headingRow: { position: 'relative', minHeight: 44, justifyContent: 'center', marginTop: 20 },
  heading: { fontFamily: fonts.medium, fontSize: 22, lineHeight: 28, color: colors.text, textAlign: 'center', paddingHorizontal: 44 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radii.card, padding: 18, marginTop: 20,
  },
  cardTitle: { fontFamily: fonts.medium, fontSize: 18, color: colors.text, textAlign: 'center' },
  errorBox: { padding: 12, borderRadius: 10, backgroundColor: colors.errorBg, marginBottom: 14 },
  errorText: { fontFamily: fonts.regular, fontSize: 13, color: colors.error },
  nameRow: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, minWidth: 0 },
  groupLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.text, marginBottom: 8 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5,
    borderColor: colors.inputBorder, backgroundColor: colors.surface,
    borderRadius: radii.input + 2, padding: 12, marginBottom: 10, minHeight: 64,
  },
  roleCardSelected: { borderColor: colors.orange, backgroundColor: '#FFF1E5' },
  roleIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF1E5',
    alignItems: 'center', justifyContent: 'center',
  },
  roleIconSelected: { backgroundColor: colors.iconCircle },
  roleLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  roleLabelSelected: { color: colors.button },
  roleDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  fieldError: { fontFamily: fonts.regular, fontSize: 12, color: colors.error, marginTop: -4 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginBottom: 14 },
  eye: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  consentCheckboxTouch: { width: 28, minHeight: 28, alignItems: 'center', justifyContent: 'center' },
  consentBox: {
    width: 20, height: 20, borderWidth: 1.5, borderColor: colors.inputBorder,
    borderRadius: 5, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  consentBoxChecked: { backgroundColor: colors.button, borderColor: colors.button },
  terms: { flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  link: { fontFamily: fonts.medium, fontSize: 13, color: colors.button },
  button: {
    height: 52, borderRadius: radii.button, backgroundColor: colors.button,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  pressed: { opacity: 0.88 },
  loading: { opacity: 0.8 },
  switchRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6 },
  switchText: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  switchLink: { minHeight: 44, justifyContent: 'center' },
})
