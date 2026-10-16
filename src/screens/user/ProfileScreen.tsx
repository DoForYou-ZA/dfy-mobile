import SignOutButton from '../../components/SignOutButton'
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { authApi, userPreferencesApi } from '../../api'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../../config/theme'

const USER_TYPES = [
  { value: 'creator', label: '📋 Task Creator', desc: 'Post tasks and hire helpers' },
  { value: 'runner', label: '🏃 Task Runner', desc: 'Find and complete tasks to earn' },
  { value: 'both', label: '🤝 Both', desc: 'Full access to post and complete tasks' },
]

export default function ProfileScreen({ navigation }: any) {
  const { user, refreshUser, logout } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', userType: '', address: '' })
  const [hasIdNumber, setHasIdNumber] = useState(false)
  const [idNumberLastFour, setIdNumberLastFour] = useState('')
  const [identityVerificationStatus, setIdentityVerificationStatus] = useState('not_started')
  const [authenticatorTwoFactorEnabled, setAuthenticatorTwoFactorEnabled] = useState(false)
  const [canAcceptTasks, setCanAcceptTasks] = useState(false)
  const [hasVerifiedPayoutAccount, setHasVerifiedPayoutAccount] = useState(false)
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [totpConfigured, setTotpConfigured] = useState(false)
  const [totpRemainingCodes, setTotpRemainingCodes] = useState(0)
  const [totpSecret, setTotpSecret] = useState('')
  const [totpProvisioningUri, setTotpProvisioningUri] = useState('')
  const [totpCurrentPassword, setTotpCurrentPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [totpRecoveryCodes, setTotpRecoveryCodes] = useState<string[]>([])
  const [totpLoading, setTotpLoading] = useState(false)
  const [totpMessage, setTotpMessage] = useState('')
  const [totpError, setTotpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [prefSaving, setPrefSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'type' | 'password'>('info')

  useEffect(() => {
    authApi.getProfile().then(r => {
      const d = r.data?.data || r.data
      if (d) {
        setForm({
          firstName: d.firstName || '', lastName: d.lastName || '',
          email: d.email || '', phoneNumber: d.phoneNumber || d.contact || '',
          userType: d.userType || '',
          address: d.address || '',
        })
        setHasIdNumber(!!d.hasIdNumber)
        setIdNumberLastFour(d.idNumberLastFour || '')
        setIdentityVerificationStatus(d.identityVerificationStatus || 'not_started')
        setAuthenticatorTwoFactorEnabled(!!d.authenticatorTwoFactorEnabled)
        setCanAcceptTasks(!!d.canAcceptTasks)
        setHasVerifiedPayoutAccount(!!d.hasVerifiedPayoutAccount)
      }
    }).catch(() => {
      setHasIdNumber(false)
      setIdNumberLastFour('')
      if (user) setForm({
        firstName: user.firstName || '', lastName: user.lastName || '',
        email: user.email || '', phoneNumber: user.phoneNumber || user.contact || '',
        userType: user.userType || '',
        address: user.address || '',
      })
    })
  }, [user])

  useEffect(() => {
    authApi.getTwoFactorStatus().then(response => {
      const d = response.data?.data || response.data
      if (d) {
        setTotpEnabled(!!d.enabled)
        setTotpRemainingCodes(Number(d.remainingRecoveryCodes || 0))
        setTotpConfigured(!!d.encryptionConfigured)
      }
    }).catch(() => setTotpConfigured(false))
  }, [])

  const set = (field: string) => (val: string) => setForm(f => ({ ...f, [field]: val }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await authApi.updateProfile(form)
      const r = await authApi.getProfile()
      const d = r.data?.data || r.data
      if (d) {
        setHasIdNumber(!!d.hasIdNumber)
        setIdNumberLastFour(d.idNumberLastFour || '')
        setIdentityVerificationStatus(d.identityVerificationStatus || 'not_started')
        setAuthenticatorTwoFactorEnabled(!!d.authenticatorTwoFactorEnabled)
        setCanAcceptTasks(!!d.canAcceptTasks)
        setHasVerifiedPayoutAccount(!!d.hasVerifiedPayoutAccount)
        const AsyncStorage = require('@react-native-async-storage/async-storage').default
        await AsyncStorage.setItem('currentUser', JSON.stringify(d))
        refreshUser()
      }
      Alert.alert('Success', 'Profile updated!')
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.')
    } finally { setLoading(false) }
  }

  const utf8ByteLength = (value: string) => Array.from(value).reduce((bytes, char) => {
    const codePoint = char.codePointAt(0) ?? 0
    return bytes + (codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4)
  }, 0)

  const handlePwChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return }
    if (pwForm.newPassword.length < 12 || pwForm.newPassword.length > 72 || utf8ByteLength(pwForm.newPassword) > 72) { Alert.alert('Error', 'Use a password between 12 and 72 characters and no more than 72 UTF-8 bytes.'); return }
    setPwLoading(true)
    try {
      await authApi.changePassword(pwForm)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      await logout()
      navigation.navigate('Login')
      Alert.alert('Password changed', 'Sign in again with your new password.')
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password.')
    } finally { setPwLoading(false) }
  }

  const handleTotpSetup = async () => {
    setTotpLoading(true); setTotpError(''); setTotpMessage('')
    try {
      const response = await authApi.setupTwoFactor({ currentPassword: totpCurrentPassword || undefined })
      const d = response.data?.data || response.data
      setTotpSecret(d.secret || '')
      setTotpProvisioningUri(d.provisioningUri || '')
      setTotpCode('')
      setTotpMessage('Add the key to your authenticator app, then enter its current six-digit code to enable it.')
    } catch (err: any) {
      setTotpError(err.response?.data?.message || 'Authenticator setup could not start.')
    } finally { setTotpLoading(false) }
  }

  const handleTotpConfirm = async () => {
    setTotpLoading(true); setTotpError(''); setTotpMessage('')
    try {
      const response = await authApi.confirmTwoFactor(totpCode.trim())
      const d = response.data?.data || response.data
      const recoveryCodes = Array.isArray(d.recoveryCodes) ? d.recoveryCodes : []
      setTotpEnabled(true)
      setTotpRecoveryCodes(recoveryCodes)
      setTotpRemainingCodes(recoveryCodes.length)
      setTotpSecret('')
      setTotpProvisioningUri('')
      setTotpCurrentPassword('')
      setTotpCode('')
      setTotpMessage('Authenticator enabled. Save each one-time recovery code below now; these codes cannot be retrieved later.')
      await refreshUser()
    } catch (err: any) {
      setTotpError(err.response?.data?.message || 'The authenticator code could not be confirmed.')
    } finally { setTotpLoading(false) }
  }

  const handleTotpDisable = async () => {
    setTotpLoading(true); setTotpError(''); setTotpMessage('')
    try {
      await authApi.disableTwoFactor({ currentPassword: totpCurrentPassword || undefined, code: totpCode.trim() })
      setTotpEnabled(false)
      setTotpRemainingCodes(0)
      setTotpCurrentPassword('')
      setTotpCode('')
      setTotpRecoveryCodes([])
      setTotpMessage('Authenticator disabled. Sign out and sign in again to refresh the session.')
      await refreshUser()
    } catch (err: any) {
      setTotpError(err.response?.data?.message || 'Authenticator could not be disabled.')
    } finally { setTotpLoading(false) }
  }

  const leaveRecoveryCodes = () => {
    setTotpRecoveryCodes([])
    void logout()
    navigation.navigate('Login')
  }

  const handleUserTypeChange = async (value: string) => {
    setForm(f => ({ ...f, userType: value }))
    setPrefSaving(true)
    try {
      await userPreferencesApi.update({
        canCreateTasks: value === 'creator' || value === 'both',
        canAcceptTasks: value === 'runner' || value === 'both',
      })
      const AsyncStorage = require('@react-native-async-storage/async-storage').default
      const stored = await AsyncStorage.getItem('currentUser')
      if (stored) {
        const updated = { ...JSON.parse(stored), userType: value }
        await AsyncStorage.setItem('currentUser', JSON.stringify(updated))
        refreshUser()
      }
      Alert.alert('Saved', 'User type updated!')
    } catch {}
    finally { setPrefSaving(false) }
  }

  const completion = user?.profileCompletion ?? 0
  const displayName = form.firstName ? `${form.firstName} ${form.lastName}`.trim() : user?.name || 'User'

  const TABS = [
    { id: 'info' as const, label: 'Info' },
    { id: 'type' as const, label: 'Role' },
    { id: 'password' as const, label: 'Password' },
    { id: 'security' as const, label: 'Security' },
  ]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{form.email}</Text>
        <View style={[styles.typeBadge, { backgroundColor: form.userType === 'creator' ? '#DBEAFE' : form.userType === 'runner' ? '#D1FAE5' : '#EDE9FE' }]}>
          <Text style={[styles.typeBadgeText, { color: form.userType === 'creator' ? '#1D4ED8' : form.userType === 'runner' ? '#065F46' : '#5B21B6' }]}>{form.userType || 'Not set'}</Text>
        </View>
        <View style={styles.completionBar}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionLabel}>Profile Completion</Text>
              <Text style={styles.completionPct}>{completion}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completion}%` as any }]} />
            </View>
          </View>
      </View>

      <View style={styles.accountLinks}>
        <Text style={styles.accountLinksTitle}>Your account tools</Text>
        <View style={styles.accountLinksGrid}>
          {[
            { title: 'Payment history', subtitle: 'Payments and status', kind: 'payments' },
            { title: 'My disputes', subtitle: 'Track raised disputes', kind: 'disputes' },
            { title: 'Help & support', subtitle: 'Contact the support team', kind: 'support' },
            { title: 'Activity', subtitle: 'Recent task updates', kind: 'activity' },
          ].map(item => (
            <TouchableOpacity key={item.kind} style={styles.accountLink} onPress={() => navigation.navigate('AccountTools', { kind: item.kind })} accessibilityRole="button">
              <Text style={styles.accountLinkTitle}>{item.title}</Text>
              <Text style={styles.accountLinkSub}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.actionRequiredLink} onPress={() => navigation.navigate('ActionRequired')} accessibilityRole="button"><Text style={styles.actionRequiredTitle}>Action required</Text><Text style={styles.accountLinkSub}>Payments and completion reviews waiting for you</Text></TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[styles.tab, activeTab === t.id && styles.tabActive]} onPress={() => setActiveTab(t.id)}>
            <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Personal Info */}
      {activeTab === 'info' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>First Name</Text>
              <TextInput style={styles.input} value={form.firstName} onChangeText={set('firstName')} placeholderTextColor={COLORS.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput style={styles.input} value={form.lastName} onChangeText={set('lastName')} placeholderTextColor={COLORS.textMuted} />
            </View>
          </View>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email} editable={false} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textMuted} />
          <Text style={styles.hint}>Email changes require a separate verification flow and are not available here.</Text>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={form.phoneNumber} onChangeText={set('phoneNumber')} keyboardType="phone-pad" placeholderTextColor={COLORS.textMuted} />
          {(form.userType === 'runner' || form.userType === 'both') && (
            <View style={styles.eligibilityCard}>
              <Text style={styles.eligibilityTitle}>Runner identity onboarding</Text>
              <Text style={styles.hint}>{hasIdNumber ? `An ID number is already on file ending ${idNumberLastFour}.` : 'Identity information will be collected through the dedicated verification flow once the provider and data protection controls are configured.'}</Text>
              <Text style={styles.hint}>Do not send identity documents through this general profile form. A valid ID format is not identity verification.</Text>
            </View>
          )}
          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={form.address} onChangeText={set('address')} placeholderTextColor={COLORS.textMuted} />
          <Button title="Save Changes" onPress={handleSave} loading={loading} fullWidth style={{ marginTop: 8 }} />
        </View>
      )}

      {/* User Type */}
      {activeTab === 'type' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Type & Role</Text>
          <Text style={styles.hint}>Choose how you want to use DoForYou:</Text>
          {USER_TYPES.map(t => (
            <TouchableOpacity key={t.value} style={[styles.typeCard, form.userType === t.value && styles.typeCardActive]} onPress={() => handleUserTypeChange(t.value)} disabled={prefSaving}>
              <Text style={styles.typeLabel}>{t.label}</Text>
              <Text style={styles.typeDesc}>{t.desc}</Text>
              {form.userType === t.value && <Text style={styles.typeCheck}>✓ Selected</Text>}
            </TouchableOpacity>
          ))}
          {(form.userType === 'runner' || form.userType === 'both') && (
            <View style={styles.eligibilityCard} accessibilityRole="summary">
              <Text style={styles.eligibilityTitle}>Runner eligibility</Text>
              <Text style={styles.hint}>Identity check: {identityVerificationStatus.replace(/_/g, ' ')}.</Text>
              <Text style={styles.hint}>Authenticator 2FA: {authenticatorTwoFactorEnabled ? 'enabled' : 'not enabled'}.</Text>
              <Text style={styles.hint}>Payout account: {hasVerifiedPayoutAccount ? 'bank recipient verified' : 'not verified'}.</Text>
              <Text style={styles.hint}>{canAcceptTasks ? 'Runner task acceptance is enabled.' : 'Task acceptance remains locked until identity verification and authenticator 2FA are completed. Those setup flows are not yet available in staging.'}</Text>
            </View>
          )}
        </View>
      )}

      {/* Authenticator security */}
      {activeTab === 'security' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Authenticator security</Text>
          {!!totpError && <View style={styles.errorBox} accessibilityRole="alert"><Text style={styles.errorText}>{totpError}</Text></View>}
          {!!totpMessage && <View style={styles.eligibilityCard} accessibilityRole="summary"><Text style={styles.hint}>{totpMessage}</Text></View>}
          <Text style={styles.hint}>
            An authenticator app generates your sign-in codes. Recovery codes work once each. Turning this feature on or off signs out existing sessions.
          </Text>
          {!totpConfigured && <Text style={styles.hint}>Authenticator enrollment is disabled on this staging API until its encryption key is configured.</Text>}
          {totpRecoveryCodes.length > 0 && (
            <View style={styles.recoveryCard}>
              <Text style={styles.eligibilityTitle}>Save these recovery codes now</Text>
              <Text style={styles.hint}>They will not be shown again. Save them in a secure password manager or other protected place.</Text>
              <View style={styles.recoveryCodeGrid}>
                {totpRecoveryCodes.map(code => <Text key={code} selectable style={styles.recoveryCode}>{code}</Text>)}
              </View>
              <Button title="I've saved my codes — sign out" onPress={leaveRecoveryCodes} fullWidth style={{ marginTop: 8 }} />
            </View>
          )}
          {totpConfigured && !totpEnabled && !totpSecret && (
            <>
              {user?.hasGoogleLogin ? (
                <Text style={styles.hint}>Because this account uses Google, sign in again immediately before setting up an authenticator.</Text>
              ) : (
                <>
                  <Text style={styles.label}>Current password</Text>
                  <TextInput style={styles.input} value={totpCurrentPassword} onChangeText={setTotpCurrentPassword} secureTextEntry autoComplete="current-password" placeholder="Confirm your current password" placeholderTextColor={COLORS.textMuted} />
                </>
              )}
              <Button title="Set up authenticator" onPress={handleTotpSetup} loading={totpLoading} disabled={totpLoading || (!user?.hasGoogleLogin && !totpCurrentPassword)} fullWidth style={{ marginTop: 8 }} />
            </>
          )}
          {totpConfigured && !totpEnabled && !!totpSecret && (
            <>
              <Text style={styles.label}>Authenticator setup key</Text>
              <Text selectable style={styles.recoveryCode}>{totpSecret}</Text>
              <Text style={styles.hint}>In your authenticator app, choose “enter setup key” and type this key. Do not share it.</Text>
              <Text style={styles.label}>Current six-digit code</Text>
              <TextInput style={styles.input} value={totpCode} onChangeText={v => setTotpCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" maxLength={6} placeholder="123456" placeholderTextColor={COLORS.textMuted} />
              <Button title="Confirm and enable" onPress={handleTotpConfirm} loading={totpLoading} disabled={totpLoading || totpCode.length !== 6} fullWidth style={{ marginTop: 8 }} />
              <Text selectable style={[styles.hint, { marginTop: 8 }]}>Advanced provisioning URI: {totpProvisioningUri}</Text>
            </>
          )}
          {totpConfigured && totpEnabled && totpRecoveryCodes.length === 0 && (
            <>
              <Text style={styles.hint}>Authenticator enabled. Remaining recovery codes: {totpRemainingCodes}.</Text>
              {!user?.hasGoogleLogin && (
                <>
                  <Text style={styles.label}>Current password</Text>
                  <TextInput style={styles.input} value={totpCurrentPassword} onChangeText={setTotpCurrentPassword} secureTextEntry autoComplete="current-password" placeholder="Confirm your current password" placeholderTextColor={COLORS.textMuted} />
                </>
              )}
              <Text style={styles.label}>Authenticator or recovery code</Text>
              <TextInput style={styles.input} value={totpCode} onChangeText={setTotpCode} autoCapitalize="characters" autoComplete="one-time-code" maxLength={20} placeholder="Six-digit code or recovery code" placeholderTextColor={COLORS.textMuted} />
              <Button title="Disable authenticator" onPress={handleTotpDisable} loading={totpLoading} disabled={totpLoading || !totpCode.trim()} fullWidth style={{ marginTop: 8 }} />
            </>
          )}
        </View>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <Text style={styles.label}>Current Password</Text>
          <TextInput style={styles.input} value={pwForm.currentPassword} onChangeText={v => setPwForm(f => ({ ...f, currentPassword: v }))} secureTextEntry placeholderTextColor={COLORS.textMuted} placeholder="Current password" />
          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} value={pwForm.newPassword} onChangeText={v => setPwForm(f => ({ ...f, newPassword: v }))} secureTextEntry placeholderTextColor={COLORS.textMuted} placeholder="12–72 characters" />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput style={styles.input} value={pwForm.confirmPassword} onChangeText={v => setPwForm(f => ({ ...f, confirmPassword: v }))} secureTextEntry placeholderTextColor={COLORS.textMuted} placeholder="Repeat new password" />
          <Button title="Change Password" onPress={handlePwChange} loading={pwLoading} fullWidth style={{ marginTop: 8 }} />
        </View>
      )}

      <Button title="Bank Accounts" onPress={() => navigation.navigate('BankAccounts')} variant="secondary" fullWidth style={{ marginTop: 8 }} />
      <SignOutButton onConfirm={logout} style={{ marginTop: 8 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 40, gap: 16 },
  accountLinks: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  accountLinksTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  accountLinksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionRequiredLink: { marginTop: 9, padding: 11, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.border },
  actionRequiredTitle: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '900' },
  accountLink: { width: '48%', padding: 11, borderRadius: RADIUS.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.borderLight },
  accountLinkTitle: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '800' },
  accountLinkSub: { color: COLORS.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 4 },
  profileCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center', ...SHADOW.sm },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  displayName: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: 8 },
  typeBadgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  completionBar: { width: '100%', marginTop: 12 },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  completionLabel: { fontSize: 12, color: COLORS.textSecondary },
  completionPct: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  eligibilityCard: { marginTop: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  eligibilityTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 6 },
  recoveryCard: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, marginVertical: SPACING.sm },
  recoveryCodeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  recoveryCode: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700', padding: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, backgroundColor: COLORS.surface, overflow: 'hidden' },
  progressTrack: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 4, ...SHADOW.sm },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOW.sm, gap: 4 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6, marginTop: 8 },
  hint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  typeCard: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, marginBottom: 8 },
  typeCardActive: { borderColor: COLORS.primary, backgroundColor: '#EEF2FF' },
  typeLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  typeDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  typeCheck: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 6 },
})
