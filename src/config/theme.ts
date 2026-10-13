// DoForYou Mobile visual system: warm, bright, clean, and recognisably DFY.
export const COLORS = {
  // Keep DoForYou's signature orange, balanced with warm neutrals.
  primary: '#FF8A00',
  primaryDark: '#E77700',
  primaryLight: '#FFF0D9',
  success: '#17865B',
  successDark: '#146C49',
  danger: '#D94841',
  dangerDark: '#B8322B',
  warning: '#F4AE3D',
  warningDark: '#C78319',
  info: '#4779E8',
  infoDark: '#2E5FCA',
  secondary: '#756B62',
  secondaryDark: '#564C44',
  background: '#FFF9F2',
  backgroundDark: '#FFF0E3',
  surface: '#FFFFFF',
  border: '#F1E2D2',
  borderLight: '#FFF2E7',
  textPrimary: '#29231F',
  textSecondary: '#6D6259',
  textMuted: '#A09489',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(40,24,10,0.44)',
  starColor: '#F4AE3D',
}

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

export const SHADOW = {
  sm: { shadowColor: '#57371B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  md: { shadowColor: '#57371B', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  lg: { shadowColor: '#57371B', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 5 },
  xl: { shadowColor: '#57371B', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.08, shadowRadius: 26, elevation: 8 },
  primary: { shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 4 },
}

// Shared cards and fields for task screens and forms.
export const GLOBAL = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    shadowColor: '#57371B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#57371B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },
  input: {
    width: '100%' as const,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    marginBottom: 7,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden' as const,
    shadowColor: '#57371B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },
}
