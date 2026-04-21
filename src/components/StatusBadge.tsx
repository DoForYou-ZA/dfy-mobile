import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, RADIUS } from '../config/theme'

// Matches global.css .badge-* classes exactly
// All statuses use rgba(255,138,0,0.12) bg + primary text per the web CSS
const STATUS: Record<string, { bg: string; color: string }> = {
  posted:         { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  claimed:        { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  in_progress:    { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  completed:      { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  confirmed:      { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  runner_paid:    { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  runnerpaid:     { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  cancelled:      { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  disputed:       { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  pending:        { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  pendingpayment: { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  verified:       { bg: 'rgba(255,138,0,0.12)', color: COLORS.primary },
  draft:          { bg: COLORS.backgroundDark, color: COLORS.textSecondary },
}

export default function StatusBadge({ status }: { status: string }) {
  const key = (status || '').toLowerCase().replace(/[ -]/g, '_')
  const c = STATUS[key] || { bg: COLORS.backgroundDark, color: COLORS.textSecondary }
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.color }]}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
})
