import React from 'react'
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle
} from 'react-native'
import { COLORS, RADIUS, SHADOW } from '../config/theme'

type Variant = 'primary' | 'secondary' | 'outline' | 'outline-secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  title: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, textStyle, fullWidth,
}: Props) {
  const isDisabled = disabled || loading
  const isLight = variant === 'outline' || variant === 'outline-secondary' || variant === 'ghost' || variant === 'secondary'

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={[
        styles.btn,
        styles[`v_${variant}`],
        styles[`s_${size}`],
        fullWidth && styles.block,
        variant === 'primary' && !isDisabled && SHADOW.primary,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator size="small" color={isLight ? COLORS.primary : COLORS.white} />
        : <Text style={[styles.txt, styles[`t_${variant}`], styles[`ts_${size}`], textStyle]}>{title}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  block: { width: '100%', justifyContent: 'center' },
  disabled: { opacity: 0.48 },
  v_primary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  v_secondary: { backgroundColor: COLORS.backgroundDark, borderColor: COLORS.border },
  v_outline: { backgroundColor: COLORS.surface, borderColor: COLORS.primary },
  'v_outline-secondary': { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  v_danger: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  v_ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  s_sm: { minHeight: 36, paddingHorizontal: 14, paddingVertical: 8 },
  s_md: { minHeight: 46, paddingHorizontal: 20, paddingVertical: 12 },
  s_lg: { minHeight: 54, paddingHorizontal: 24, paddingVertical: 15 },
  txt: { fontWeight: '700', textAlign: 'center', letterSpacing: 0.1 },
  t_primary: { color: COLORS.white },
  t_secondary: { color: COLORS.textPrimary },
  t_outline: { color: COLORS.primaryDark },
  't_outline-secondary': { color: COLORS.textPrimary },
  t_danger: { color: COLORS.white },
  t_ghost: { color: COLORS.primaryDark },
  ts_sm: { fontSize: 12 },
  ts_md: { fontSize: 14 },
  ts_lg: { fontSize: 15 },
})
