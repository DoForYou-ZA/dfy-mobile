// Native-first DoForYou palette: warm, bright, and calm.
// Keep the signature DFY orange while reserving stronger color for key actions.
export const COLORS = {
  primary: '#FF861A', primaryDark: '#E76B0A', primaryLight: '#FFE7D0',
  accent: '#20A89A', accentLight: '#DDF7F1',
  success: '#1FAF78', successDark: '#13895C',
  danger: '#E85D68', dangerDark: '#C94350',
  warning: '#F2B84B', warningDark: '#BE861A',
  info: '#4A91E8', infoDark: '#2F70C7',
  secondary: '#5F7284', secondaryDark: '#405466',
  background: '#FFF9F3', backgroundDark: '#FFF0E3',
  surface: '#FFFFFF', border: '#F0E1D4', borderLight: '#F8EDE4',
  textPrimary: '#24313D', textSecondary: '#667582', textMuted: '#94A0AA',
  white: '#FFFFFF', black: '#000000', overlay: 'rgba(31,42,52,0.42)',
  starColor: '#F3B53F',
}

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 22, full: 999 }
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }

export const SHADOW = {
  sm: { shadowColor: '#8B6A4F', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 5, elevation: 1 },
  md: { shadowColor: '#8B6A4F', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  lg: { shadowColor: '#8B6A4F', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 5 },
  xl: { shadowColor: '#8B6A4F', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.1, shadowRadius: 26, elevation: 8 },
  primary: { shadowColor: '#FF861A', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 4 },
}

// Shared visual primitives for existing forms and task cards.
export const GLOBAL = {
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.md,
    shadowColor: '#8B6A4F', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md,
    marginBottom: SPACING.md, shadowColor: '#8B6A4F',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04,
    shadowRadius: 8, elevation: 1,
  },
  input: {
    width: '100%' as const, paddingHorizontal: 16, paddingVertical: 13,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    fontSize: 15, color: COLORS.textPrimary, backgroundColor: '#FFFCF9',
  },
  label: { fontSize: 14, fontWeight: '600' as const, color: COLORS.textPrimary, marginBottom: 7 },
  taskCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' as const,
    shadowColor: '#8B6A4F', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
}
