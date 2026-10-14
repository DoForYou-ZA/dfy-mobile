import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

/** The shared DoForYou artwork used by authentication and app-shell branding. */
export default function BrandLogo({ size = 42 }: { size?: number }) {
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: Math.round(size * 0.28) }]}>
      <Image
        source={require('../../assets/splash-icon.png')}
        resizeMode="contain"
        style={{ width: size, height: size }}
        accessibilityRole="image"
        accessibilityLabel="DoForYou logo"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF9F2' },
})
