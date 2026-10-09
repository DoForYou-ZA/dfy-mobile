import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { tasksApi, ratingsApi } from '../api'
import { LoadingScreen } from '../components/Common'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'
import type { DashboardStats } from '../types'

type ActionProps = {
  title: string
  subtitle: string
  icon: string
  tone: 'orange' | 'mint' | 'blue'
  onPress: () => void
}

function ActionCard({ title, subtitle, icon, tone, onPress }: ActionProps) {
  const toneStyle = tone === 'orange' ? s.actionOrange : tone === 'mint' ? s.actionMint : s.actionBlue
  const iconStyle = tone === 'orange' ? s.actionIconOrange : tone === 'mint' ? s.actionIconMint : s.actionIconBlue
  return (
    <TouchableOpacity
      style={[s.actionCard, toneStyle]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[s.actionIcon, iconStyle]}><Text style={s.actionIconText}>{icon}</Text></View>
      <Text style={s.actionTitle}>{title}</Text>
      <Text style={s.actionSubtitle}>{subtitle}</Text>
      <View style={s.actionArrow}><Text style={s.actionArrowText}>↗</Text></View>
    </TouchableOpacity>
  )
}

type StatProps = { label: string; value: string | number; tone: 'orange' | 'mint' | 'blue' | 'gold' }

function StatCard({ label, value, tone }: StatProps) {
  const toneStyle = tone === 'orange' ? s.statDotOrange
    : tone === 'mint' ? s.statDotMint
    : tone === 'blue' ? s.statDotBlue : s.statDotGold
  return (
    <View style={s.statCard}>
      <View style={[s.statDot, toneStyle]} />
      <Text style={s.statValue} numberOfLines={1}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  )
}

function formatRand(value: number | undefined) {
  return `R${(value ?? 0).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`
}

