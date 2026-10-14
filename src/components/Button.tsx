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
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={[
        styles.btn,
        styles[`v_${variant}`],
        styles[`s_${size}`],
        fullWidth && styles.block,
        isDisabled && (variant === 'primary' ? styles.disabledPrimary : styles.disabled),
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'outline' || variant === 'outline-secondary' || variant === 'ghost' ? COLORS.primary : '#fff'} />
        : <Text style={[styles.txt, styles[`t_${variant}`], styles[`ts_${size}`], isDisabled && variant === 'primary' && styles.disabledPrimaryText, textStyle]}>{title}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: RADIUS.lg,
    borderWidth: 0,
  },
  block: { width: '100%', justifyContent: 'center' },
  disabled: { opacity: 0.82 },
  disabledPrimary: { opacity: 1, backgroundColor: '#FFE2BE', borderWidth: 1, borderColor: '#D98A3D', shadowOpacity: 0, elevation: 0 },
  disabledPrimaryText: { color: '#59320F' },

  // Variants — match .btn-primary, .btn-secondary etc from global.css
  v_primary: {
    backgroundColor: COLORS.primary,
    ...SHADOW.primary,
  },
  v_secondary: {
    backgroundColor: '#FFF4E8',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  v_outline: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  'v_outline-secondary': {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  v_danger: { backgroundColor: COLORS.danger },
  v_ghost: { backgroundColor: 'transparent' },

  // Sizes — match .btn-sm, .btn (default), .btn-lg
  s_sm: { paddingHorizontal: 13, paddingVertical: 8 },
  s_md: { paddingHorizontal: 20, paddingVertical: 12 },
  s_lg: { paddingHorizontal: 22, paddingVertical: 15 },

  // Text colors
  txt: { fontWeight: '600', textAlign: 'center' },
  t_primary: { color: '#fff' },
  t_secondary: { color: COLORS.textPrimary },
  t_outline: { color: COLORS.primary },
  't_outline-secondary': { color: COLORS.textSecondary },
  t_danger: { color: '#fff' },
  t_ghost: { color: COLORS.primary },

  // Text sizes
  ts_sm: { fontSize: 13 },
  ts_md: { fontSize: 15 },
  ts_lg: { fontSize: 16 },
})
