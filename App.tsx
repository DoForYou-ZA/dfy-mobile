import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite'
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { NotificationProvider } from './src/context/NotificationContext'
import AppNavigator from './src/navigation/AppNavigator'
import AnimatedSplash from './src/components/AnimatedSplash'

// Keep the native cream splash up until the React splash has mounted.
SplashScreen.preventAutoHideAsync()

function Root() {
  const { loading } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const [fontsLoaded, fontError] = useFonts({
    SpecialElite_400Regular,
    Inter_400Regular,
    Inter_500Medium,
  })
  const fontsReady = fontsLoaded || !!fontError

  // Mount the branded splash immediately. Keep it visible until its animation,
  // the saved-session check, and font loading have all finished.
  if (splashDone && !loading && fontsReady) return <AppNavigator />
  return <AnimatedSplash fontsReady={fontsReady} onDone={() => setSplashDone(true)} />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar style="dark" />
          <Root />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
