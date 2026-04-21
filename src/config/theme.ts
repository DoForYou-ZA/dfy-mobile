// Exact 1:1 match of DoForYou web CSS variables
export const COLORS = {
  primary: '#FF8A00',
  primaryDark: '#E67A00',
  primaryLight: '#FFE3C2',
  success: '#22C55E',
  successDark: '#16A34A',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  warning: '#F59E0B',
  warningDark: '#D97706',
  info: '#3B82F6',
  infoDark: '#2563EB',
  secondary: '#6B7280',
  secondaryDark: '#4B5563',
  background: '#F9FAFB',
  backgroundDark: '#F3F4F6',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  starColor: '#F59E0B',
}

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
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
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 6 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 25, elevation: 10 },
  primary: { shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
}

// Shared reusable style objects — mirrors global.css patterns
export const GLOBAL = {
  // .card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  // .section-card
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // .form-input
  input: {
    width: '100%' as const,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: RADIUS.md,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  // .form-label
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1F2937',
    marginBottom: 6,
  },
  // .task-card
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
}
