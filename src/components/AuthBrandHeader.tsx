import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import BrandLogo from './BrandLogo'
import { COLORS } from '../config/theme'

/** One consistent brand lockup for authentication screens. */
export default function AuthBrandHeader() {
  return (
    <View style={styles.row} accessibilityLabel="DoForYou — Small tasks. Stronger communities.">
      <BrandLogo size={48} />
      <View style={styles.copy}>
        <Text style={styles.name}>DoForYou</Text>
        <Text style={styles.tagline}>SMALL TASKS. STRONGER COMMUNITIES.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 22,
  },
  copy: { flexShrink: 1 },
  name: {
    color: COLORS.textPrimary,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginTop: 3,
  },
})
