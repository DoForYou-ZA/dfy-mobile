import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SPACING, SHADOW } from '../config/theme'

export function LoadingScreen({ message = 'Getting things ready…' }: { message?: string }) {
  return (
    <View style={s.loadingState}>
      <View style={s.loadingMark}><Text style={s.markText}>d</Text><View style={s.markDot} /></View>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={s.loadingText}>{message}</Text>
    </View>
  )
}

export function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <View style={s.emptyState}>
      <View style={s.emptyMark}><Text style={s.emptyIcon}>{icon}</Text></View>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={s.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  )
}

export function AlertBanner({ type = 'info', message }: { type?: 'error' | 'success' | 'warning' | 'info'; message: string }) {
  const map = {
    error: { bg: '#FCECEA', color: '#9A302B', border: '#F2D1CC', accent: COLORS.danger },
    success: { bg: '#E8F4EC', color: '#225E44', border: '#CDE5D5', accent: COLORS.success },
    warning: { bg: '#FFF3DA', color: '#7A5018', border: '#F1DFB8', accent: COLORS.warning },
    info: { bg: '#EAF0F9', color: '#2B4F7C', border: '#D3DEEF', accent: COLORS.info },
  }
  const c = map[type]
  return (
    <View style={[s.alert, { backgroundColor: c.bg, borderColor: c.border, borderLeftColor: c.accent }]}>
      <Text style={[s.alertText, { color: c.color }]}>{message}</Text>
    </View>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={s.pageHeader}>
      <Text style={s.pageEyebrow}>DOFORYOU</Text>
      <Text style={s.pageHeaderTitle}>{title}</Text>
      {subtitle ? <Text style={s.pageHeaderSub}>{subtitle}</Text> : null}
    </View>
  )
}

export function SectionCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[s.sectionCard, style]}>{children}</View>
}

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
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 14, padding: SPACING.xl, backgroundColor: COLORS.background,
  },
  loadingMark: {
    width: 52, height: 52, borderRadius: 18, backgroundColor: COLORS.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  markText: { color: COLORS.white, fontSize: 30, fontWeight: '800', marginTop: -4 },
  markDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, right: 9, bottom: 10 },
  loadingText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: SPACING.xl * 1.5 },
  emptyMark: {
    width: 68, height: 68, borderRadius: 24, backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  emptyIcon: { fontSize: 28, color: COLORS.ink },
  emptyTitle: { fontSize: 19, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', letterSpacing: -0.25 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  alert: { borderWidth: 1, borderLeftWidth: 4, borderRadius: RADIUS.sm, padding: 14, marginBottom: 16 },
  alertText: { fontSize: 14, lineHeight: 21, flex: 1 },
  pageHeader: { backgroundColor: COLORS.ink, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xl, marginBottom: SPACING.md },
  pageEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.2, color: COLORS.accent, marginBottom: 10 },
  pageHeaderTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7, color: COLORS.white, marginBottom: 5 },
  pageHeaderSub: { fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 21 },
  sectionCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
})