export default function DashboardScreen({ navigation }: any) {
  const { user, isProfileIncomplete, canPostErrands, canAcceptTasks } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [ratingsAvg, setRatingsAvg] = useState(0)
  const [ratingsTotalCount, setRatingsTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const userType = user?.userType || ''

  const load = useCallback(async () => {
    try {
      const [statsResult, activityResult] = await Promise.all([
        tasksApi.getDashboardStats().catch(() => ({ data: null })),
        tasksApi.getRecentActivity(4).catch(() => ({ data: null })),
      ])
      if (statsResult.data?.data) setStats(statsResult.data.data)
      const recent = activityResult.data?.data
      setActivity(Array.isArray(recent) ? recent : [])

      if ((userType === 'runner' || userType === 'both') && user?.id) {
        const ratingResult = await ratingsApi.getForUser(user.id, 1, 5).catch(() => ({ data: null }))
        const data = ratingResult.data?.data
        setRatingsAvg(data?.average || 0)
        setRatingsTotalCount(data?.count || 0)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userType, user?.id])

  useEffect(() => { void load() }, [load])

  const onRefresh = () => {
    setRefreshing(true)
    void load()
  }

  const firstName = user?.firstName?.trim() || user?.name?.trim().split(' ')[0] || 'there'
  const profileCompletion = Math.max(0, Math.min(100, user?.profileCompletion ?? 0))
  const roleLabel = userType === 'creator' ? 'TASK CREATOR'
    : userType === 'runner' ? 'TASK RUNNER'
    : userType === 'both' ? 'CREATOR + RUNNER' : 'YOUR DFY SPACE'

  if (loading) return <LoadingScreen message="Getting your DFY space ready…" />

  const statCards: StatProps[] = userType === 'creator'
    ? [
        { label: 'Posted tasks', value: stats?.postedTasks ?? 0, tone: 'orange' },
        { label: 'Awaiting confirmation', value: stats?.awaitingConfirmation ?? 0, tone: 'gold' },
        { label: 'Completed', value: stats?.completedPostedTasks ?? 0, tone: 'mint' },
        { label: 'Total spent', value: formatRand(stats?.totalSpent), tone: 'blue' },
      ]
    : userType === 'runner'
      ? [
          { label: 'Available tasks', value: stats?.availableTasks ?? 0, tone: 'orange' },
          { label: 'My active tasks', value: stats?.myActiveTasks ?? 0, tone: 'blue' },
          { label: 'Completed', value: stats?.runnerCompletedTasks ?? 0, tone: 'mint' },
          { label: 'Total earnings', value: formatRand(stats?.totalEarnings), tone: 'gold' },
        ]
      : userType === 'both'
        ? [
            { label: 'Posted by me', value: stats?.postedTasks ?? 0, tone: 'orange' },
            { label: 'Available', value: stats?.availableTasks ?? 0, tone: 'blue' },
            { label: 'Awaiting confirmation', value: stats?.awaitingConfirmation ?? 0, tone: 'gold' },
            { label: 'Earned', value: formatRand(stats?.totalEarnings), tone: 'mint' },
          ]
        : []

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.hero}>
        <View style={s.heroDecorLarge} />
        <View style={s.heroDecorSmall} />
        <View style={s.heroTopRow}>
          <Text style={s.eyebrow}>DOFORYOU · MADE FOR YOU</Text>
          <View style={s.rolePill}><Text style={s.rolePillText}>{roleLabel}</Text></View>
        </View>
        <Text style={s.heroTitle}>Good to see you, {firstName}.</Text>
        <Text style={s.heroSubtitle}>Small tasks. Real help. More time for what matters.</Text>
        <View style={s.heroFoot}>
          <View style={s.onlineDot} />
          <Text style={s.heroFootText}>Your community, one task at a time</Text>
        </View>
      </View>

      <View style={s.body}>
        {isProfileIncomplete() && (
          <TouchableOpacity style={s.profileCard} onPress={() => navigation.navigate('Profile')} activeOpacity={0.82}>
            <View style={s.profileIcon}><Text style={s.profileIconText}>✦</Text></View>
            <View style={s.profileCopy}>
              <View style={s.profileTitleRow}>
                <Text style={s.profileTitle}>Finish setting up</Text>
                <Text style={s.profilePercent}>{profileCompletion}%</Text>
              </View>
              <Text style={s.profileSubtitle}>Complete your profile to unlock the full DFY experience.</Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${profileCompletion}%` as any }]} />
              </View>
            </View>
            <Text style={s.profileArrow}>›</Text>
          </TouchableOpacity>
        )}

        <View style={s.sectionHeading}>
          <View>
            <Text style={s.sectionEyebrow}>LET'S GET STARTED</Text>
            <Text style={s.sectionTitle}>What would you like to do?</Text>
          </View>
        </View>

        <View style={s.actionsGrid}>
          {canPostErrands() && !isProfileIncomplete() && (
            <ActionCard title="Post a task" subtitle="Get a helping hand" icon="+" tone="orange" onPress={() => navigation.navigate('PostErrand')} />
          )}
          {canAcceptTasks() && (
            <ActionCard title="Find tasks" subtitle="Put your skills to work" icon="⌕" tone="mint" onPress={() => navigation.navigate('BrowseErrands')} />
          )}
          {(userType === 'creator' || userType === 'both') && (
            <ActionCard title="My posted tasks" subtitle="Manage your requests" icon="↗" tone="blue" onPress={() => navigation.navigate('MyPostedTasks')} />
          )}
          {(userType === 'runner' || userType === 'both') && (
            <ActionCard title="My active tasks" subtitle="Keep things moving" icon="✓" tone="mint" onPress={() => navigation.navigate('MyActiveTasks')} />
          )}
          {userType === 'both' && (
            <ActionCard title="Completed tasks" subtitle="See your track record" icon="★" tone="orange" onPress={() => navigation.navigate('MyCompletedTasks')} />
          )}
        </View>

        {statCards.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeading}>
              <View>
                <Text style={s.sectionEyebrow}>A LITTLE SNAPSHOT</Text>
                <Text style={s.sectionTitle}>Your activity</Text>
              </View>
            </View>
            <View style={s.statsGrid}>
              {statCards.map(item => <StatCard key={item.label} {...item} />)}
            </View>
          </View>
        )}

        {(userType === 'runner' || userType === 'both') && (
          <View style={s.ratingCard}>
            <View style={s.ratingIcon}><Text style={s.ratingStar}>★</Text></View>
            <View style={s.ratingCopy}>
              <Text style={s.ratingTitle}>Your community rating</Text>
              <Text style={s.ratingSubtitle}>
                {ratingsTotalCount > 0 ? `${ratingsTotalCount} review${ratingsTotalCount === 1 ? '' : 's'} from task creators` : 'Complete tasks to start receiving reviews.'}
              </Text>
            </View>
            <View style={s.ratingScore}>
              <Text style={s.ratingScoreValue}>{ratingsAvg.toFixed(1)}</Text>
              <Text style={s.ratingScoreOutOf}>/ 5</Text>
            </View>
          </View>
        )}

        <View style={s.section}>
          <View style={s.sectionHeading}>
            <View>
              <Text style={s.sectionEyebrow}>STAY IN THE LOOP</Text>
              <Text style={s.sectionTitle}>Recent activity</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} accessibilityRole="button">
              <Text style={s.viewAll}>View alerts ↗</Text>
            </TouchableOpacity>
          </View>

          {activity.length > 0 ? activity.map((item, index) => (
            <View key={item.id ?? `${item.type ?? 'activity'}-${index}`} style={s.activityRow}>
              <View style={[s.activityMarker, index === 0 && s.activityMarkerFirst]}>
                <Text style={s.activityMarkerText}>{item.type === 'created' ? '+' : '↗'}</Text>
              </View>
              <View style={s.activityCopy}>
                <Text style={s.activityText} numberOfLines={2}>
                  {(item.description || item.message || 'Task activity updated').substring(0, 110)}
                </Text>
                <Text style={s.activityMeta}>
                  {item.updatedAt || item.timestamp
                    ? new Date(item.updatedAt || item.timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                    : 'Recent'}{item.status ? ` · ${item.status}` : ''}
                </Text>
              </View>
            </View>
          )) : (
            <View style={s.emptyActivity}>
              <Text style={s.emptyActivityIcon}>✦</Text>
              <Text style={s.emptyActivityText}>Your latest task updates will appear here.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={s.profileShortcut} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
          <View style={s.profileShortcutMark}><Text style={s.profileShortcutInitial}>{firstName.charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileShortcutTitle}>Your profile</Text>
            <Text style={s.profileShortcutSubtitle}>Personal details, bank account and preferences</Text>
          </View>
          <Text style={s.profileArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 30 },
  hero: {
    backgroundColor: '#FFF0E0', paddingHorizontal: SPACING.lg,
    paddingTop: 25, paddingBottom: 27, overflow: 'hidden',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28, position: 'relative',
  },
  heroDecorLarge: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#FFE1C3', right: -58, top: -36 },
  heroDecorSmall: { position: 'absolute', width: 85, height: 85, borderRadius: 43, backgroundColor: '#DDF7F1', right: 52, bottom: -35 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  eyebrow: { fontSize: 9, letterSpacing: 1.3, fontWeight: '900', color: COLORS.primaryDark },
  rolePill: { maxWidth: 150, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 6 },
  rolePillText: { fontSize: 9, letterSpacing: 0.4, fontWeight: '800', color: COLORS.textSecondary },
  heroTitle: { marginTop: 27, fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: -0.8, color: COLORS.textPrimary, maxWidth: 320 },
  heroSubtitle: { marginTop: 9, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary, maxWidth: 300 },
  heroFoot: { marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  heroFootText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  body: { paddingHorizontal: SPACING.md, paddingTop: 22, gap: 22 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: RADIUS.xl, padding: 14, ...SHADOW.sm },
  profileIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.backgroundDark, alignItems: 'center', justifyContent: 'center' },
  profileIconText: { color: COLORS.primaryDark, fontSize: 21, fontWeight: '800' },
  profileCopy: { flex: 1 },
  profileTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  profileTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 14 },
  profilePercent: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '800' },
  profileSubtitle: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  progressTrack: { height: 5, backgroundColor: COLORS.backgroundDark, borderRadius: 8, overflow: 'hidden', marginTop: 9 },
  progressFill: { height: 5, borderRadius: 8, backgroundColor: COLORS.primary },
  profileArrow: { color: COLORS.primaryDark, fontSize: 26, fontWeight: '500' },
  section: { gap: 13 },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  sectionEyebrow: { color: COLORS.textMuted, fontWeight: '900', fontSize: 9, letterSpacing: 1.4, marginBottom: 6 },
  sectionTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 20, letterSpacing: -0.45 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  actionCard: { flexGrow: 1, flexBasis: '46%', minWidth: 145, borderRadius: RADIUS.xl, padding: 15, borderWidth: 1, minHeight: 172, position: 'relative', overflow: 'hidden' },
  actionOrange: { backgroundColor: '#FFF0E0', borderColor: '#F9D9BB' },
  actionMint: { backgroundColor: '#E8F8F3', borderColor: '#D4EFE7' },
  actionBlue: { backgroundColor: '#EBF3FF', borderColor: '#D9E7FC' },
  actionIcon: { width: 41, height: 41, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  actionIconOrange: { backgroundColor: '#FFE0C0' },
  actionIconMint: { backgroundColor: '#D2F0E7' },
  actionIconBlue: { backgroundColor: '#DCEAFF' },
  actionIconText: { fontSize: 23, fontWeight: '800', color: COLORS.textPrimary },
  actionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2, color: COLORS.textPrimary },
  actionSubtitle: { fontSize: 11, lineHeight: 16, color: COLORS.textSecondary, marginTop: 5, paddingRight: 8 },
  actionArrow: { position: 'absolute', right: 13, bottom: 12, width: 26, height: 26, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actionArrowText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', flexGrow: 1, minHeight: 105, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, padding: 14, ...SHADOW.sm },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 12 },
  statDotOrange: { backgroundColor: COLORS.primary },
  statDotMint: { backgroundColor: COLORS.accent },
  statDotBlue: { backgroundColor: COLORS.info },
  statDotGold: { backgroundColor: COLORS.warning },
  statValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 15, marginTop: 4 },
  ratingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: 15 },
  ratingIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#FFF5D9', alignItems: 'center', justifyContent: 'center' },
  ratingStar: { color: COLORS.starColor, fontSize: 24 },
  ratingCopy: { flex: 1 },
  ratingTitle: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 13 },
  ratingSubtitle: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  ratingScore: { alignItems: 'flex-end' },
  ratingScoreValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900' },
  ratingScoreOutOf: { color: COLORS.textMuted, fontSize: 10 },
  viewAll: { color: COLORS.primaryDark, fontWeight: '800', fontSize: 11 },
  activityRow: { flexDirection: 'row', gap: 11, paddingVertical: 13, borderBottomColor: COLORS.borderLight, borderBottomWidth: 1 },
  activityMarker: { width: 30, height: 30, borderRadius: 11, backgroundColor: COLORS.backgroundDark, alignItems: 'center', justifyContent: 'center' },
  activityMarkerFirst: { backgroundColor: COLORS.accentLight },
  activityMarkerText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 15 },
  activityCopy: { flex: 1 },
  activityText: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  activityMeta: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
  emptyActivity: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: RADIUS.lg, padding: 22, alignItems: 'center' },
  emptyActivityIcon: { color: COLORS.primary, fontSize: 25, marginBottom: 8 },
  emptyActivityText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 12, lineHeight: 18 },
  profileShortcut: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  profileShortcutMark: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  profileShortcutInitial: { color: COLORS.primaryDark, fontSize: 17, fontWeight: '900' },
  profileShortcutTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '800' },
  profileShortcutSubtitle: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
})
