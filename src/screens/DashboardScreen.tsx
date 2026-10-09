import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { tasksApi, ratingsApi } from '../api'
import { LoadingScreen, SectionCard, SectionHeader } from '../components/Common'
import Button from '../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW, GLOBAL } from '../config/theme'
import type { DashboardStats } from '../types'

export default function DashboardScreen({ navigation }: any) {
  const { user, isProfileIncomplete, isAdmin, canPostErrands, canAcceptTasks } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [ratingsAvg, setRatingsAvg] = useState(0)
  const [ratingsTotalCount, setRatingsTotalCount] = useState(0)
  const [ratingsBreakdown, setRatingsBreakdown] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const userType = user?.userType || ''

  const load = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        tasksApi.getDashboardStats().catch(() => ({ data: null })),
        tasksApi.getRecentActivity(5).catch(() => ({ data: null })),
      ])
      if (sRes.data?.data) setStats(sRes.data.data)
      const acts = aRes.data?.data
      setActivity(Array.isArray(acts) ? acts : [])
      if ((userType === 'runner' || userType === 'both') && user?.id) {
        const rRes = await ratingsApi.getForUser(user.id, 1, 5).catch(() => ({ data: null }))
        const d = rRes.data?.data
        setRatings(d?.ratings || [])
        setRatingsAvg(d?.average || 0)
        setRatingsTotalCount(d?.count || 0)
        setRatingsBreakdown(d?.starBreakdown || {})
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }

  useEffect(() => { load() }, [])
  const onRefresh = () => { setRefreshing(true); load() }

  const displayName = user
    ? (user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.name)
    : ''
  const profileCompletion = user?.profileCompletion ?? 0

  if (loading) return <LoadingScreen message="Loading dashboard..." />

  // Matches web stat-card layout exactly
  const creatorStats = [
    { label: 'Posted Tasks', value: stats?.postedTasks ?? 0, bg: 'bg-primary' },
    { label: 'Pending Payment', value: stats?.pendingPayment ?? 0, bg: 'bg-danger' },
    { label: 'Active Tasks', value: stats?.activeTasks ?? 0, bg: 'bg-warning' },
    { label: 'Awaiting Confirm', value: stats?.awaitingConfirmation ?? 0, bg: 'bg-info' },
    { label: 'Completed', value: stats?.completedPostedTasks ?? 0, bg: 'bg-success' },
    { label: 'Total Spent', value: `R${(stats?.totalSpent ?? 0).toFixed(0)}`, bg: 'bg-dark' },
    { label: 'This Month', value: `R${(stats?.thisMonthSpending ?? 0).toFixed(0)}`, bg: 'bg-secondary' },
    { label: 'Avg Task Cost', value: `R${(stats?.averageTaskCost ?? 0).toFixed(0)}`, bg: 'bg-primary' },
  ]
  const runnerStats = [
    { label: 'Available Tasks', value: stats?.availableTasks ?? 0, bg: 'bg-info' },
    { label: 'My Active', value: stats?.myActiveTasks ?? 0, bg: 'bg-warning' },
    { label: 'Completed', value: stats?.runnerCompletedTasks ?? 0, bg: 'bg-success' },
    { label: 'Total Earnings', value: `R${(stats?.totalEarnings ?? 0).toFixed(0)}`, bg: 'bg-primary' },
        { label: 'Payouts Pending', value: `R${(stats?.pendingPayouts ?? 0).toFixed(0)}`, bg: 'bg-warning' },
    { label: 'This Month', value: `R${(stats?.thisMonthEarnings ?? 0).toFixed(0)}`, bg: 'bg-info' },
    { label: 'Completion Rate', value: `${(stats?.completionRate ?? 0).toFixed(0)}%`, bg: 'bg-dark' },
  ]

  const iconBg: Record<string, string> = {
    'bg-primary': COLORS.primary, 'bg-success': COLORS.success,
    'bg-warning': COLORS.warning, 'bg-danger': COLORS.danger,
    'bg-info': COLORS.info, 'bg-secondary': COLORS.secondary,
    'bg-dark': '#374151',
  }

  const currentStats = userType === 'creator' ? creatorStats
    : userType === 'runner' ? runnerStats
    : userType === 'both' ? [...creatorStats, ...runnerStats]
    : []

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* .dashboard-header — orange gradient */}
      <View style={s.dashHeader}>
        <View style={s.dashHeaderInner}>
          {userType === 'creator' && <Text style={s.dashTitle}>Task Creator Dashboard</Text>}
          {userType === 'runner' && <Text style={s.dashTitle}>Task Runner Dashboard</Text>}
          {userType === 'both' && <Text style={s.dashTitle}>My Dashboard</Text>}
          {!userType && <Text style={s.dashTitle}>Welcome, {displayName.split(' ')[0]}!</Text>}
          <Text style={s.dashSub}>
            {userType === 'creator' ? 'Manage and track your posted tasks'
              : userType === 'runner' ? 'Find tasks and track your earnings'
              : userType === 'both' ? 'Manage your tasks as both creator and runner'
              : 'Set up your profile to get started'}
          </Text>

          {/* .profile-alert */}
          {isProfileIncomplete() && (
            <TouchableOpacity style={s.profileAlert} onPress={() => navigation.navigate('Profile')}>
              <View style={{ flex: 1 }}>
                <Text style={s.profileAlertTitle}>Profile Completion: {profileCompletion}%</Text>
                <View style={s.progressWrap}>
                  <View style={[s.progressFill, { width: `${profileCompletion}%` as any }]} />
                </View>
                <Text style={s.profileAlertSub}>Complete your profile to unlock all features</Text>
              </View>
              <Button title="Complete Profile" onPress={() => navigation.navigate('Profile')} variant="secondary" size="sm" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={s.body}>
        {/* .stats-grid */}
        {currentStats.length > 0 && (
          <View style={s.statsGrid}>
            {currentStats.map((st, i) => (
              <View key={i} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: iconBg[st.bg] || COLORS.primary }]} />
                <View style={s.statContent}>
                  <Text style={s.statValue}>{st.value}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {activity.length > 0 && (
          <SectionCard>
            <SectionHeader title="Recent Activity" />
            <View style={s.activityFeed}>
              {activity.map((a, i) => (
                <View key={i} style={s.activityItem}>
                  <Text style={s.activityIcon}>
                    {a.type === 'created' ? '➕' : '🤝'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.activityText} numberOfLines={2}>
                      {(a.description || a.message || '').substring(0, 80)}
                    </Text>
                    <Text style={s.activityMeta}>
                      {new Date(a.updatedAt || a.timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {'  ·  '}{a.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {/* Ratings */}
        {(userType === 'runner' || userType === 'both') && (
          <SectionCard>
            <SectionHeader title="My Ratings" />
            {ratingsTotalCount === 0 ? (
              <Text style={s.emptyText}>No ratings yet. Complete tasks to receive reviews.</Text>
            ) : (
              <>
                <View style={s.ratingsStats}>
                  <View style={s.ratingsScore}>
                    <Text style={s.ratingsScoreNum}>{ratingsAvg.toFixed(1)}</Text>
                    <Text style={s.ratingsStars}>{'★'.repeat(Math.round(ratingsAvg))}{'☆'.repeat(5 - Math.round(ratingsAvg))}</Text>
                    <Text style={s.ratingsCount}>{ratingsTotalCount} review{ratingsTotalCount !== 1 ? 's' : ''}</Text>
                  </View>
                  <View style={s.ratingsBars}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const cnt = ratingsBreakdown[star] || 0
                      const pct = ratingsTotalCount > 0 ? Math.round((cnt / ratingsTotalCount) * 100) : 0
                      return (
                        <View key={star} style={s.ratingsBarRow}>
                          <Text style={s.ratingsBarLabel}>{star}</Text>
                          <Text style={s.ratingsBarStar}>★</Text>
                          <View style={s.ratingsBarTrack}>
                            <View style={[s.ratingsBarFill, { width: `${pct}%` as any }]} />
                          </View>
                          <Text style={s.ratingsBarCount}>{cnt}</Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
                {ratings.map((r: any) => (
                  <View key={r.id} style={s.ratingCard}>
                    <View style={s.ratingCardHeader}>
                      <Text style={s.ratingCardTitle} numberOfLines={2}>{r.taskName || r.taskDescription || 'Task'}</Text>
                      <Text style={s.ratingCardStars}>{'★'.repeat(r.ratingValue)}{'☆'.repeat(5 - r.ratingValue)}</Text>
                    </View>
                    {r.review && <Text style={s.ratingCardReview}>"{r.review}"</Text>}
                    <Text style={s.ratingCardMeta}>by {r.ratedBy} · {new Date(r.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  </View>
                ))}
              </>
            )}
          </SectionCard>
        )}

        {/* Quick Actions */}
        <SectionCard>
          <SectionHeader title="Quick Actions" />
          <View style={s.quickActions}>
            {canPostErrands() && !isProfileIncomplete() && (
              <Button title="Post New Task" onPress={() => navigation.navigate('PostErrand')} size="sm" />
            )}
            {canAcceptTasks() && (
              <Button title="Find Tasks" onPress={() => navigation.navigate('BrowseErrands')} size="sm" />
            )}
            {(userType === 'creator' || userType === 'both') && (
              <Button title="My Posted Tasks" onPress={() => navigation.navigate('MyPostedTasks')} variant="outline" size="sm" />
            )}
            {(userType === 'runner' || userType === 'both') && (
              <Button title="My Active Tasks" onPress={() => navigation.navigate('MyActiveTasks')} variant="outline" size="sm" />
            )}
            <Button title="My Profile" onPress={() => navigation.navigate('Profile')} variant="secondary" size="sm" />
            <Button title="Wallet" onPress={() => navigation.navigate('Wallet')} variant="secondary" size="sm" />
            {isProfileIncomplete() && (
              <Button title="Complete Profile" onPress={() => navigation.navigate('Profile')} size="sm" />
            )}
          </View>
        </SectionCard>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },

  // .dashboard-header
  dashHeader: { backgroundColor: COLORS.primary, paddingBottom: SPACING.lg },
  dashHeaderInner: { padding: SPACING.lg, paddingTop: SPACING.lg },
  dashTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  dashSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

  // .profile-alert
  profileAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.lg,
    padding: 16, marginTop: 20, flexWrap: 'wrap',
  },
  profileAlertTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 6 },
  progressWrap: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: 220, maxWidth: '100%', marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  profileAlertSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  body: { padding: SPACING.md, gap: SPACING.md },

  // .stats-grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.md },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: COLORS.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  statIcon: { width: 48, height: 48, borderRadius: RADIUS.lg },
  statContent: { flex: 1 },
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // .activity-feed
  activityFeed: { gap: 8 },
  activityItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    padding: 14, backgroundColor: COLORS.background, borderRadius: RADIUS.lg,
  },
  activityIcon: { fontSize: 14, marginTop: 2 },
  activityText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  activityMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },

  emptyText: { fontSize: 14, color: COLORS.textSecondary, padding: 8 },

  // .ratings-stats
  ratingsStats: { flexDirection: 'row', gap: 24, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' },
  ratingsScore: { alignItems: 'center' },
  ratingsScoreNum: { fontSize: 40, fontWeight: '700', color: COLORS.starColor, lineHeight: 44 },
  ratingsStars: { color: COLORS.starColor, fontSize: 18, marginVertical: 2 },
  ratingsCount: { fontSize: 12, color: COLORS.textSecondary },
  ratingsBars: { flex: 1, minWidth: 160 },
  ratingsBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  ratingsBarLabel: { fontSize: 12, color: COLORS.textSecondary, width: 10, textAlign: 'right' },
  ratingsBarStar: { color: COLORS.starColor, fontSize: 11 },
  ratingsBarTrack: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  ratingsBarFill: { height: 6, backgroundColor: COLORS.starColor, borderRadius: 3 },
  ratingsBarCount: { fontSize: 12, color: COLORS.textSecondary, width: 20 },

  // .rating-card
  ratingCard: {
    backgroundColor: COLORS.background, borderRadius: RADIUS.lg,
    padding: 14, borderWidth: 1, borderColor: COLORS.border, marginTop: 10,
  },
  ratingCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  ratingCardTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  ratingCardStars: { color: COLORS.starColor, fontWeight: '700', fontSize: 14 },
  ratingCardReview: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 4 },
  ratingCardMeta: { fontSize: 12, color: COLORS.textSecondary },

  // .quick-actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
})
