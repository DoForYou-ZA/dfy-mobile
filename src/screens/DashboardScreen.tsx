import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { tasksApi, ratingsApi } from '../api'
import { LoadingScreen } from '../components/Common'
import Button from '../components/Button'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'
import type { DashboardStats } from '../types'

export default function DashboardScreen({ navigation }: any) {
  const { user, isProfileIncomplete, canPostErrands, canAcceptTasks } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const userType = user?.userType || ''
  const displayName = user
    ? (user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.name)
    : 'there'
  const firstName = displayName.split(' ')[0] || 'there'
  const profileCompletion = user?.profileCompletion ?? 0

  const load = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        tasksApi.getDashboardStats().catch(() => ({ data: null })),
        tasksApi.getRecentActivity(4).catch(() => ({ data: null })),
      ])
      setStats(statsRes.data?.data || statsRes.data || null)
      const rows = activityRes.data?.data
      setActivity(Array.isArray(rows) ? rows.slice(0, 4) : [])
      if ((userType === 'runner' || userType === 'both') && user?.id) {
        const ratingRes = await ratingsApi.getForUser(user.id, 1, 1).catch(() => ({ data: null }))
        const value = ratingRes.data?.data || ratingRes.data
        if (value) setRating({ average: value.average || 0, count: value.count || 0 })
      }
    } catch {
      // The dashboard remains usable when optional summary endpoints are unavailable.
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userType, user?.id])

  useEffect(() => { load() }, [load])

  const refresh = () => {
    setRefreshing(true)
    load()
  }

  const isCreator = canPostErrands()
  const isRunner = canAcceptTasks()
  const statsCards = [
    ...(isCreator ? [
      { label: 'Tasks posted', value: stats?.postedTasks ?? 0, color: COLORS.primaryLight, symbol: '↗' },
      { label: 'Awaiting action', value: stats?.awaitingConfirmation ?? 0, color: COLORS.warningLight, symbol: '◷' },
    ] : []),
    ...(isRunner ? [
      { label: 'Available tasks', value: stats?.availableTasks ?? 0, color: COLORS.infoLight, symbol: '⌕' },
      { label: 'My active tasks', value: stats?.myActiveTasks ?? 0, color: COLORS.successLight, symbol: '✓' },
    ] : []),
    ...(isRunner ? [
      { label: 'Total earnings', value: `R${(stats?.totalEarnings ?? 0).toFixed(0)}`, color: COLORS.accentSoft, symbol: 'R' },
    ] : []),
    ...(isCreator ? [
      { label: 'Completed tasks', value: stats?.completedPostedTasks ?? 0, color: COLORS.successLight, symbol: '✓' },
    ] : []),
  ].slice(0, 4)

  if (loading) return <LoadingScreen message="Getting your DFY space ready..." />

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.welcome}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>YOUR DFY SPACE</Text>
          <Text style={s.heading}>Hey, {firstName} <Text style={s.wave}>✦</Text></Text>
          <Text style={s.welcomeSub}>A little progress goes a long way.</Text>
        </View>
        <View style={s.avatar}><Text style={s.avatarText}>{firstName.charAt(0).toUpperCase()}</Text></View>
      </View>

      <View style={s.heroCard}>
        <View style={s.heroDecorOne} />
        <View style={s.heroDecorTwo} />
        <View style={s.heroContent}>
          <View style={s.pill}><View style={s.pillDot} /><Text style={s.pillText}>MADE FOR GETTING THINGS DONE</Text></View>
          <Text style={s.heroTitle}>
            {isCreator && isRunner ? 'Make it happen. Earn along the way.'
              : isCreator ? 'What can we help you get done?'
              : isRunner ? 'Your next opportunity is out there.'
              : 'Let’s get your DFY journey started.'}
          </Text>
          <Text style={s.heroSubtitle}>
            {isCreator && isRunner ? 'Post a task when you need a hand, or find work that fits your day.'
              : isCreator ? 'Post a task, find the right help, and keep everything in one place.'
              : isRunner ? 'Explore local tasks, choose what suits you, and track your progress.'
              : 'Complete your profile to start posting or accepting tasks.'}
          </Text>
          <View style={s.heroActions}>
            {isCreator && (
              <Button title="＋ Post a task" onPress={() => navigation.navigate(isProfileIncomplete() ? 'Profile' : 'PostErrand')} size="md" style={s.heroPrimary} />
            )}
            {isRunner && (
              <Button title="Explore tasks  →" onPress={() => navigation.navigate('BrowseErrands')} size="md" style={s.heroPrimary} />
            )}
            {!isCreator && !isRunner && (
              <Button title="Complete profile  →" onPress={() => navigation.navigate('Profile')} size="md" style={s.heroPrimary} />
            )}
          </View>
          <View style={s.heroFoot}><Text style={s.heroFootMark}>✓</Text><Text style={s.heroFootText}>Local people. Useful tasks. Real progress.</Text></View>
        </View>
      </View>

      {isProfileIncomplete() && (
        <TouchableOpacity style={s.profileCard} onPress={() => navigation.navigate('Profile')} activeOpacity={0.82}>
          <View style={s.profileIcon}><Text style={s.profileIconText}>↗</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileTitle}>Finish setting up your profile</Text>
            <Text style={s.profileSubtitle}>A complete profile helps unlock the right task actions.</Text>
            <View style={s.progressTrack}><View style={[s.progressFill, { width: `${Math.min(100, Math.max(0, profileCompletion))}%` as any }]} /></View>
          </View>
          <Text style={s.profileArrow}>›</Text>
        </TouchableOpacity>
      )}

      {statsCards.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHeading}>
            <View><Text style={s.sectionEyebrow}>AT A GLANCE</Text><Text style={s.sectionTitle}>Your activity</Text></View>
          </View>
          <View style={s.statsGrid}>
            {statsCards.map((item) => (
              <View key={item.label} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: item.color }]}><Text style={s.statSymbol}>{item.symbol}</Text></View>
                <Text style={s.statValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={s.section}>
        <View style={s.sectionHeading}>
          <View><Text style={s.sectionEyebrow}>PICK UP WHERE YOU LEFT OFF</Text><Text style={s.sectionTitle}>Your next move</Text></View>
        </View>
        <View style={s.actionList}>
          {isRunner && (
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('BrowseErrands')} activeOpacity={0.82}>
              <View style={[s.actionIcon, { backgroundColor: COLORS.infoLight }]}><Text style={[s.actionIconText, { color: COLORS.info }]}>⌕</Text></View>
              <View style={s.actionCopy}><Text style={s.actionTitle}>Find a task</Text><Text style={s.actionSubtitle}>Browse work that fits your skills and schedule.</Text></View>
              <Text style={s.actionArrow}>›</Text>
            </TouchableOpacity>
          )}
          {isCreator && (
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate(isProfileIncomplete() ? 'Profile' : 'PostErrand')} activeOpacity={0.82}>
              <View style={[s.actionIcon, { backgroundColor: COLORS.primaryLight }]}><Text style={[s.actionIconText, { color: COLORS.primaryDark }]}>＋</Text></View>
              <View style={s.actionCopy}><Text style={s.actionTitle}>Post a task</Text><Text style={s.actionSubtitle}>Tell the community what you need help with.</Text></View>
              <Text style={s.actionArrow}>›</Text>
            </TouchableOpacity>
          )}
          {isCreator && (
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('MyPostedTasks')} activeOpacity={0.82}>
              <View style={[s.actionIcon, { backgroundColor: COLORS.warningLight }]}><Text style={[s.actionIconText, { color: COLORS.warningDark }]}>◷</Text></View>
              <View style={s.actionCopy}><Text style={s.actionTitle}>Manage posted tasks</Text><Text style={s.actionSubtitle}>Review progress, confirmations, and updates.</Text></View>
              <Text style={s.actionArrow}>›</Text>
            </TouchableOpacity>
          )}
          {isRunner && (
            <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('MyActiveTasks')} activeOpacity={0.82}>
              <View style={[s.actionIcon, { backgroundColor: COLORS.successLight }]}><Text style={[s.actionIconText, { color: COLORS.success }]}>✓</Text></View>
              <View style={s.actionCopy}><Text style={s.actionTitle}>My tasks</Text><Text style={s.actionSubtitle}>Keep track of active work and completion.</Text></View>
              <Text style={s.actionArrow}>›</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('MyCompletedTasks')} activeOpacity={0.82}>
            <View style={[s.actionIcon, { backgroundColor: COLORS.accentSoft }]}><Text style={[s.actionIconText, { color: COLORS.warningDark }]}>★</Text></View>
            <View style={s.actionCopy}><Text style={s.actionTitle}>Completed tasks</Text><Text style={s.actionSubtitle}>Look back at tasks you have finished.</Text></View>
            <Text style={s.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {(isRunner && rating && rating.count > 0) && (
        <View style={s.ratingStrip}>
          <View style={s.ratingStar}><Text style={s.ratingStarText}>★</Text></View>
          <View style={{ flex: 1 }}><Text style={s.ratingTitle}>Your community rating</Text><Text style={s.ratingSubtitle}>{rating.count} review{rating.count === 1 ? '' : 's'} from completed tasks</Text></View>
          <Text style={s.ratingNumber}>{rating.average.toFixed(1)}</Text>
        </View>
      )}

      <View style={s.section}>
        <View style={s.sectionHeading}>
          <View><Text style={s.sectionEyebrow}>THE LATEST</Text><Text style={s.sectionTitle}>Recent activity</Text></View>
        </View>
        {activity.length > 0 ? (
          <View style={s.activityCard}>
            {activity.map((item, index) => (
              <View key={item.id ?? index} style={[s.activityItem, index > 0 && s.activityDivider]}>
                <View style={s.activityDotWrap}><View style={s.activityDot} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityText} numberOfLines={2}>{(item.description || item.message || 'Task update').substring(0, 100)}</Text>
                  <Text style={s.activityMeta}>
                    {item.updatedAt || item.timestamp
                      ? new Date(item.updatedAt || item.timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                      : 'Recently'}
                    {item.status ? `  ·  ${item.status}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={s.emptyCard}>
            <View style={s.emptyIcon}><Text style={s.emptyIconText}>✦</Text></View>
            <Text style={s.emptyTitle}>Your story starts here</Text>
            <Text style={s.emptyText}>When you post or take on tasks, updates will show up here.</Text>
          </View>
        )}
      </View>
      <Text style={s.footer}>DOFORYOU  ·  GOOD THINGS GET DONE TOGETHER</Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 34 },
  welcome: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  greeting: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heading: { color: COLORS.textPrimary, fontSize: 27, fontWeight: '900', letterSpacing: -0.8, marginTop: 5 },
  wave: { color: COLORS.primary, fontSize: 24 },
  welcomeSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  avatarText: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '900' },
  heroCard: { backgroundColor: '#FFF0E2', borderWidth: 1, borderColor: '#F9DFC8', borderRadius: 26, padding: 19, overflow: 'hidden', marginBottom: 25 },
  heroDecorOne: { position: 'absolute', width: 130, height: 130, borderRadius: 65, right: -58, top: -54, backgroundColor: '#FFD9B7', opacity: 0.65 },
  heroDecorTwo: { position: 'absolute', width: 82, height: 82, borderRadius: 41, right: -25, top: 22, backgroundColor: '#FFE5A5', opacity: 0.68 },
  heroContent: { position: 'relative' },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.78)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 13 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  pillText: { color: COLORS.textSecondary, fontSize: 8, letterSpacing: 1, fontWeight: '900' },
  heroTitle: { color: COLORS.textPrimary, fontSize: 25, lineHeight: 30, fontWeight: '900', letterSpacing: -0.6, maxWidth: 305 },
  heroSubtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 310 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 17 },
  heroPrimary: { alignSelf: 'flex-start' },
  heroFoot: { flexDirection: 'row', alignItems: 'center', gap: 7, borderTopWidth: 1, borderTopColor: 'rgba(217,97,18,0.14)', paddingTop: 13, marginTop: 17 },
  heroFootMark: { backgroundColor: COLORS.successLight, color: COLORS.success, fontWeight: '900', overflow: 'hidden', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  heroFootText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 14, marginBottom: 25, ...SHADOW.sm },
  profileIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight },
  profileIconText: { color: COLORS.primaryDark, fontSize: 20, fontWeight: '800' },
  profileTitle: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '900' },
  profileSubtitle: { color: COLORS.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 3 },
  progressTrack: { height: 5, backgroundColor: COLORS.borderLight, borderRadius: 3, marginTop: 9, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: COLORS.primary },
  profileArrow: { color: COLORS.primary, fontSize: 27, paddingLeft: 3 },
  section: { marginBottom: 25 },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  sectionEyebrow: { color: COLORS.primaryDark, fontSize: 9, letterSpacing: 1.8, fontWeight: '900' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '900', letterSpacing: -0.4, marginTop: 3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', flexGrow: 1, minHeight: 111, padding: 14, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  statIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statSymbol: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary },
  statValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 3 },
  actionList: { gap: 9 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 19, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  actionIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionIconText: { fontSize: 22, fontWeight: '800' },
  actionCopy: { flex: 1 },
  actionTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '900' },
  actionSubtitle: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  actionArrow: { color: COLORS.textMuted, fontSize: 28, paddingLeft: 2 },
  ratingStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.accentSoft, borderRadius: 20, borderWidth: 1, borderColor: '#F4E5B2', padding: 15, marginBottom: 25 },
  ratingStar: { width: 39, height: 39, borderRadius: 14, backgroundColor: '#FFE9A5', alignItems: 'center', justifyContent: 'center' },
  ratingStarText: { color: COLORS.warningDark, fontSize: 22 },
  ratingTitle: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '900' },
  ratingSubtitle: { color: COLORS.textSecondary, fontSize: 10, marginTop: 3 },
  ratingNumber: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900' },
  activityCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: 20, paddingHorizontal: 15, ...SHADOW.sm },
  activityItem: { flexDirection: 'row', gap: 10, paddingVertical: 14 },
  activityDivider: { borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  activityDotWrap: { width: 24, alignItems: 'center', paddingTop: 5 },
  activityDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary },
  activityText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  activityMeta: { color: COLORS.textMuted, fontSize: 10, marginTop: 5 },
  emptyCard: { alignItems: 'center', padding: 24, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: 20 },
  emptyIcon: { width: 46, height: 46, borderRadius: 17, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyIconText: { fontSize: 22, color: COLORS.primary },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '900' },
  emptyText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
  footer: { color: COLORS.textMuted, fontSize: 8, fontWeight: '800', letterSpacing: 1.6, textAlign: 'center', paddingTop: 3, paddingBottom: 5 },
})
