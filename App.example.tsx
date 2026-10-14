// Example App root: fonts + animated splash + session check running in parallel.
// Adapt `restoreSession` and <YourExistingRoot /> to your own code, and keep
// your existing navigation / auth providers inside <YourExistingRoot />.
import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import AnimatedSplash from './src/components/AnimatedSplash';

// Keep the native splash (plain cream) up until fonts are ready.
SplashScreen.preventAutoHideAsync();

// Replace with your real check (e.g. read the token from expo-secure-store).
async function restoreSession(): Promise<void> {
  /* ... */
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpecialElite_400Regular,
    Inter_400Regular,
    Inter_500Medium,
  });
  const [splashDone, setSplashDone] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Runs while the animation plays, so returning users don't wait twice.
  useEffect(() => {
    restoreSession().finally(() => setSessionChecked(true));
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      {splashDone && sessionChecked ? (
        // <YourExistingRoot />
        null
      ) : (
        <AnimatedSplash onDone={() => setSplashDone(true)} />
      )}
    </SafeAreaProvider>
  );
}
