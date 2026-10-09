import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearAccessToken, getAccessToken, setAccessToken } from '../core/tokenStorage'
import type { User } from '../types'
import { authApi } from '../api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  isProfileComplete: () => boolean
  isProfileIncomplete: () => boolean
  canPostErrands: () => boolean
  canAcceptTasks: () => boolean
  getProfileCompletion: () => number
}

function isAdminProfile(candidate: any): boolean {
  if (!candidate || typeof candidate !== 'object') return false
  if (candidate.isAdmin === true) return true
  const roles: unknown[] = [
    candidate.role,
    candidate.userType,
    ...(Array.isArray(candidate.roles) ? candidate.roles : []),
  ]
  return roles.some(role => String(role ?? '').trim().toLowerCase().includes('admin'))
}

function isAdminSession(candidate: any, accessToken?: string | null): boolean {
  if (isAdminProfile(candidate)) return true
  if (!accessToken) return false
  try {
    const encoded = accessToken.split('.')[1]
    if (!encoded) return false
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const decoded = atob(padded)
    const payloadText = decodeURIComponent(Array.from(decoded, char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''))
    const claims = JSON.parse(payloadText)
    const claimRoles = [
      claims.role,
      claims.roles,
      claims.userType,
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'],
    ]
    return claims.isAdmin === true || claimRoles.some(value =>
      (Array.isArray(value) ? value : [value])
        .some(role => String(role ?? '').trim().toLowerCase().includes('admin'))
    )
  } catch {
    return false
  }
}

const ADMIN_MOBILE_MESSAGE =
  'Admin accounts use the DoForYou web admin console and cannot sign in to the mobile app.'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const storedToken = await getAccessToken()
      const storedUser = await AsyncStorage.getItem('currentUser')
      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          if (isAdminSession(parsed, storedToken)) {
            // Mobile is a creator/runner client; stale admin sessions are cleared.
            await clearAccessToken()
            await AsyncStorage.multiRemove(['currentUser', 'refreshToken', 'userPreferences'])
          } else {
            setToken(storedToken)
            setUser(parsed)
          }
          if (!isAdminSession(parsed, storedToken) && (!parsed.idNumber || !parsed.address)) {
            authApi.getProfile()
              .then(r => {
                const d = r.data?.data || r.data
                if (d) {
                  const merged = { ...parsed, ...d }
                  AsyncStorage.setItem('currentUser', JSON.stringify(merged))
                  setUser(merged)
                }
              })
              .catch(() => {})
          }
        } catch {
          await clearAccessToken()
          await AsyncStorage.removeItem('currentUser')
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    const data = res.data
    if (!data.success || !data.token || !data.user) {
      throw new Error(data.message || 'Login failed')
    }
    if (isAdminSession(data.user, data.token)) {
      await clearAccessToken()
      await AsyncStorage.multiRemove(['currentUser', 'refreshToken', 'userPreferences'])
      setToken(null)
      setUser(null)
      throw new Error(ADMIN_MOBILE_MESSAGE)
    }
    await setAccessToken(data.token)
    let fullUser = data.user
    try {
      const profileRes = await authApi.getProfile()
      const profileData = profileRes.data?.data || profileRes.data
      if (profileData) fullUser = { ...data.user, ...profileData }
    } catch {}
    if (isAdminSession(fullUser, data.token)) {
      await clearAccessToken()
      await AsyncStorage.multiRemove(['currentUser', 'refreshToken', 'userPreferences'])
      setToken(null)
      setUser(null)
      throw new Error(ADMIN_MOBILE_MESSAGE)
    }
    setToken(data.token)
    await AsyncStorage.setItem('currentUser', JSON.stringify(fullUser))
    if (fullUser.userType) {
      const prefs = {
        canCreateTasks: fullUser.userType === 'creator' || fullUser.userType === 'both',
        canAcceptTasks: fullUser.userType === 'runner' || fullUser.userType === 'both',
      }
      await AsyncStorage.setItem('userPreferences', JSON.stringify(prefs))
    }
    setUser(fullUser)
  }, [])

  const logout = useCallback(async () => {
    await clearAccessToken()
    await AsyncStorage.multiRemove(['currentUser', 'refreshToken', 'userPreferences'])
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const stored = await AsyncStorage.getItem('currentUser')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  const isAuthenticated = useCallback(() => {
    if (!token) return false
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
      const decoded = atob(padded)
      const payloadText = decodeURIComponent(Array.from(decoded, char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''))
      const payload = JSON.parse(payloadText)
      return payload.exp > Date.now() / 1000
    } catch { return false } // malformed/unreadable tokens fail closed; the API remains authoritative
  }, [token])

  const isAdmin = useCallback(() => isAdminSession(user, token), [user, token])

  const isProfileComplete = useCallback(() => {
    if (!user) return false
    const phone = user.contact || user.phoneNumber
    return !!(user.firstName && user.lastName && user.email && phone
      && user.userType && user.idNumber && user.address)
  }, [user])

  const isProfileIncomplete = useCallback(() => !isProfileComplete(), [isProfileComplete])

  const canPostErrands = useCallback(() => {
    if (!isAuthenticated() || isAdmin()) return false
    const ut = user?.userType
    if (ut) return ut === 'creator' || ut === 'both'
    return false
  }, [user, isAuthenticated, isAdmin])

  const canAcceptTasks = useCallback(() => {
    if (!isAuthenticated() || isAdmin() || isProfileIncomplete()) return false
    const ut = user?.userType
    if (ut) return ut === 'runner' || ut === 'both'
    return false
  }, [user, isAuthenticated, isAdmin, isProfileIncomplete])

  const getProfileCompletion = useCallback(() => user?.profileCompletion ?? 0, [user])

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, refreshUser,
      isAuthenticated, isAdmin,
      isProfileComplete, isProfileIncomplete,
      canPostErrands, canAcceptTasks,
      getProfileCompletion,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
