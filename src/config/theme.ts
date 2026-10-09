/**
 * DoForYou native design tokens.
 * The mobile UI has its own visual language; business rules remain in the API.
 */
export const COLORS = {
  primary: '#F45A35',
  primaryDark: '#D94725',
  primaryLight: '#FFE7DF',
  accent: '#F7B84B',
  success: '#237B5A',
  successDark: '#176344',
  danger: '#C84545',
  dangerDark: '#A92E35',
  warning: '#B87518',
  warningDark: '#92560C',
  info: '#426DAA',
  infoDark: '#2D548A',
  secondary: '#66727D',
  secondaryDark: '#47525B',
  background: '#F7F6F2',
  backgroundDark: '#EEEDE7',
  surface: '#FFFFFF',
  border: '#E4E3DC',
  borderLight: '#EFEEE8',
  textPrimary: '#1A252E',
  textSecondary: '#66717A',
  textMuted: '#8D969D',
  white: '#FFFFFF',
  black: '#000000',
  ink: '#17232D',
  inkSoft: '#243540',
  teal: '#2A776C',
  overlay: 'rgba(20,32,40,0.55)',
  starColor: '#D99624',
}

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  full: 999,
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
}

export const SHADOW = {
  sm: {
    shadowColor: '#17232D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: '#17232D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  lg: {
    shadowColor: '#17232D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
    elevation: 5,
  },
  xl: {
    shadowColor: '#17232D',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 7,
  },
  primary: {
    shadowColor: '#F45A35',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
}

export const GLOBAL = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#EFEEE8',
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E4E3DC',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  input: {
    width: '100%' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E4E3DC',
    borderRadius: RADIUS.sm,
    fontSize: 16,
    color: '#1A252E',
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#46525B',
    marginBottom: 8,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E4E3DC',
    overflow: 'hidden' as const,
    ...SHADOW.sm,
  },
}
