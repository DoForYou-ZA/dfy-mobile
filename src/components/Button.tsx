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
  const spinnerColor = variant === 'outline' || variant === 'outline-secondary' || variant === 'ghost'
    ? COLORS.primary : '#FFFFFF'
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={[
        styles.btn,
        styles[`v_${variant}`],
        styles[`s_${size}`],
        fullWidth && styles.block,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.78}
    >
      {loading
        ? <ActivityIndicator size="small" color={spinnerColor} />
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
    gap: 7,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  block: { width: '100%' },
  disabled: { opacity: 0.48 },
  v_primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOW.primary,
  },
  v_secondary: {
    backgroundColor: COLORS.backgroundDark,
    borderColor: COLORS.border,
  },
  v_outline: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  'v_outline-secondary': {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  v_danger: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  v_ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  s_sm: { paddingHorizontal: 13, paddingVertical: 9, minHeight: 36 },
  s_md: { paddingHorizontal: 18, paddingVertical: 13, minHeight: 46 },
  s_lg: { paddingHorizontal: 22, paddingVertical: 16, minHeight: 54 },
  txt: { fontWeight: '700', textAlign: 'center' },
  t_primary: { color: '#FFFFFF' },
  t_secondary: { color: COLORS.textPrimary },
  t_outline: { color: COLORS.primaryDark },
  't_outline-secondary': { color: COLORS.textSecondary },
  t_danger: { color: '#FFFFFF' },
  t_ghost: { color: COLORS.primaryDark },
  ts_sm: { fontSize: 12 },
  ts_md: { fontSize: 14 },
  ts_lg: { fontSize: 15 },
})
