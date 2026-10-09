import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const TOKEN_KEY = 'token'

// SecureStore is used on native. Keep AsyncStorage on web, where native
// keychain/keystore APIs are unavailable. Migrate existing native tokens once.
export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(TOKEN_KEY)

  const secureToken = await SecureStore.getItemAsync(TOKEN_KEY)
  if (secureToken) return secureToken

  const legacyToken = await AsyncStorage.getItem(TOKEN_KEY)
  if (!legacyToken) return null

  await SecureStore.setItemAsync(TOKEN_KEY, legacyToken, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })
  await AsyncStorage.removeItem(TOKEN_KEY)
  return legacyToken
}

export async function setAccessToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(TOKEN_KEY, token)
    return
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })
  await AsyncStorage.removeItem(TOKEN_KEY)
}

export async function clearAccessToken(): Promise<void> {
  if (Platform.OS !== 'web') {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  }
  await AsyncStorage.removeItem(TOKEN_KEY)
}
