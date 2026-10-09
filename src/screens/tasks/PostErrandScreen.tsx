import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TextInput, StyleSheet,
  TouchableOpacity, Alert, Switch
} from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { tasksApi, categoryApi, userPreferencesApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import { AlertBanner } from '../../components/Common'
import { COLORS, RADIUS, SPACING, SHADOW } from '../../config/theme'

const DEFAULT_CATEGORIES = ['Grocery Shopping','Delivery','Cleaning','Gardening','Moving','Repairs','Tutoring','Pet Care','Cooking','Other']

function calcCommission(budget: number) {
  const commission = Math.max(budget * 0.15, 0)
  return { total: budget, commission, payout: budget - commission }
}

export default function PostErrandScreen({ navigation, route }: any) {
  const { user, canPostErrands, isAuthenticated } = useAuth()
  const editId = route?.params?.editId
  const isEdit = !!editId

  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [minAmount] = useState(50)
  const [form, setForm] = useState({
    taskName: '', taskDescription: '', category: '', area: '',
    priority: 'standard', dateNeeded: '', budget: '', notes: '',
    termsAccepted: false,
  })

  useEffect(() => {
    if (!isAuthenticated() || !canPostErrands()) {
      navigation.navigate('Dashboard')
      return
    }
    categoryApi.getAll().then(r => {
      const cats = r.data?.data || r.data
      if (Array.isArray(cats) && cats.length)
        setCategories([...cats.map((c: any) => c.name || c), 'Other'])
    }).catch(() => {})

    if (editId) {
      tasksApi.getById(editId).then(r => {
        const t = r.data?.data || r.data
        if (t) setForm(f => ({
          ...f,
          taskName: t.taskName || t.title || '',
          taskDescription: t.taskDescription || t.description || '',
          category: t.category || '',
          area: t.area || t.location || '',
          priority: t.priority || 'standard',
          dateNeeded: (t.dateNeeded || t.dueDate) ? (t.dateNeeded || t.dueDate).substring(0, 16) : '',
          budget: String(t.budget || ''),
          notes: t.notes || '',
        }))
      }).catch(() => {})
    }
  }, [editId])

  const set = (field: string) => (val: string | boolean) =>
    setForm(f => ({ ...f, [field]: val }))

  const isStep1Valid = () =>
    form.taskName.trim().length >= 3 && form.taskDescription.length >= 10 && !!form.category && !!form.area
  const isStep2Valid = () => !!form.dateNeeded && parseFloat(form.budget) >= minAmount
  const budget = parseFloat(form.budget) || 0
  const commission = calcCommission(budget)

  const handleSubmit = async () => {
    if (!form.termsAccepted) { setError('Please accept the terms and conditions.'); return }
    setSubmitting(true); setError('')
    try {
      const payload = {
        taskName: form.taskName,
        taskDescription: form.taskDescription,
        category: form.category,
        area: form.area,
        priority: form.priority,
        dateNeeded: form.dateNeeded,
        budget: parseFloat(form.budget),
        notes: form.notes,
        termsAccepted: form.termsAccepted,
      }
      const res = isEdit
        ? await tasksApi.update(editId!, payload)
        : await tasksApi.create(payload)

      const data = res.data
      if (data.success !== false) {
        const payUrl = data.data?.paymentUrl

        if (payUrl) {
          // Open Paystack checkout. Browser dismissal is not proof of payment;
          // the backend webhook/return flow remains authoritative.
          await WebBrowser.openBrowserAsync(payUrl)
          navigation.navigate('MyPostedTasks')
        } else {
          Alert.alert('Success!', isEdit ? 'Task updated.' : 'Task created!', [
            { text: 'View Tasks', onPress: () => navigation.navigate('MyPostedTasks') }
          ])
        }
      } else {
        setError(data.message || 'Failed to create task.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit task.')
    } finally { setSubmitting(false) }
  }

  const STEPS = ['Details', 'Budget & Date', 'Review']

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>✨</Text>
        <Text style={styles.heroTitle}>{isEdit ? 'Edit Your Task' : 'Create Your Task'}</Text>
        <Text style={styles.heroSub}>{isEdit ? 'Update your task details' : 'Transform your to-do into someone else\'s opportunity'}</Text>
        {user && (
          <View style={styles.userWelcome}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {(user.firstName || user.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>
                {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.name}
              </Text>
              <Text style={styles.userContact}>{user.contact || user.phoneNumber || user.email}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Step indicator */}
      <View style={styles.stepsRow}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepCircle, step > i + 1 && styles.stepDone, step === i + 1 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= i + 1 && styles.stepNumActive]}>
                {step > i + 1 ? '✓' : i + 1}
              </Text>
            </View>
            <Text style={[styles.stepLabel, step === i + 1 && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      {error ? <AlertBanner type="error" message={error} /> : null}

      <View style={styles.card}>
        {/* Step 1 */}
        {step === 1 && (
          <View style={{ gap: 14 }}>
            <Text style={styles.stepTitle}>📋 What do you need done?</Text>

            <View>
              <Text style={styles.label}>Task Name * <Text style={styles.hint}>(max 60 chars)</Text></Text>
              <TextInput
                style={styles.input}
                value={form.taskName}
                onChangeText={set('taskName')}
                placeholder="e.g. Car Wash Vereeniging, Grocery Run Sandton"
                placeholderTextColor={COLORS.textMuted}
                maxLength={60}
              />
              <Text style={styles.charCount}>{form.taskName.length}/60</Text>
            </View>

            <View>
              <Text style={styles.label}>Describe your task *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.taskDescription}
                onChangeText={set('taskDescription')}
                placeholder="Tell us what you need help with..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.hint}>Be specific — the more details, the better matches!</Text>
            </View>

            <View>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.catRow}>
                  {categories.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catChip, form.category === c && styles.catChipActive]}
                      onPress={() => set('category')(c)}
                    >
                      <Text style={[styles.catChipText, form.category === c && styles.catChipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={form.area}
                onChangeText={set('area')}
                placeholder="Area / Suburb"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View>
              <Text style={styles.label}>Urgency *</Text>
              <View style={styles.priorityRow}>
                {[
                  { v: 'standard', icon: '⏰', label: 'Standard', sub: '48 hours' },
                  { v: 'urgent', icon: '⚡', label: 'Urgent', sub: '24 hours' },
                ].map(p => (
                  <TouchableOpacity
                    key={p.v}
                    style={[styles.priorityCard, form.priority === p.v && styles.priorityCardActive]}
                    onPress={() => set('priority')(p.v)}
                  >
                    <Text style={styles.priorityIcon}>{p.icon}</Text>
                    <Text style={[styles.priorityLabel, form.priority === p.v && styles.priorityLabelActive]}>{p.label}</Text>
                    <Text style={styles.prioritySub}>{p.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="Next →"
              onPress={() => isStep1Valid() && setStep(2)}
              disabled={!isStep1Valid()}
              fullWidth size="lg"
            />
          </View>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View style={{ gap: 14 }}>
            <Text style={styles.stepTitle}>📅 When & How Much?</Text>

            <View>
              <Text style={styles.label}>Deadline * <Text style={styles.hint}>(YYYY-MM-DDTHH:MM)</Text></Text>
              <TextInput
                style={styles.input}
                value={form.dateNeeded}
                onChangeText={set('dateNeeded')}
                placeholder="2025-12-31T14:00"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View>
              <Text style={styles.label}>Your Budget (R) * <Text style={styles.hint}>Min R{minAmount}</Text></Text>
              <View style={styles.budgetRow}>
                <View style={styles.currencyPrefix}>
                  <Text style={styles.currencyText}>R</Text>
                </View>
                <TextInput
                  style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  value={form.budget}
                  onChangeText={set('budget')}
                  placeholder="100.00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {budget >= 50 && (
              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Task Budget:</Text>
                  <Text style={styles.breakdownValue}>R{commission.total.toFixed(2)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Platform Fee (15%):</Text>
                  <Text style={[styles.breakdownValue, { color: COLORS.danger }]}>-R{commission.commission.toFixed(2)}</Text>
                </View>
                <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                  <Text style={[styles.breakdownLabel, { fontWeight: '700' }]}>Runner Receives:</Text>
                  <Text style={[styles.breakdownValue, { color: COLORS.primary, fontWeight: '700' }]}>R{commission.payout.toFixed(2)}</Text>
                </View>
              </View>
            )}

            <View style={styles.navRow}>
              <Button title="← Previous" onPress={() => setStep(1)} variant="secondary" style={{ flex: 1 }} />
              <Button title="Next →" onPress={() => isStep2Valid() && setStep(3)} disabled={!isStep2Valid()} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <View style={{ gap: 14 }}>
            <Text style={styles.stepTitle}>🚀 Final Details</Text>

            <View>
              <Text style={styles.label}>Anything else? (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.notes}
                onChangeText={set('notes')}
                placeholder="Special requirements, preferences..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.termsRow}>
              <Switch
                value={form.termsAccepted}
                onValueChange={set('termsAccepted')}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
              <Text style={styles.termsText}>I agree to the Terms & Conditions</Text>
            </View>

            <View style={styles.paymentInfo}>
              <Text style={styles.paymentInfoTitle}>🔒 Secure Payment via PayFast</Text>
              <Text style={styles.paymentInfoSub}>Bank-level security • Instant activation • Money-back guarantee</Text>
              <Text style={styles.paymentInfoNote}>Powered by PayFast — South Africa's leading payment gateway</Text>
            </View>

            <View style={styles.navRow}>
              <Button title="← Previous" onPress={() => setStep(2)} variant="secondary" style={{ flex: 1 }} />
              <Button
                title={isEdit ? 'Save Changes' : '🚀 Launch My Task'}
                onPress={handleSubmit}
                loading={submitting}
                disabled={!form.termsAccepted}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  hero: { backgroundColor: COLORS.primary, padding: SPACING.lg, paddingTop: 24, paddingBottom: 32, alignItems: 'center' },
  heroIcon: { fontSize: 36, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: COLORS.white, marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  userWelcome: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.lg, padding: 12 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  userName: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  userContact: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepActive: { backgroundColor: COLORS.primary },
  stepDone: { backgroundColor: COLORS.success },
  stepNum: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  stepNumActive: { color: COLORS.white },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '600' },
  card: { margin: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOW.sm },
  stepTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 6 },
  hint: { fontSize: 12, color: COLORS.textMuted, fontWeight: '400' },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.white },
  textarea: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginTop: 2 },
  catRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 13, color: COLORS.textSecondary },
  catChipTextActive: { color: COLORS.white, fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityCard: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, alignItems: 'center', gap: 4 },
  priorityCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  priorityIcon: { fontSize: 20 },
  priorityLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  priorityLabelActive: { color: COLORS.primary },
  prioritySub: { fontSize: 11, color: COLORS.textMuted },
  budgetRow: { flexDirection: 'row', alignItems: 'center' },
  currencyPrefix: { backgroundColor: COLORS.backgroundDark, borderWidth: 1.5, borderColor: COLORS.border, borderRightWidth: 0, borderTopLeftRadius: RADIUS.md, borderBottomLeftRadius: RADIUS.md, padding: 12, justifyContent: 'center' },
  currencyText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  breakdown: { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 14, gap: 8 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 4 },
  breakdownLabel: { fontSize: 14, color: COLORS.textSecondary },
  breakdownValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  navRow: { flexDirection: 'row', gap: 10 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  termsText: { fontSize: 14, color: COLORS.textPrimary, flex: 1 },
  paymentInfo: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, padding: 16, alignItems: 'center', gap: 4 },
  paymentInfoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primaryDark },
  paymentInfoSub: { fontSize: 13, color: COLORS.primaryDark, textAlign: 'center' },
  paymentInfoNote: { fontSize: 11, color: COLORS.primaryDark, textAlign: 'center', marginTop: 4 },
})
