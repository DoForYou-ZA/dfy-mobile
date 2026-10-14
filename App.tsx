import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { AppState, View } from 'react-native'
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

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000

/**
 * End a signed-in session after 15 minutes without app interaction.
 * The timestamp is retained while the app is backgrounded, so returning
 * after a long absence also expires the session.
 */
function InactivityGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef(Date.now())
  const appStateRef = useRef(AppState.currentState)

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const scheduleLogout = useCallback((delay = INACTIVITY_TIMEOUT_MS) => {
    clearTimer()
    if (!isAuthenticated()) return
    timerRef.current = setTimeout(() => {
      if (isAuthenticated()) void logout()
    }, Math.max(0, delay))
  }, [clearTimer, isAuthenticated, logout])

  const recordActivity = useCallback(() => {
    if (!isAuthenticated()) {
      clearTimer()
      return
    }
    lastActivityRef.current = Date.now()
    scheduleLogout()
  }, [clearTimer, isAuthenticated, scheduleLogout])

  useEffect(() => {
    if (isAuthenticated()) {
      lastActivityRef.current = Date.now()
      scheduleLogout()
    } else {
      clearTimer()
    }
    return clearTimer
  }, [clearTimer, isAuthenticated, scheduleLogout])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const previousState = appStateRef.current
      appStateRef.current = nextState
      if (nextState !== 'active' || previousState === 'active' || !isAuthenticated()) return

      const elapsed = Date.now() - lastActivityRef.current
      const remaining = INACTIVITY_TIMEOUT_MS - elapsed
      if (remaining <= 0) void logout()
      else scheduleLogout(remaining)
    })
    return () => subscription.remove()
  }, [isAuthenticated, logout, scheduleLogout])

  return (
    <View style={{ flex: 1 }} onTouchStart={recordActivity} onTouchMove={recordActivity}>
      {children}
    </View>
  )
}

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
  return <AnimatedSplash fontsReady={fontsReady} fontError={!!fontError} onDone={() => setSplashDone(true)} />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <InactivityGuard>
          <NotificationProvider>
            <StatusBar style="dark" />
            <Root />
          </NotificationProvider>
        </InactivityGuard>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
