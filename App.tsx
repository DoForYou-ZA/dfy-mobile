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

// Keep the native splash (plain cream) up until the fonts are ready.
SplashScreen.preventAutoHideAsync()

function Root() {
  const { loading } = useAuth()
  const [splashDone, setSplashDone] = useState(false)

  // The logo stays on screen until BOTH the animation and the saved-session
  // check have finished, so there is never a blank flash between them.
  if (splashDone && !loading) return <AppNavigator />
  return <AnimatedSplash onDone={() => setSplashDone(true)} />
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpecialElite_400Regular,
    Inter_400Regular,
    Inter_500Medium,
  })

  if (!fontsLoaded) return null

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
