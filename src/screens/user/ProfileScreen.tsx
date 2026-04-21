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

export default function ProfileScreen() {
  const { user, refreshUser, logout } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', userType: '', idNumber: '', address: '', dateOfBirth: '' })
  const [loading, setLoading] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [prefSaving, setPrefSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'type' | 'password'>('info')

  useEffect(() => {
    authApi.getProfile().then(r => {
      const d = r.data?.data || r.data
      if (d) setForm({
        firstName: d.firstName || '', lastName: d.lastName || '',
        email: d.email || '', phoneNumber: d.phoneNumber || d.contact || '',
        userType: d.userType || '', idNumber: d.idNumber || '',
        address: d.address || '', dateOfBirth: d.dateOfBirth ? d.dateOfBirth.substring(0, 10) : '',
      })
    }).catch(() => {
      if (user) setForm({
        firstName: user.firstName || '', lastName: user.lastName || '',
        email: user.email || '', phoneNumber: user.phoneNumber || user.contact || '',
        userType: user.userType || '', idNumber: user.idNumber || '',
        address: user.address || '', dateOfBirth: '',
      })
    })
  }, [user])

  const set = (field: string) => (val: string) => setForm(f => ({ ...f, [field]: val }))

  const handleIdNumber = (val: string) => {
    const id = val.replace(/\D/g, '').substring(0, 13)
    const updates: any = { idNumber: id }
    if (id.length === 13) {
      const yy = id.substring(0, 2); const mm = id.substring(2, 4); const dd = id.substring(4, 6)
      const year = parseInt(yy) <= new Date().getFullYear() % 100 ? `20${yy}` : `19${yy}`
      updates.dateOfBirth = `${year}-${mm}-${dd}`
    }
    setForm(f => ({ ...f, ...updates }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await authApi.updateProfile(form)
      const r = await authApi.getProfile()
      const d = r.data?.data || r.data
      if (d) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default
        await AsyncStorage.setItem('currentUser', JSON.stringify(d))
        refreshUser()
      }
      Alert.alert('Success', 'Profile updated!')
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.')
    } finally { setLoading(false) }
  }

  const handlePwChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return }
    if (pwForm.newPassword.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return }
    setPwLoading(true)
    try {
      await authApi.changePassword(pwForm)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      Alert.alert('Success', 'Password changed!')
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password.')
    } finally { setPwLoading(false) }
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
        {completion > 0 && (
          <View style={styles.completionBar}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionLabel}>Profile Completion</Text>
              <Text style={styles.completionPct}>{completion}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completion}%` as any }]} />
            </View>
          </View>
        )}
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
          <TextInput style={styles.input} value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textMuted} />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={form.phoneNumber} onChangeText={set('phoneNumber')} keyboardType="phone-pad" placeholderTextColor={COLORS.textMuted} />
          <Text style={styles.label}>ID Number</Text>
          <TextInput style={styles.input} value={form.idNumber} onChangeText={handleIdNumber} keyboardType="numeric" maxLength={13} placeholderTextColor={COLORS.textMuted} />
          {form.dateOfBirth ? <Text style={styles.hint}>Date of birth: {form.dateOfBirth}</Text> : null}
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
        </View>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <Text style={styles.label}>Current Password</Text>
          <TextInput style={styles.input} value={pwForm.currentPassword} onChangeText={v => setPwForm(f => ({ ...f, currentPassword: v }))} secureTextEntry placeholderTextColor={COLORS.textMuted} placeholder="Current password" />
          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} value={pwForm.newPassword} onChangeText={v => setPwForm(f => ({ ...f, newPassword: v }))} secureTextEntry placeholderTextColor={COLORS.textMuted} placeholder="Min 6 characters" />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput style={styles.input} value={pwForm.confirmPassword} onChangeText={v => setPwForm(f => ({ ...f, confirmPassword: v }))} secureTextEntry placeholderTextColor={COLORS.textMuted} placeholder="Repeat new password" />
          <Button title="Change Password" onPress={handlePwChange} loading={pwLoading} fullWidth style={{ marginTop: 8 }} />
        </View>
      )}

      <Button title="Sign Out" onPress={logout} variant="outline" fullWidth style={{ marginTop: 8 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 40, gap: 16 },
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
