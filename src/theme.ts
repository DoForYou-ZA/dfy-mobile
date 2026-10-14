// Single source of truth for DoForYou design tokens.
export const colors = {
  background: '#FFF9F2', // matches app.json splash + adaptive icon background
  surface: '#FFFFFF',
  text: '#292A2D',
  textSecondary: '#5F6368',
  placeholder: '#777B82',
  orange: '#F28C28', // brand accent: logo dot, active step, full stops
  button: '#F28C28', // buttons + links (passes contrast with white text)
  inputBorder: '#D5D9E0',
  cardBorder: '#E5E7EB',
  iconCircle: '#FFF0E0',
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
