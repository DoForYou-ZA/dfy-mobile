import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { tasksApi, ratingsApi } from '../api'
import { LoadingScreen } from '../components/Common'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'
import type { DashboardStats } from '../types'

type ActionProps = { icon: string; title: string; detail: string; color: string; onPress: () => void }

function ActionCard({ icon, title, detail, color, onPress }: ActionProps) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.82} accessibilityRole="button">
      <View style={[styles.actionIconWrap, { backgroundColor: color }]}><Text style={styles.actionIcon}>{icon}</Text></View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDetail}>{detail}</Text>
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  )
}

export default function DashboardScreen({ navigation }: any) {
  const { user, isProfileIncomplete, canPostErrands, canAcceptTasks } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [rating, setRating] = useState<number | null>(null)
  const [ratingCount, setRatingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const userType = user?.userType || ''
  const canPost = canPostErrands()
  const canBrowse = canAcceptTasks()
  const firstName = user?.firstName?.trim() || user?.name?.trim().split(' ')[0] || 'there'

  const load = useCallback(async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        tasksApi.getDashboardStats().catch(() => ({ data: null })),
        tasksApi.getRecentActivity(4).catch(() => ({ data: null })),
      ])
      setStats(statsResponse.data?.data || null)
      const recent = activityResponse.data?.data
      setActivity(Array.isArray(recent) ? recent.slice(0, 4) : [])
      if ((userType === 'runner' || userType === 'both') && user?.id) {
        const ratingsResponse = await ratingsApi.getForUser(user.id, 1, 1).catch(() => ({ data: null }))
        const data = ratingsResponse.data?.data
        setRating(typeof data?.average === 'number' ? data.average : null)
        setRatingCount(data?.count || 0)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, userType])

  useEffect(() => { load() }, [load])
  const refresh = () => { setRefreshing(true); load() }

  if (loading) return <LoadingScreen message="Getting your day ready..." />

  const statItems = userType === 'creator'
    ? [
        { label: 'Posted', value: stats?.postedTasks ?? 0, color: COLORS.primary, icon: '📌' },
        { label: 'In progress', value: stats?.activeTasks ?? 0, color: COLORS.info, icon: '⚡' },
        { label: 'Needs attention', value: (stats?.pendingPayment ?? 0) + (stats?.awaitingConfirmation ?? 0), color: COLORS.warning, icon: '👀' },
        { label: 'Completed', value: stats?.completedPostedTasks ?? 0, color: COLORS.success, icon: '✓' },
      ]
    : userType === 'runner'
      ? [
          { label: 'Available', value: stats?.availableTasks ?? 0, color: COLORS.primary, icon: '🔎' },
          { label: 'My active', value: stats?.myActiveTasks ?? 0, color: COLORS.info, icon: '⚡' },
          { label: 'Completed', value: stats?.runnerCompletedTasks ?? 0, color: COLORS.success, icon: '✓' },
          { label: 'Payouts pending', value: `R${(stats?.pendingPayouts ?? 0).toFixed(0)}`, color: COLORS.accent, icon: '↗' },
        ]
      : [
          { label: 'Posted tasks', value: stats?.postedTasks ?? 0, color: COLORS.primary, icon: '📌' },
          { label: 'Available', value: stats?.availableTasks ?? 0, color: COLORS.info, icon: '🔎' },
          { label: 'Active', value: stats?.activeTasks ?? 0, color: COLORS.accent, icon: '⚡' },
          { label: 'Completed', value: (stats?.completedPostedTasks ?? 0) + (stats?.runnerCompletedTasks ?? 0), color: COLORS.success, icon: '✓' },
        ]

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.eyebrow}>YOUR DOFORYOU SPACE</Text>
          <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
          <Text style={styles.welcomeSub}>A little help can make a big difference.</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')} accessibilityRole="button">
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroOrb} />
        <View style={styles.heroContent}>
          <View style={styles.heroTag}><View style={styles.liveDot} /><Text style={styles.heroTagText}>MADE FOR YOUR EVERYDAY</Text></View>
          <Text style={styles.heroTitle}>{canPost ? 'What can we help you with?' : 'Ready to make things happen?'}</Text>
          <Text style={styles.heroSubtitle}>{canPost && canBrowse ? 'Post a task or find one to earn. Your next step starts here.' : canPost ? 'Post a task and connect with someone who can help.' : 'Discover tasks nearby and turn your time into earnings.'}</Text>
          <View style={styles.heroButtons}>
            {canPost && <TouchableOpacity style={styles.heroPrimaryButton} onPress={() => navigation.navigate('PostErrand')}><Text style={styles.heroPrimaryText}>＋ Post a task</Text></TouchableOpacity>}
            {canBrowse && <TouchableOpacity style={styles.heroSecondaryButton} onPress={() => navigation.navigate('BrowseErrands')}><Text style={styles.heroSecondaryText}>Explore tasks  ›</Text></TouchableOpacity>}
            {!canPost && !canBrowse && <TouchableOpacity style={styles.heroPrimaryButton} onPress={() => navigation.navigate('Profile')}><Text style={styles.heroPrimaryText}>Finish your profile  ›</Text></TouchableOpacity>}
          </View>
        </View>
      </View>

      {isProfileIncomplete() && (
        <TouchableOpacity style={styles.profilePrompt} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
          <View style={styles.profilePromptIcon}><Text style={styles.profilePromptIconText}>✦</Text></View>
          <View style={styles.profilePromptCopy}>
            <Text style={styles.profilePromptTitle}>Make your profile shine</Text>
            <Text style={styles.profilePromptSub}>Add your details to unlock the full experience.</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeading}>
        <View><Text style={styles.sectionTitle}>Your snapshot</Text><Text style={styles.sectionSub}>A quick look at how things are going</Text></View>
        <View style={styles.todayPill}><Text style={styles.todayPillText}>OVERVIEW</Text></View>
      </View>
      <View style={styles.statsGrid}>
        {statItems.map(item => (
          <View key={item.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: item.color + '18' }]}><Text style={styles.statEmoji}>{item.icon}</Text></View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {(userType === 'runner' || userType === 'both') && (
        <View style={styles.ratingStrip}>
          <View style={styles.ratingStar}><Text style={styles.ratingStarText}>★</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ratingTitle}>{rating === null ? 'Your reputation starts here' : `${rating.toFixed(1)} out of 5.0`}</Text>
            <Text style={styles.ratingSub}>{ratingCount ? `Based on ${ratingCount} review${ratingCount === 1 ? '' : 's'} from completed tasks` : 'Complete tasks to start collecting ratings.'}</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </View>
      )}

      <View style={styles.sectionHeading}>
        <View><Text style={styles.sectionTitle}>Jump back in</Text><Text style={styles.sectionSub}>Your most useful shortcuts</Text></View>
      </View>
      <View style={styles.actionList}>
        {canBrowse && <ActionCard icon="⌕" title="Find a task" detail="Explore tasks you can take on" color="#E2F1FF" onPress={() => navigation.navigate('BrowseErrands')} />}
        {canPost && <ActionCard icon="＋" title="Post a task" detail="Get help with something on your list" color="#FFF0DB" onPress={() => navigation.navigate('PostErrand')} />}
        {(userType === 'creator' || userType === 'both') && <ActionCard icon="▤" title="Tasks I posted" detail="Manage tasks and confirmations" color="#F1E8FF" onPress={() => navigation.navigate('MyPostedTasks')} />}
        {(userType === 'runner' || userType === 'both') && <ActionCard icon="↗" title="My active tasks" detail="Keep track of what you're working on" color="#DFF6EF" onPress={() => navigation.navigate('MyActiveTasks')} />}
        <ActionCard icon="◷" title="Completed tasks" detail="Look back at finished work" color="#E8F5E7" onPress={() => navigation.navigate('MyCompletedTasks')} />
      </View>

      {activity.length > 0 && (
        <View style={styles.activityCard}>
          <View style={styles.activityHeading}><Text style={styles.sectionTitle}>Recent activity</Text><Text style={styles.activitySpark}>✦</Text></View>
          {activity.map((item, index) => (
            <View key={item.id ?? `${item.updatedAt ?? item.timestamp ?? 'activity'}-${index}`} style={[styles.activityRow, index === activity.length - 1 && styles.activityRowLast]}>
              <View style={styles.activityDot}><Text style={styles.activityDotText}>{item.type === 'created' ? '+' : '↗'}</Text></View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityText} numberOfLines={2}>{(item.description || item.message || 'Your task was updated').substring(0, 100)}</Text>
                <Text style={styles.activityMeta}>{item.updatedAt || item.timestamp ? new Date(item.updatedAt || item.timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : 'Recently'}{item.status ? `  ·  ${item.status}` : ''}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.endNote}>Small tasks. Real help. Better days.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: 32, gap: 20 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  welcomeCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.35, color: COLORS.primaryDark, marginBottom: 5 },
  greeting: { fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.8, color: COLORS.textPrimary },
  welcomeSub: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary, marginTop: 3 },
  avatar: { width: 48, height: 48, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.primary },
  avatarText: { color: COLORS.white, fontSize: 21, fontWeight: '800' },
  heroCard: { backgroundColor: '#FF8A00', borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW.primary },
  heroContent: { padding: 20, zIndex: 1 },
  heroOrb: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 30, borderColor: 'rgba(255,255,255,0.13)', right: -66, bottom: -88 },
  heroTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: RADIUS.full },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  heroTagText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 25, lineHeight: 30, fontWeight: '800', letterSpacing: -0.6, marginTop: 16, maxWidth: 300 },
  heroSubtitle: { color: 'rgba(255,255,255,0.94)', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 310 },
  heroButtons: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 20 },
  heroPrimaryButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 12, borderRadius: RADIUS.md },
  heroPrimaryText: { color: '#A95500', fontSize: 13, fontWeight: '800' },
  heroSecondaryButton: { paddingHorizontal: 8, paddingVertical: 12 },
  heroSecondaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  profilePrompt: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  profilePromptIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  profilePromptIconText: { color: COLORS.primaryDark, fontSize: 22, fontWeight: '800' },
  profilePromptCopy: { flex: 1 },
  profilePromptTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  profilePromptSub: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sectionSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  todayPill: { backgroundColor: COLORS.accentLight, borderRadius: RADIUS.full, paddingHorizontal: 9, paddingVertical: 6 },
  todayPillText: { color: COLORS.accent, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: -8 },
  statCard: { width: '48%', flexGrow: 1, minWidth: '43%', backgroundColor: '#FFFFFF', borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  statIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statEmoji: { fontSize: 17 },
  statValue: { color: COLORS.textPrimary, fontSize: 23, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 4 },
  ratingStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', padding: 14, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight },
  ratingStar: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#FFF2D3', alignItems: 'center', justifyContent: 'center' },
  ratingStarText: { color: COLORS.starColor, fontSize: 23 },
  ratingTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' },
  ratingSub: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
  actionList: { gap: 10, marginTop: -8 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, padding: 13, ...SHADOW.sm },
  actionIconWrap: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700' },
  actionCopy: { flex: 1 },
  actionTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' },
  actionDetail: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
  actionArrow: { color: COLORS.textMuted, fontSize: 28, lineHeight: 30, paddingHorizontal: 2 },
  activityCard: { backgroundColor: '#FFFFFF', borderRadius: RADIUS.xl, padding: 16, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  activityHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  activitySpark: { color: COLORS.primary, fontSize: 21 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  activityRowLast: { borderBottomWidth: 0 },
  activityDot: { width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  activityDotText: { color: COLORS.primaryDark, fontSize: 14, fontWeight: '800' },
  activityCopy: { flex: 1 },
  activityText: { color: COLORS.textPrimary, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  activityMeta: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
  endNote: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, fontWeight: '600', paddingTop: 2 },
})
