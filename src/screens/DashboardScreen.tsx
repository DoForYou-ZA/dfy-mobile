import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { tasksApi } from '../api'
import { LoadingScreen } from '../components/Common'
import Button from '../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'
import type { DashboardStats } from '../types'

type ActivityItem = {
  id?: string | number
  type?: string
  description?: string
  message?: string
  status?: string
  updatedAt?: string
  timestamp?: string
}

const money = (value?: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(value ?? 0)

export default function DashboardScreen({ navigation }: any) {
  const { user, isProfileIncomplete, canPostErrands, canAcceptTasks } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        tasksApi.getDashboardStats().catch(() => ({ data: null })),
        tasksApi.getRecentActivity(4).catch(() => ({ data: null })),
      ])
      const nextStats = statsResponse.data?.data || statsResponse.data
      if (nextStats) setStats(nextStats)
      const nextActivity = activityResponse.data?.data
      setActivity(Array.isArray(nextActivity) ? nextActivity : [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = () => {
    setRefreshing(true)
    load()
  }

  const firstName = user?.firstName?.trim() || user?.name?.trim().split(' ')[0] || 'there'
  const userType = user?.userType || ''
  const initial = (user?.firstName || user?.name || 'D').charAt(0).toUpperCase()
  const canPost = canPostErrands()
  const canBrowse = canAcceptTasks()
  const hasCreatorRole = userType === 'creator' || userType === 'both'
  const hasRunnerRole = userType === 'runner' || userType === 'both'

  if (loading) return <LoadingScreen message="Getting your space ready…" />

  const statsToShow = userType === 'creator'
    ? [
        { label: 'Tasks posted', value: String(stats?.postedTasks ?? 0) },
        { label: 'In progress', value: String(stats?.activeTasks ?? 0) },
        { label: 'To confirm', value: String(stats?.awaitingConfirmation ?? 0) },
      ]
    : userType === 'runner'
      ? [
          { label: 'Tasks available', value: String(stats?.availableTasks ?? 0) },
          { label: 'In progress', value: String(stats?.myActiveTasks ?? 0) },
          { label: 'Earned', value: money(stats?.totalEarnings) },
        ]
      : [
          { label: 'Tasks posted', value: String(stats?.postedTasks ?? 0) },
          { label: 'In progress', value: String((stats?.activeTasks ?? 0) + (stats?.myActiveTasks ?? 0)) },
          { label: 'Earned', value: money(stats?.totalEarnings) },
        ]

  const primaryTitle = canPost ? 'Need something done?' : 'Ready to earn?'
  const primaryBody = canPost
    ? 'Post a task with your budget and timing. A local runner can take it from there.'
    : 'Explore tasks in your area, choose one that suits you, and earn on your terms.'
  const primaryAction = canPost ? 'Post a task' : 'Explore tasks'
  const primaryRoute = canPost ? 'PostErrand' : 'BrowseErrands'

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.topBar}>
        <View style={s.brandRow}>
          <View style={s.brandMark}><Text style={s.brandMarkText}>d</Text><View style={s.brandDot} /></View>
          <View>
            <Text style={s.brand}>DoForYou</Text>
            <Text style={s.brandSub}>YOUR COMMUNITY, IN MOTION</Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          style={s.inboxButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={s.inboxGlyph}>•••</Text>
        </TouchableOpacity>
      </View>

      <View style={s.greetingRow}>
        <View style={s.greetingTextWrap}>
          <Text style={s.greetingEyebrow}>YOUR DFY SPACE</Text>
          <Text style={s.greeting}>Hi, {firstName}.</Text>
          <Text style={s.greetingSub}>What would make today easier?</Text>
        </View>
        <View style={s.avatar}><Text style={s.avatarText}>{initial}</Text></View>
      </View>

      {isProfileIncomplete() && (
        <TouchableOpacity style={s.profileNotice} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
          <View style={s.profileNoticeMark}><Text style={s.profileNoticeMarkText}>!</Text></View>
          <View style={s.profileNoticeCopy}>
            <Text style={s.profileNoticeTitle}>Finish setting up your profile</Text>
            <Text style={s.profileNoticeSub}>Add the missing details to unlock all features.</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      )}

      <View style={s.heroCard}>
        <View style={s.heroOrbOne} />
        <View style={s.heroOrbTwo} />
        <Text style={s.heroEyebrow}>{canPost ? 'MAKE IT HAPPEN' : 'FIND YOUR NEXT TASK'}</Text>
        <Text style={s.heroTitle}>{primaryTitle}</Text>
        <Text style={s.heroBody}>{primaryBody}</Text>
        <Button title={primaryAction + '  →'} onPress={() => navigation.navigate(primaryRoute)} size="lg" style={s.heroButton} />
        <View style={s.heroFooter}><View style={s.heroDot} /><Text style={s.heroFooterText}>Built around real people helping each other</Text></View>
      </View>

      {hasCreatorRole && hasRunnerRole && (
        <View style={s.secondaryActions}>
          <TouchableOpacity style={s.secondaryCard} onPress={() => navigation.navigate('PostErrand')} activeOpacity={0.86}>
            <View style={[s.secondaryIcon, { backgroundColor: COLORS.primaryLight }]}><Text style={[s.secondaryIconText, { color: COLORS.primaryDark }]}>＋</Text></View>
            <Text style={s.secondaryTitle}>Post a task</Text>
            <Text style={s.secondarySub}>Get a hand with your to-do list</Text>
            <Text style={s.secondaryArrow}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryCard} onPress={() => navigation.navigate('BrowseErrands')} activeOpacity={0.86}>
            <View style={[s.secondaryIcon, { backgroundColor: '#DDEDE8' }]}><Text style={[s.secondaryIconText, { color: COLORS.teal }]}>↗</Text></View>
            <Text style={s.secondaryTitle}>Find a task</Text>
            <Text style={s.secondarySub}>Put your skills to good use</Text>
            <Text style={s.secondaryArrow}>↗</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.sectionHeader}>
        <View><Text style={s.sectionTitle}>A quick look</Text><Text style={s.sectionSubtitle}>Your activity at a glance</Text></View>
      </View>
      <View style={s.statsRow}>
        {statsToShow.map((item) => (
          <View style={s.statCard} key={item.label}>
            <View style={s.statAccent} />
            <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={s.sectionHeader}>
        <View><Text style={s.sectionTitle}>Recently active</Text><Text style={s.sectionSubtitle}>A little momentum goes a long way</Text></View>
        <TouchableOpacity onPress={() => navigation.navigate(hasCreatorRole ? 'MyPostedTasks' : 'MyActiveTasks')}>
          <Text style={s.seeAll}>View tasks  →</Text>
        </TouchableOpacity>
      </View>

      <View style={s.activityCard}>
        {activity.length === 0 ? (
          <View style={s.emptyActivity}>
            <View style={s.emptyMark}><Text style={s.emptyGlyph}>↗</Text></View>
            <Text style={s.emptyTitle}>Your next chapter starts here</Text>
            <Text style={s.emptySubtitle}>Your latest task updates will show up here.</Text>
          </View>
        ) : activity.slice(0, 4).map((item, index) => {
          const date = item.updatedAt || item.timestamp
          const dateLabel = date
            ? new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
            : ''
          return (
            <View key={String(item.id ?? index)} style={[s.activityItem, index !== Math.min(activity.length, 4) - 1 && s.activityDivider]}>
              <View style={s.activityBullet}><Text style={s.activityBulletText}>{item.type === 'created' ? '+' : '•'}</Text></View>
              <View style={s.activityCopy}>
                <Text style={s.activityDescription} numberOfLines={2}>{(item.description || item.message || 'Task update').trim()}</Text>
                <Text style={s.activityMeta}>{[item.status, dateLabel].filter(Boolean).join('  ·  ') || 'Task update'}</Text>
              </View>
              <Text style={s.activityChevron}>›</Text>
            </View>
          )
        })}
      </View>

      {!canPost && hasRunnerRole && (
        <TouchableOpacity style={s.linkCard} onPress={() => navigation.navigate('MyCompletedTasks')}>
          <View style={s.linkIcon}><Text style={s.linkIconText}>✓</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.linkTitle}>Completed tasks</Text>
            <Text style={s.linkSubtitle}>See what you’ve accomplished so far.</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      )}
      {!canBrowse && hasCreatorRole && (
        <TouchableOpacity style={s.linkCard} onPress={() => navigation.navigate('MyPostedTasks')}>
          <View style={s.linkIcon}><Text style={s.linkIconText}>▤</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.linkTitle}>Your posted tasks</Text>
            <Text style={s.linkSubtitle}>Track progress and confirm completed work.</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>
      )}

      <Text style={s.footerText}>Small tasks. Real help. More room for life.</Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 36 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 15, paddingBottom: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 39, height: 39, borderRadius: 14, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { fontSize: 27, fontWeight: '900', color: COLORS.white, marginTop: -3 },
  brandDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, right: 6, bottom: 7, backgroundColor: COLORS.primary },
  brand: { fontSize: 17, fontWeight: '900', color: COLORS.ink, letterSpacing: -0.45 },
  brandSub: { marginTop: 3, fontSize: 8, fontWeight: '800', letterSpacing: 1.55, color: COLORS.textMuted },
  inboxButton: { width: 43, height: 43, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  inboxGlyph: { fontSize: 18, fontWeight: '900', letterSpacing: 1.6, color: COLORS.textPrimary, marginTop: -8 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, marginBottom: 20 },
  greetingTextWrap: { flex: 1 },
  greetingEyebrow: { fontSize: 9, color: COLORS.primaryDark, fontWeight: '900', letterSpacing: 2.1, marginBottom: 8 },
  greeting: { fontSize: 31, fontWeight: '900', letterSpacing: -1.1, color: COLORS.textPrimary },
  greetingSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 3 },
  avatar: { width: 54, height: 54, borderRadius: 20, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  profileNotice: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFF3DA', borderColor: '#F1DFB8', borderWidth: 1, borderRadius: RADIUS.md, padding: 13, marginBottom: 17 },
  profileNoticeMark: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#E8C77E', alignItems: 'center', justifyContent: 'center' },
  profileNoticeMarkText: { fontSize: 14, fontWeight: '900', color: '#69440E' },
  profileNoticeCopy: { flex: 1 },
  profileNoticeTitle: { fontSize: 12, fontWeight: '800', color: '#69440E' },
  profileNoticeSub: { fontSize: 11, lineHeight: 16, color: '#805E2B', marginTop: 3 },
  chevron: { fontSize: 25, color: COLORS.textMuted, marginLeft: 3 },
  heroCard: { backgroundColor: COLORS.ink, borderRadius: RADIUS.xl, padding: 23, overflow: 'hidden', marginBottom: 18 },
  heroOrbOne: { position: 'absolute', width: 185, height: 185, borderRadius: 95, right: -82, top: -88, backgroundColor: COLORS.inkSoft },
  heroOrbTwo: { position: 'absolute', width: 65, height: 65, borderRadius: 33, right: 32, top: 16, backgroundColor: COLORS.primary, opacity: 0.92 },
  heroEyebrow: { fontSize: 9, letterSpacing: 2, color: COLORS.accent, fontWeight: '900', marginBottom: 14 },
  heroTitle: { fontSize: 27, lineHeight: 31, fontWeight: '900', color: COLORS.white, letterSpacing: -0.75, maxWidth: 260 },
  heroBody: { fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.75)', marginTop: 9, marginBottom: 18, maxWidth: 285 },
  heroButton: { alignSelf: 'flex-start', paddingHorizontal: 21 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
  heroFooterText: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.68)' },
  secondaryActions: { flexDirection: 'row', gap: 11, marginBottom: 24 },
  secondaryCard: { flex: 1, minHeight: 154, backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: RADIUS.lg, padding: 14, ...SHADOW.sm },
  secondaryIcon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  secondaryIconText: { fontSize: 22, fontWeight: '800' },
  secondaryTitle: { fontSize: 13, fontWeight: '900', color: COLORS.textPrimary },
  secondarySub: { fontSize: 11, lineHeight: 16, color: COLORS.textSecondary, marginTop: 5 },
  secondaryArrow: { position: 'absolute', right: 13, top: 13, color: COLORS.textMuted, fontSize: 14, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '900', letterSpacing: -0.5, color: COLORS.textPrimary },
  sectionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  seeAll: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark },
  statsRow: { flexDirection: 'row', gap: 9, marginBottom: 24 },
  statCard: { flex: 1, minWidth: 0, padding: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  statAccent: { width: 20, height: 4, borderRadius: 2, backgroundColor: COLORS.primary, marginBottom: 12 },
  statValue: { fontSize: 17, fontWeight: '900', letterSpacing: -0.4, color: COLORS.textPrimary },
  statLabel: { fontSize: 10, lineHeight: 14, marginTop: 5, color: COLORS.textSecondary, fontWeight: '600' },
  activityCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: 16 },
  emptyActivity: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 25 },
  emptyMark: { width: 45, height: 45, borderRadius: 15, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  emptyGlyph: { fontSize: 21, fontWeight: '800', color: COLORS.primaryDark },
  emptyTitle: { textAlign: 'center', fontSize: 13, fontWeight: '900', color: COLORS.textPrimary },
  emptySubtitle: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 5 },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, paddingVertical: 14 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  activityBullet: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.backgroundDark },
  activityBulletText: { fontSize: 18, fontWeight: '700', color: COLORS.ink },
  activityCopy: { flex: 1 },
  activityDescription: { fontSize: 12, lineHeight: 18, color: COLORS.textPrimary, fontWeight: '700' },
  activityMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 4 },
  activityChevron: { fontSize: 22, color: COLORS.textMuted },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, marginBottom: 10 },
  linkIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#DDEDE8', alignItems: 'center', justifyContent: 'center' },
  linkIconText: { fontSize: 17, fontWeight: '900', color: COLORS.teal },
  linkTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  linkSubtitle: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
  footerText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 10, letterSpacing: 0.3, marginTop: 15 },
})
