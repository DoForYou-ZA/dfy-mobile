import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SPACING } from '../config/theme'

// .loading-state from global.css
export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={s.loadingState}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={s.loadingText}>{message}</Text>
    </View>
  )
}

// .empty-state from global.css
export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={s.emptyState}>
      <Text style={s.emptyIcon}>{icon}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={s.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  )
}

// .alert .alert-error/success/warning/info from global.css
export function AlertBanner({ type = 'info', message }: { type?: 'error' | 'success' | 'warning' | 'info'; message: string }) {
  const map = {
    error:   { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
    success: { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
    warning: { bg: '#FEF9C3', color: '#854D0E', border: '#FDE68A' },
    info:    { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  }
  const c = map[type]
  return (
    <View style={[s.alert, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[s.alertText, { color: c.color }]}>{message}</Text>
    </View>
  )
}

// .page-header from global.css — orange gradient header used on every page
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageHeaderTitle}>{title}</Text>
      {subtitle ? <Text style={s.pageHeaderSub}>{subtitle}</Text> : null}
    </View>
  )
}

// .section-card from global.css
export function SectionCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[s.sectionCard, style]}>{children}</View>
}

// .section-header from global.css
export function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {right}
    </View>
  )
}

const s = StyleSheet.create({
  loadingState: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  loadingText: { color: COLORS.textSecondary, fontSize: 14 },

  emptyState: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: SPACING.xl * 2,
  },
  emptyIcon: { fontSize: 48, opacity: 0.35, marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  alert: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  alertText: { fontSize: 14, lineHeight: 20, flex: 1 },

  // .page-header — orange gradient
  pageHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  pageHeaderTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  pageHeaderSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)' },

  // .section-card
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // .section-header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
})
