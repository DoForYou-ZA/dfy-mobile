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
          setToken(storedToken)
          setUser(parsed)
          if (!parsed.idNumber || !parsed.address) {
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
    await setAccessToken(data.token)
    setToken(data.token)
    let fullUser = data.user
    try {
      const profileRes = await authApi.getProfile()
      const profileData = profileRes.data?.data || profileRes.data
      if (profileData) fullUser = { ...data.user, ...profileData }
    } catch {}
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
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
      return payload.exp > Date.now() / 1000
    } catch { return true } // if decode fails, assume valid and let API reject
  }, [token])

  const isAdmin = useCallback(() => {
    // Treat any explicit admin signal as authoritative; do not let an isAdmin:false
    // field override an Admin role returned by the API.
    if (user?.isAdmin === true || user?.roles?.some(role => role.trim().toLowerCase() === 'admin')) {
      return true
    }

    // Some JWTs carry role claims that are not repeated on the user profile object.
    // This is a UI gate only; the API must continue enforcing every admin permission.
    if (!token) return false
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
      const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
      const claimValues = [
        payload.role,
        payload.roles,
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'],
      ]
      return claimValues
        .flatMap(value => Array.isArray(value) ? value : [value])
        .some(value => typeof value === 'string' && value.trim().toLowerCase() === 'admin')
    } catch {
      return false
    }
  }, [user, token])

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
