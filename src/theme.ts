// Single source of truth for DoForYou design tokens.
export const colors = {
  background: '#FFF9F2', // matches app.json splash + adaptive icon background
  surface: '#FFFFFF',
  text: '#29231F',
  textSecondary: '#6D6259',
  placeholder: '#8A7F70',
  orange: '#FF8A00', // brand accent: logo dot, active step, full stops
  button: '#B35A00', // buttons + links (passes contrast with white text)
  inputBorder: '#CDBD9F',
  cardBorder: '#F1E2D2',
  iconCircle: '#FBE6CC',
  error: '#AD2922',
  errorBg: '#FFF0EE',
  scrim: 'rgba(41, 35, 31, 0.58)',
} as const;

// Special Elite = brand only (logo, "DoForYou"). Inter = everything else.
// Never combine these with fontWeight: use the family name instead.
export const fonts = {
  brand: 'SpecialElite_400Regular',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
} as const;

export const radii = {
  input: 12,
  button: 14,
  card: 20,
  dialog: 22,
} as const;
