import React from 'react'
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle
} from 'react-native'
import { COLORS, RADIUS } from '../config/theme'

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
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'outline' || variant === 'outline-secondary' || variant === 'ghost' ? COLORS.primary : '#fff'} />
        : <Text style={[styles.txt, styles[`t_${variant}`], styles[`ts_${size}`], textStyle]}>{title}</Text>
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
    borderRadius: RADIUS.md,
    borderWidth: 0,
  },
  block: { width: '100%', justifyContent: 'center' },
  disabled: { opacity: 0.55 },

  // Variants — match .btn-primary, .btn-secondary etc from global.css
  v_primary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 2,
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
  s_sm: { paddingHorizontal: 12, paddingVertical: 6 },
  s_md: { paddingHorizontal: 20, paddingVertical: 10 },
  s_lg: { paddingHorizontal: 28, paddingVertical: 14 },

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
