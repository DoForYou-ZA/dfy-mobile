import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, Alert, ScrollView
} from 'react-native'
import { tasksApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { LoadingScreen, EmptyState, AlertBanner } from '../../components/Common'
import StatusBadge from '../../components/StatusBadge'
import AppModal from '../../components/AppModal'
import Button from '../../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW, GLOBAL } from '../../config/theme'
import type { Task } from '../../types'

const DEFAULT_CATEGORIES = ['Grocery Shopping','Delivery','Cleaning','Gardening','Moving','Repairs','Tutoring','Pet Care','Cooking','Other']

// Use the backend-calculated payout (including its minimum commission rule) as the source of truth.
function getRunnerPayout(task: Task) {
  const amount = task.payoutAmount ?? (task as any).PayoutAmount
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) return '—'
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function BrowseErrandsScreen({ navigation }: any) {
  const { isAuthenticated, canAcceptTasks, isProfileIncomplete, user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [claimModal, setClaimModal] = useState<Task | null>(null)
  const [detailModal, setDetailModal] = useState<Task | null>(null)
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimError, setClaimError] = useState('')

  const load = useCallback(async (p = 1, s = search, cat = category, silent = false) => {
    if (!silent) setLoading(true)
    try {
      setLoadError('')
      const filters: Record<string, string> = {}
      if (s.trim()) filters.search = s.trim()
      if (cat.trim()) filters.category = cat.trim()
      const res = await tasksApi.getAvailable(p, 10, filters)
      const data = res.data
      const taskList = data.tasks || []
      if (p === 1) setTasks(taskList)
      else setTasks(prev => [...prev, ...taskList])
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.count || taskList.length)
      setLastUpdated(new Date())
    } catch (error: any) {
      setLoadError(error.response?.data?.message || 'We could not load tasks. Check your connection and try again.')
      if (p === 1) setTasks([])
    }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => {
    void load(1)
    tasksApi.getFilters().then(response => {
      const data = response.data?.data || response.data
      if (Array.isArray(data?.categories)) {
        const available = data.categories.filter((value: unknown): value is string => typeof value === 'string' && value.trim().length > 0)
        if (available.length) setCategories(Array.from(new Set(available.map((value: string) => value.trim()))))
      }
    }).catch(() => {
      // Keep the fallback categories visible if the filter-options endpoint is unavailable.
    })
  }, [])

  const onRefresh = () => { setRefreshing(true); setPage(1); load(1, search, category) }

  const handleClaim = async () => {
    if (!claimModal) return
    if (!isAuthenticated()) { navigation.navigate('Login'); return }
    if (isProfileIncomplete()) { navigation.navigate('Profile'); return }
    if (!canAcceptTasks()) { setClaimError('Your profile does not allow accepting tasks.'); return }
    setClaimLoading(true); setClaimError('')
    try {
      const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || ''
      const contact = user?.phoneNumber || user?.contact || ''
      const response = await tasksApi.claim(claimModal.taskId, name, contact, true)
      if (response.data?.success !== true || response.data?.data !== true) {
        setClaimError(response.data?.message || 'This task could not be accepted.')
        return
      }
      setClaimModal(null)
      Alert.alert('Success!', 'Task accepted! Check My Active Tasks.')
      load(1, search, category)
    } catch (err: any) {
      setClaimError(err.response?.data?.message || 'Failed to claim task.')
    } finally { setClaimLoading(false) }
  }

  const getButtonText = (task: Task) => {
    if (!isAuthenticated()) return 'Login to Accept'
    if (isProfileIncomplete()) return 'Complete Profile'
    if (!canAcceptTasks()) return 'Not Available'
    if (task.paymentStatus?.toUpperCase().includes('PENDING')) return 'Awaiting Payment'
    return 'Accept Task'
  }

  const isButtonDisabled = (task: Task) => {
    if (!isAuthenticated()) return false
    if (!canAcceptTasks()) return true
    if (task.paymentStatus?.toUpperCase().includes('PENDING')) return true
    return false
  }

  const handleAccept = (task: Task) => {
    if (!isAuthenticated()) { navigation.navigate('Login'); return }
    if (isProfileIncomplete()) { navigation.navigate('Profile'); return }
    setClaimModal(task)
  }

  // .task-card layout matching web exactly
  const renderTask = ({ item: task }: { item: Task }) => (
    <View style={s.taskCard}>
      {/* .task-card-header */}
      <View style={s.taskCardHeader}>
        <View style={s.taskCategory}>
          <Text style={s.taskCategoryText}>{task.category || 'General'}</Text>
        </View>
        <Text style={s.taskBudget}>{getRunnerPayout(task)}</Text>
      </View>

      {/* .task-card-body */}
      <View style={s.taskCardBody}>
        <Text style={s.taskTitle} numberOfLines={1}>
          {task.taskName || task.task_description || task.taskDescription || 'No description'}
        </Text>
        {task.taskName && (
          <Text style={s.taskSubtitle} numberOfLines={1}>{task.taskDescription}</Text>
        )}
        <View style={s.taskMeta}>
          <Text style={s.taskMetaItem}>📍 {task.area_suburb || task.area || 'Location not specified'}</Text>
          <Text style={s.taskMetaItem}>🕐 {task.dateNeeded
            ? new Date(task.dateNeeded).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Date flexible'}</Text>
          {task.notes ? <Text style={s.taskMetaItem} numberOfLines={1}>📝 {task.notes}</Text> : null}
        </View>
        {/* .task-footer-meta */}
        <View style={s.taskFooterMeta}>
          <Text style={s.taskTime}>
            {new Date(task.timestamp || task.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
          </Text>
          <StatusBadge status={task.status || task.taskStatus || ''} />
        </View>
      </View>

      {/* .task-card-footer */}
      <View style={s.taskCardFooter}>
        <View style={s.taskActions}>
          <Button title="Details" onPress={() => setDetailModal(task)} variant="outline" size="sm" style={{ flex: 1 }} />
          <Button
            title={getButtonText(task)}
            onPress={() => handleAccept(task)}
            size="sm"
            style={{ flex: 1 }}
            disabled={isButtonDisabled(task)}
          />
        </View>
      </View>
    </View>
  )

  return (
    <View style={s.page}>
      {/* Theme-led browse header */}
      <View style={s.hero}>
        <View style={s.heroHeading}>
          <View style={s.heroMark}><Text style={s.heroMarkText}>↗</Text></View>
          <View style={s.heroCopy}>
            <Text style={s.heroTitle}>Start earning today</Text>
            <Text style={s.heroSub}>Monetise your skills. Choose flexible opportunities.</Text>
          </View>
        </View>
        <View style={s.heroBottom}>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{totalItems}</Text>
              <Text style={s.heroStatLabel}>Matching tasks</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.heroStat}>
              <Text style={s.heroStatNum}>{lastUpdated ? lastUpdated.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : '—'}</Text>
              <Text style={s.heroStatLabel}>Last updated</Text>
            </View>
          </View>
          <Button
            title={loading ? 'Refreshing…' : 'Refresh'}
            onPress={() => { setPage(1); void load(1, search, category) }}
            variant="outline"
            size="sm"
            disabled={loading}
          />
        </View>
      </View>

      {/* Guest alert */}
      {!isAuthenticated() && (
        <View style={s.guestAlert}>
          <Text style={s.guestAlertTitle}>Join to Start Earning</Text>
          <Text style={s.guestAlertSub}>Create an account to accept tasks and start earning money today</Text>
          <View style={s.guestActions}>
            <Button title="Sign Up" onPress={() => navigation.navigate('Register')} size="sm" />
            <Button title="Login" onPress={() => navigation.navigate('Login')} variant="outline" size="sm" />
          </View>
        </View>
      )}

      {/* .filters-card */}
      <View style={s.filtersCard}>
        <View style={s.filtersRow}>
          <View style={s.searchWrapper}>
            <TextInput
              style={s.searchInput}
              placeholder="Search title, details, category or area..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => { setPage(1); load(1, search, category) }}
              returnKeyType="search"
            />
            {search ? (
              <TouchableOpacity style={s.clearSearch} onPress={() => { setSearch(''); setPage(1); load(1, '', category) }}>
                <Text style={{ color: COLORS.textSecondary }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Button title="Search" onPress={() => { setPage(1); load(1, search, category) }} size="sm" />
          {(search || category) && (
            <Button title="Clear" onPress={() => { setSearch(''); setCategory(''); setPage(1); load(1, '', '') }} variant="secondary" size="sm" />
          )}
        </View>
        <Text style={s.searchHint}>Search task names, descriptions, categories, notes or locations.</Text>
        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[s.catChip, !category && s.catChipActive]}
              onPress={() => { setCategory(''); setPage(1); load(1, search, '') }}
            >
              <Text style={[s.catChipText, !category && s.catChipTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.catChip, category === c && s.catChipActive]}
                onPress={() => { setCategory(c); setPage(1); load(1, search, c) }}
              >
                <Text style={[s.catChipText, category === c && s.catChipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loadError ? <View style={s.errorWrap}><AlertBanner type="error" message={loadError} /><Button title="Try again" onPress={() => { setPage(1); void load(1, search, category) }} variant="outline" size="sm" /></View> : null}
      {loading ? <LoadingScreen message="Loading available tasks..." /> : (
        <FlatList
          data={tasks}
          keyExtractor={t => String(t.taskId || t.id)}
          renderItem={renderTask}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onEndReached={() => { if (page < totalPages) { const next = page + 1; setPage(next); load(next, search, category) } }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState icon="🔍" title="No Tasks Found"
              subtitle={search || category ? 'Try adjusting your filters.' : 'No tasks available at the moment. Check back later.'} />
          }
        />
      )}

      {/* Detail Modal */}
      <AppModal visible={!!detailModal} onClose={() => setDetailModal(null)} title="Task Details"
        footer={
          <>
            <Button title="Close" onPress={() => setDetailModal(null)} variant="secondary" style={{ flex: 1 }} />
            <Button title={detailModal ? getButtonText(detailModal) : ''} onPress={() => { setDetailModal(null); if (detailModal) handleAccept(detailModal) }} style={{ flex: 1 }} disabled={detailModal ? isButtonDisabled(detailModal) : true} />
          </>
        }
      >
        {detailModal && (
          <View style={{ gap: 12 }}>
            <Text style={s.modalTitle}>{detailModal.taskName || detailModal.taskDescription}</Text>
            <Text style={s.modalDesc}>{detailModal.taskDescription}</Text>
            <View style={s.claimTaskInfo}>
              <Text style={s.modalMeta}>🏷️ {detailModal.category}</Text>
              <Text style={s.modalMeta}>📍 {detailModal.area_suburb || detailModal.area}</Text>
              {(detailModal.date_time_needed || detailModal.dateNeeded) && (
                <Text style={s.modalMeta}>📅 {new Date(detailModal.date_time_needed || detailModal.dateNeeded!).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              )}
              <Text style={s.modalMeta}>💰 You earn: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{getRunnerPayout(detailModal)}</Text></Text>
              {detailModal.notes && <Text style={s.modalMeta}>📝 {detailModal.notes}</Text>}
            </View>
          </View>
        )}
      </AppModal>

      {/* Claim Modal */}
      <AppModal visible={!!claimModal} onClose={() => setClaimModal(null)} title="Accept Task"
        footer={
          <>
            <Button title="Cancel" onPress={() => setClaimModal(null)} variant="secondary" style={{ flex: 1 }} />
            <Button title="Confirm Accept" onPress={handleClaim} loading={claimLoading} style={{ flex: 1 }} disabled={!claimModal} />
          </>
        }
      >
        {claimModal && (
          <View style={{ gap: 12 }}>
            <Text style={s.modalDesc}>You are about to accept this task:</Text>
            <View style={s.claimTaskInfo}>
              <Text style={s.modalTitle}>{claimModal.task_description || claimModal.taskDescription}</Text>
              <Text style={s.modalMeta}>📍 {claimModal.area_suburb || claimModal.area}</Text>
              <Text style={s.modalMeta}>💰 You earn: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{getRunnerPayout(claimModal)}</Text></Text>
            </View>
            {claimError ? <AlertBanner type="error" message={claimError} /> : null}
          </View>
        )}
      </AppModal>
    </View>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },

  // Theme-led browse header: a white card on the warm cream app background.
  hero: { backgroundColor: COLORS.surface, padding: SPACING.md, marginHorizontal: SPACING.md, marginTop: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  heroHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroMark: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight },
  heroMarkText: { color: COLORS.primaryDark, fontSize: 26, fontWeight: '800' },
  heroCopy: { flex: 1 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  heroTitle: { fontSize: 21, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  heroSub: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroStat: { alignItems: 'flex-start', minWidth: 76 },
  heroStatNum: { fontSize: 21, fontWeight: '800', color: COLORS.textPrimary },
  heroStatLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  heroDivider: { width: 1, height: 34, backgroundColor: COLORS.border },

  // .guest-alert
  guestAlert: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginHorizontal: SPACING.md, marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  guestAlertTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  guestAlertSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  guestActions: { flexDirection: 'row', gap: 10 },

  // .filters-card
  filtersCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md,
    marginHorizontal: SPACING.md, marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  filtersRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  searchWrapper: { flex: 1, position: 'relative', minWidth: 160 },
  searchInput: {
    ...GLOBAL.input,
    paddingLeft: 14,
    paddingRight: 36,
  },
  clearSearch: { position: 'absolute', right: 10, top: 10 },
  searchHint: { color: COLORS.textMuted, fontSize: 11, lineHeight: 16, marginTop: 7 },
  errorWrap: { marginHorizontal: SPACING.md, marginBottom: SPACING.md, gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 13, color: COLORS.textSecondary },
  catChipTextActive: { color: '#fff', fontWeight: '600' },

  list: { paddingHorizontal: SPACING.md, paddingBottom: 32, gap: 20 },

  // .task-card
  taskCard: { ...GLOBAL.taskCard },
  taskCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  taskCategory: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.backgroundDark, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
  },
  taskCategoryText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  taskBudget: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  taskBudgetCurrency: { fontSize: 14, fontWeight: '500' },

  taskCardBody: { padding: SPACING.md, flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6, lineHeight: 21 },
  taskSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  taskMeta: { gap: 6, marginBottom: 10 },
  taskMetaItem: { fontSize: 13, color: COLORS.textSecondary },
  taskFooterMeta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.borderLight,
  },
  taskTime: { fontSize: 12, color: COLORS.textSecondary },

  taskCardFooter: { padding: SPACING.md, paddingTop: 0, borderTopWidth: 1, borderTopColor: COLORS.border },
  taskActions: { flexDirection: 'row', gap: 8 },

  // Modal
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  modalDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  modalMeta: { fontSize: 14, color: COLORS.textPrimary },
  claimTaskInfo: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg,
    padding: SPACING.md, gap: 8,
  },
})
