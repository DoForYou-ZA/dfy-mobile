// Native DoForYou visual system: bright, warm, and readable while retaining the brand orange.
export const COLORS = {
  primary: '#FF8A00',
  primaryDark: '#E87500',
  primaryLight: '#FFF0DC',
  primaryTint: '#FFF8EF',
  success: '#16A66A',
  successDark: '#128455',
  successLight: '#E7F8EF',
  danger: '#E5484D',
  dangerDark: '#C9363B',
  dangerLight: '#FFF0F0',
  warning: '#EAA000',
  warningDark: '#B97800',
  warningLight: '#FFF6D9',
  info: '#3182CE',
  infoDark: '#245EA8',
  infoLight: '#EAF4FF',
  secondary: '#64748B',
  secondaryDark: '#475569',
  background: '#FFF9F2',
  backgroundDark: '#F4F6F8',
  surface: '#FFFFFF',
  border: '#E8EAF0',
  borderLight: '#F2F3F6',
  textPrimary: '#202A38',
  textSecondary: '#657184',
  textMuted: '#98A2B3',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(22, 32, 48, 0.48)',
  starColor: '#F5A623',
}

export const RADIUS = { sm: 8, md: 12, lg: 18, xl: 24, full: 999 }
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
export const SHADOW = {
  sm: { shadowColor: '#263247', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  md: { shadowColor: '#263247', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  lg: { shadowColor: '#263247', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.09, shadowRadius: 22, elevation: 5 },
  xl: { shadowColor: '#263247', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.12, shadowRadius: 30, elevation: 8 },
  primary: { shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 4 },
}

// Shared primitives retained while existing task flows are modernised.
export const GLOBAL = {
  card: { backgroundColor: '#FFFFFF', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: '#F0EDE8', padding: SPACING.md, shadowColor: '#263247', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: '#F0EDE8', padding: SPACING.md, marginBottom: SPACING.md, shadowColor: '#263247', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  input: { width: '100%' as const, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1.5, borderColor: '#E4E7EC', borderRadius: RADIUS.md, fontSize: 15, color: '#202A38', backgroundColor: '#FFFFFF' },
  label: { fontSize: 14, fontWeight: '600' as const, color: '#202A38', marginBottom: 7 },
  taskCard: { backgroundColor: '#FFFFFF', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: '#F0EDE8', overflow: 'hidden' as const, shadowColor: '#263247', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
}
