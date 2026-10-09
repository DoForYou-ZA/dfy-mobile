import React, { useCallback, useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { tasksApi } from '../api'
import { LoadingScreen } from '../components/Common'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'
import type { DashboardStats } from '../types'

type ActionCardProps = {
  icon: string
  title: string
  subtitle: string
  onPress: () => void
  tone?: 'orange' | 'green' | 'blue' | 'plain'
}

function ActionCard({ icon, title, subtitle, onPress, tone = 'plain' }: ActionCardProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.actionCard, tone === 'orange' && styles.actionOrange, tone === 'green' && styles.actionGreen, tone === 'blue' && styles.actionBlue]}
    >
      <View style={[styles.actionIconWrap, tone === 'orange' && styles.iconOrange, tone === 'green' && styles.iconGreen, tone === 'blue' && styles.iconBlue]}>
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
      <Text style={styles.actionArrow}>↗</Text>
    </TouchableOpacity>
  )
}

export default function DashboardScreen({ navigation }: any) {
  const { user, isProfileIncomplete, canPostErrands, canAcceptTasks } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const userType = user?.userType || ''
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there'
  const canPost = canPostErrands()
  const canRun = canAcceptTasks()

  const load = useCallback(async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        tasksApi.getDashboardStats().catch(() => ({ data: null })),
        tasksApi.getRecentActivity(4).catch(() => ({ data: null })),
      ])
      setStats(statsResponse.data?.data || null)
      const rows = activityResponse.data?.data
      setActivity(Array.isArray(rows) ? rows : [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingScreen message="Getting your DFY dashboard ready…" />

  const headline = userType === 'creator'
    ? 'Make it happen.'
    : userType === 'runner'
      ? 'Find your next task.'
      : userType === 'both'
        ? 'What are we doing today?'
        : 'Let’s get you started.'

  const metrics = userType === 'creator'
    ? [
        { label: 'Posted tasks', value: stats?.postedTasks ?? 0, tone: 'orange' },
        { label: 'In progress', value: stats?.activeTasks ?? 0, tone: 'blue' },
        { label: 'Needs confirmation', value: stats?.awaitingConfirmation ?? 0, tone: 'green' },
        { label: 'Total spent', value: `R${(stats?.totalSpent ?? 0).toFixed(0)}`, tone: 'plain' },
      ]
    : userType === 'runner'
      ? [
          { label: 'Available tasks', value: stats?.availableTasks ?? 0, tone: 'orange' },
          { label: 'My active tasks', value: stats?.myActiveTasks ?? 0, tone: 'blue' },
          { label: 'Completed', value: stats?.runnerCompletedTasks ?? 0, tone: 'green' },
          { label: 'Total earned', value: `R${(stats?.totalEarnings ?? 0).toFixed(0)}`, tone: 'plain' },
        ]
      : [
          { label: 'Posted tasks', value: stats?.postedTasks ?? 0, tone: 'orange' },
          { label: 'Available tasks', value: stats?.availableTasks ?? 0, tone: 'blue' },
          { label: 'In progress', value: stats?.activeTasks ?? 0, tone: 'green' },
          { label: 'Total earned', value: `R${(stats?.totalEarnings ?? 0).toFixed(0)}`, tone: 'plain' },
        ]

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={COLORS.primary} />}
    >
      <View style={styles.hero}>
        <View style={styles.heroTopline}>
          <View style={styles.eyebrowPill}><View style={styles.liveDot} /><Text style={styles.eyebrow}>YOUR DFY SPACE</Text></View>
          <Text style={styles.sparkle}>✳</Text>
        </View>
        <Text style={styles.greeting}>Hey, {firstName} 👋</Text>
        <Text style={styles.heroTitle}>{headline}</Text>
        <Text style={styles.heroSubtitle}>
          {userType === 'creator'
            ? 'Post a task, find the right runner, and keep everything moving.'
            : userType === 'runner'
              ? 'Pick up a task that fits your day and earn on your terms.'
              : 'Create a task or jump in and help someone get it done.'}
        </Text>
        <View style={styles.heroActions}>
          {canPost && !isProfileIncomplete() && (
            <TouchableOpacity accessibilityRole="button" style={styles.heroButton} onPress={() => navigation.navigate('PostErrand')}>
              <Text style={styles.heroButtonText}>＋  Post a task</Text>
            </TouchableOpacity>
          )}
          {canRun && (
            <TouchableOpacity accessibilityRole="button" style={styles.heroButtonSecondary} onPress={() => navigation.navigate('BrowseErrands')}>
              <Text style={styles.heroButtonSecondaryText}>Explore tasks  →</Text>
            </TouchableOpacity>
          )}
          {!canPost && !canRun && (
            <TouchableOpacity accessibilityRole="button" style={styles.heroButton} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.heroButtonText}>Complete profile  →</Text>
            </TouchableOpacity>
          )}
        </View>
        <View pointerEvents="none" style={styles.heroOrb} />
        <View pointerEvents="none" style={styles.heroOrbSmall} />
      </View>

      {isProfileIncomplete() && (
        <TouchableOpacity style={styles.profilePrompt} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
          <View style={styles.promptIcon}><Text style={styles.promptIconText}>✓</Text></View>
          <View style={styles.promptCopy}>
            <Text style={styles.promptTitle}>Finish setting up your profile</Text>
            <Text style={styles.promptSubtitle}>Add your details to unlock all task features.</Text>
          </View>
          <Text style={styles.promptArrow}>›</Text>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Your overview</Text>
          <Text style={styles.sectionSubtitle}>A quick look at how things are going</Text>
        </View>
        <View style={styles.todayPill}><Text style={styles.todayText}>LIVE</Text></View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <View key={metric.label} style={styles.metricCard}>
            <View style={[styles.metricAccent, metric.tone === 'orange' ? styles.accentOrange : metric.tone === 'green' ? styles.accentGreen : metric.tone === 'blue' ? styles.accentBlue : styles.accentPlain]} />
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Jump back in</Text>
          <Text style={styles.sectionSubtitle}>The shortcuts you’ll use most</Text>
        </View>
      </View>
      <View style={styles.actionsGrid}>
        {canPost && (
          <ActionCard icon="＋" title="Post a task" subtitle="Get a hand with something" tone="orange" onPress={() => navigation.navigate('PostErrand')} />
        )}
        {canRun && (
          <ActionCard icon="⌕" title="Browse tasks" subtitle="Find tasks near you" tone="green" onPress={() => navigation.navigate('BrowseErrands')} />
        )}
        {(userType === 'creator' || userType === 'both') && (
          <ActionCard icon="▤" title="My posted tasks" subtitle="Track your requests" tone="blue" onPress={() => navigation.navigate('MyPostedTasks')} />
        )}
        {(userType === 'runner' || userType === 'both') && (
          <ActionCard icon="◷" title="My active tasks" subtitle="Keep work moving" onPress={() => navigation.navigate('MyActiveTasks')} />
        )}
      </View>

      {activity.length > 0 && (
        <View style={styles.activityCard}>
          <View style={styles.activityHeading}>
            <View>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              <Text style={styles.sectionSubtitle}>The latest from your tasks</Text>
            </View>
          </View>
          {activity.map((item, index) => (
            <View key={item.id ?? `${item.timestamp ?? item.updatedAt ?? 'activity'}-${index}`} style={[styles.activityRow, index === activity.length - 1 && styles.activityRowLast]}>
              <View style={styles.activityBullet}><Text style={styles.activityBulletText}>{item.type === 'created' ? '+' : '↗'}</Text></View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityTitle} numberOfLines={2}>{item.description || item.message || 'Task updated'}</Text>
                <Text style={styles.activityMeta}>
                  {item.updatedAt || item.timestamp
                    ? new Date(item.updatedAt || item.timestamp).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                    : 'Recently'}
                  {item.status ? `  ·  ${item.status}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.footerNote}>Small tasks. Real help. More time for you.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: 30, gap: 20 },
  hero: {
    overflow: 'hidden', position: 'relative', backgroundColor: COLORS.primary,
    borderRadius: 28, padding: 22, paddingTop: 20, ...SHADOW.primary,
  },
  heroTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  eyebrowPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.19)', borderRadius: RADIUS.full, paddingVertical: 7, paddingHorizontal: 11 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D8FFE8' },
  eyebrow: { color: '#FFFFFF', fontSize: 10, letterSpacing: 1.5, fontWeight: '800' },
  sparkle: { color: '#FFE0B5', fontSize: 26 },
  greeting: { color: '#FFF5EC', fontSize: 15, fontWeight: '600', marginBottom: 5 },
  heroTitle: { color: '#FFFFFF', fontSize: 29, lineHeight: 35, fontWeight: '800', maxWidth: '92%', marginBottom: 9 },
  heroSubtitle: { color: '#FFF3E9', fontSize: 14, lineHeight: 21, maxWidth: '94%' },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20, zIndex: 2 },
  heroButton: { backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 15, borderRadius: RADIUS.full },
  heroButtonText: { color: COLORS.primaryDark, fontWeight: '800', fontSize: 13 },
  heroButtonSecondary: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 12, paddingHorizontal: 15, borderRadius: RADIUS.full },
  heroButtonSecondaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  heroOrb: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -82, top: -68, backgroundColor: 'rgba(255,255,255,0.10)' },
  heroOrbSmall: { position: 'absolute', width: 90, height: 90, borderRadius: 45, right: 30, bottom: -62, backgroundColor: 'rgba(255,255,255,0.09)' },
  profilePrompt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, backgroundColor: '#FFF0E5', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#FFD7BB' },
  promptIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  promptIconText: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  promptCopy: { flex: 1, gap: 3 },
  promptTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  promptSubtitle: { fontSize: 12, lineHeight: 17, color: COLORS.textSecondary },
  promptArrow: { fontSize: 25, color: COLORS.primary, fontWeight: '600' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 2 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  todayPill: { backgroundColor: COLORS.successLight, borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 6 },
  todayText: { color: COLORS.success, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: '48%', minHeight: 102, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14, borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOW.sm },
  metricAccent: { width: 28, height: 5, borderRadius: RADIUS.full, marginBottom: 11 },
  accentOrange: { backgroundColor: COLORS.primary },
  accentGreen: { backgroundColor: '#42B883' },
  accentBlue: { backgroundColor: '#5A9AE8' },
  accentPlain: { backgroundColor: '#E5B85C' },
  metricValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  metricLabel: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '48%', minHeight: 148, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: RADIUS.lg, padding: 14, ...SHADOW.sm },
  actionOrange: { backgroundColor: '#FFF3E9', borderColor: '#FFE0C8' },
  actionGreen: { backgroundColor: '#EFFAF5', borderColor: '#D8F1E5' },
  actionBlue: { backgroundColor: '#F0F6FF', borderColor: '#DCEBFF' },
  actionIconWrap: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#F6F1EC', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  iconOrange: { backgroundColor: '#FFFFFF' },
  iconGreen: { backgroundColor: '#FFFFFF' },
  iconBlue: { backgroundColor: '#FFFFFF' },
  actionIcon: { fontSize: 22, color: COLORS.primary, fontWeight: '700' },
  actionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  actionSubtitle: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16, paddingRight: 5 },
  actionArrow: { position: 'absolute', right: 14, top: 15, color: COLORS.textMuted, fontSize: 17 },
  activityCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: RADIUS.xl, padding: 16, ...SHADOW.sm },
  activityHeading: { marginBottom: 6 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  activityRowLast: { borderBottomWidth: 0 },
  activityBullet: { width: 30, height: 30, borderRadius: 11, backgroundColor: COLORS.primaryTint, alignItems: 'center', justifyContent: 'center' },
  activityBulletText: { color: COLORS.primary, fontSize: 15, fontWeight: '800' },
  activityCopy: { flex: 1, gap: 4 },
  activityTitle: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  activityMeta: { color: COLORS.textMuted, fontSize: 11 },
  footerNote: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', paddingTop: 1 },
})
