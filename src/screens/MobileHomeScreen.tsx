import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { tasksApi } from '../api'
import { LoadingScreen } from '../components/Common'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'
import type { DashboardStats } from '../types'

function ActionTile({ icon, title, subtitle, onPress, accent = false }: {
  icon: string; title: string; subtitle: string; onPress: () => void; accent?: boolean
}) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={[s.actionTile, accent && s.actionTileAccent]}>
      <View style={[s.actionIcon, accent && s.actionIconAccent]}><Text style={s.actionEmoji}>{icon}</Text></View>
      <Text style={s.actionTitle}>{title}</Text>
      <Text style={s.actionSubtitle}>{subtitle}</Text>
      <Text style={[s.actionArrow, accent && { color: COLORS.primary }]}>↗</Text>
    </TouchableOpacity>
  )
}

export default function MobileHomeScreen({ navigation }: any) {
  const { user, isProfileIncomplete, canPostErrands, canAcceptTasks } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const userType = user?.userType || ''
  const displayName = user?.firstName || user?.name?.split(' ')[0] || 'there'

  const load = useCallback(async () => {
    try {
      const response = await tasksApi.getDashboardStats()
      if (response.data?.data) setStats(response.data.data)
    } catch {
      // The home screen remains useful when analytics are temporarily unavailable.
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  const refresh = () => { setRefreshing(true); load() }

  if (loading) return <LoadingScreen message="Getting your day ready..." />

  const activeCount = userType === 'runner' ? stats?.myActiveTasks ?? 0 : stats?.activeTasks ?? 0
  const completedCount = userType === 'runner' ? stats?.runnerCompletedTasks ?? 0 : stats?.completedPostedTasks ?? 0
  const moneyLabel = userType === 'runner' ? 'Total earned' : 'Total spent'
  const moneyValue = userType === 'runner'
    ? 'R' + (stats?.totalEarnings ?? 0).toFixed(0)
    : 'R' + (stats?.totalSpent ?? 0).toFixed(0)

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.hero}>
        <View style={s.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>DOFORYOU  •  YOUR COMMUNITY, IN MOTION</Text>
            <Text style={s.greeting}>Hey, {displayName} 👋</Text>
          </View>
          <View style={s.brandMark}><Text style={s.brandMarkText}>D</Text></View>
        </View>
        <Text style={s.heroCopy}>
          {userType === 'runner'
            ? 'Find meaningful tasks, help someone out, and get paid.'
            : userType === 'both'
              ? 'Your next task is only a few taps away.'
              : 'Get the help you need, or turn your time into earnings.'}
        </Text>
        <View style={s.heroPills}>
          <View style={s.heroPill}><Text style={s.heroPillText}>✓ Trusted task community</Text></View>
          <View style={s.heroPill}><Text style={s.heroPillText}>⚡ Simple and secure</Text></View>
        </View>
      </View>

      <View style={s.body}>
        {isProfileIncomplete() && (
          <TouchableOpacity style={s.profilePrompt} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
            <View style={s.profilePromptIcon}><Text style={{ fontSize: 20 }}>✨</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.profilePromptTitle}>Finish setting up your profile</Text>
              <Text style={s.profilePromptCopy}>A complete profile helps unlock more features.</Text>
            </View>
            <Text style={s.profilePromptArrow}>›</Text>
          </TouchableOpacity>
        )}

        <View style={s.sectionHeading}>
          <View><Text style={s.sectionTitle}>Your snapshot</Text><Text style={s.sectionSubtitle}>A quick look at how things are going</Text></View>
          <View style={s.liveDot} />
        </View>
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: COLORS.primaryLight }]}><Text style={s.statEmoji}>⚡</Text></View>
            <Text style={s.statValue}>{activeCount}</Text><Text style={s.statLabel}>Active tasks</Text>
          </View>
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: COLORS.successLight }]}><Text style={s.statEmoji}>✓</Text></View>
            <Text style={s.statValue}>{completedCount}</Text><Text style={s.statLabel}>Completed</Text>
          </View>
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: COLORS.infoLight }]}><Text style={s.statEmoji}>◎</Text></View>
            <Text style={s.statValue}>{moneyValue}</Text><Text style={s.statLabel}>{moneyLabel}</Text>
          </View>
        </View>

        <View style={[s.featureCard, SHADOW.md]}>
          <View style={{ flex: 1 }}>
            <Text style={s.featureEyebrow}>YOUR NEXT MOVE</Text>
            <Text style={s.featureTitle}>{canPostErrands() ? 'Need a hand with something?' : 'Ready to make a difference?'}</Text>
            <Text style={s.featureCopy}>{canPostErrands() ? 'Post what you need and let a local runner help.' : 'Explore tasks that fit your skills and schedule.'}</Text>
            <TouchableOpacity
              style={s.featureButton}
              onPress={() => navigation.navigate(canPostErrands() ? 'PostErrand' : 'BrowseErrands')}
              activeOpacity={0.85}
            >
              <Text style={s.featureButtonText}>{canPostErrands() ? 'Post a task  →' : 'Explore tasks  →'}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.featureIllustration}><Text style={s.featureIllustrationText}>{canPostErrands() ? '🧡' : '🤝'}</Text><View style={s.featureSpark} /></View>
        </View>

        <View style={s.sectionHeading}>
          <View><Text style={s.sectionTitle}>Made for you</Text><Text style={s.sectionSubtitle}>Everything important, close at hand</Text></View>
        </View>
        <View style={s.actionsGrid}>
          {canPostErrands() && <ActionTile icon="📝" title="Post a task" subtitle="Get help with a task" accent onPress={() => navigation.navigate('PostErrand')} />}
          {canAcceptTasks() && <ActionTile icon="🔎" title="Find tasks" subtitle="Discover local work" accent onPress={() => navigation.navigate('BrowseErrands')} />}
          {(userType === 'creator' || userType === 'both') && <ActionTile icon="📋" title="My posted tasks" subtitle="Track your requests" onPress={() => navigation.navigate('MyPostedTasks')} />}
          {(userType === 'runner' || userType === 'both') && <ActionTile icon="🏃" title="My active tasks" subtitle="Manage your work" onPress={() => navigation.navigate('MyActiveTasks')} />}
          <ActionTile icon="🔔" title="Notifications" subtitle="See what’s new" onPress={() => navigation.navigate('Notifications')} />
          <ActionTile icon="👤" title="My profile" subtitle="Your details and setup" onPress={() => navigation.navigate('Profile')} />
        </View>
        <Text style={s.footer}>Small tasks. Real help. Stronger communities.</Text>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 36 },
  hero: { backgroundColor: '#FFF0DC', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: 28, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: COLORS.primaryDark, marginBottom: 10 },
  greeting: { fontSize: 29, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.8 },
  brandMark: { width: 48, height: 48, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
  brandMarkText: { fontSize: 26, fontWeight: '900', color: COLORS.white },
  heroCopy: { fontSize: 15, lineHeight: 23, color: COLORS.textSecondary, marginTop: 15, maxWidth: 330 },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 11, paddingVertical: 8, borderRadius: RADIUS.full },
  heroPillText: { fontSize: 11, color: COLORS.textPrimary, fontWeight: '600' },
  body: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, gap: 20 },
  profilePrompt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: COLORS.infoLight, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#D5E9FF' },
  profilePromptIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  profilePromptTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  profilePromptCopy: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, lineHeight: 17 },
  profilePromptArrow: { fontSize: 27, color: COLORS.info, paddingHorizontal: 3 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.4 },
  sectionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.success },
  statsRow: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 12, borderWidth: 1, borderColor: '#F0EDE8', ...SHADOW.sm },
  statIconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statEmoji: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.4 },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4 },
  featureCard: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 20, borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#F0EDE8', overflow: 'hidden' },
  featureEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: COLORS.primary, marginBottom: 7 },
  featureTitle: { fontSize: 20, lineHeight: 25, fontWeight: '800', color: COLORS.textPrimary, maxWidth: 230 },
  featureCopy: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary, marginTop: 7, maxWidth: 240 },
  featureButton: { alignSelf: 'flex-start', marginTop: 14, backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 11, ...SHADOW.primary },
  featureButtonText: { fontSize: 13, fontWeight: '800', color: COLORS.white },
  featureIllustration: { width: 70, height: 88, borderRadius: 26, backgroundColor: COLORS.primaryTint, alignItems: 'center', justifyContent: 'center' },
  featureIllustrationText: { fontSize: 34 },
  featureSpark: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFD166', top: 10, right: 10 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionTile: { width: '47.5%', minHeight: 150, padding: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#F0EDE8', borderRadius: RADIUS.lg, ...SHADOW.sm },
  actionTileAccent: { borderColor: '#FFD7A6', backgroundColor: '#FFFCF8' },
  actionIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.backgroundDark, marginBottom: 12 },
  actionIconAccent: { backgroundColor: COLORS.primaryLight },
  actionEmoji: { fontSize: 20 },
  actionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  actionSubtitle: { fontSize: 11, lineHeight: 16, color: COLORS.textSecondary, marginTop: 4 },
  actionArrow: { position: 'absolute', right: 13, top: 14, fontSize: 17, fontWeight: '700', color: COLORS.textMuted },
  footer: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, paddingVertical: 4 },
})
