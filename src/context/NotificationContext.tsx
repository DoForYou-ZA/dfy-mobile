import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { notificationsApi } from '../api'
import { useAuth } from './AuthContext'
import ENV from '../config/env'
import type { AppNotification } from '../types'

interface NotificationContextValue {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  markTaskNotificationsRead: (taskId: string | number) => void
  remove: (id: number) => Promise<void>
  clearRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)
const PAGE_SIZE = 20
const POLL_MS = 30_000

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hubRef = useRef<signalR.HubConnection | null>(null)
  const localReadIdsRef = useRef<Set<number>>(new Set())

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  const fetch = useCallback(async () => {
    if (!isAuthenticated() || isAdmin()) return
    try {
      const res = await notificationsApi.getAll(1, PAGE_SIZE)
      if (res.data?.success) {
        let data: AppNotification[] = res.data.data || []
        data = data.map(n => localReadIdsRef.current.has(n.id) ? { ...n, isRead: true } : n)
        setNotifications(data)
        setTotalPages(res.data.totalPages || 1)
        setPage(1)
      }
    } catch {}
    finally { setLoading(false) }
  }, [isAuthenticated, isAdmin])

  const startPolling = useCallback((fetchFn: () => Promise<void>) => {
    if (pollRef.current) return
    pollRef.current = setInterval(fetchFn, POLL_MS)
  }, [])

  const loadMore = useCallback(async () => {
    if (!isAuthenticated() || isAdmin()) return
    const next = page + 1
    try {
      const res = await notificationsApi.getAll(next, PAGE_SIZE)
      if (res.data?.success) {
        setNotifications(prev => {
          const ids = new Set(prev.map(n => n.id))
          const fresh = (res.data.data || []).filter((n: AppNotification) => !ids.has(n.id))
          return [...prev, ...fresh]
        })
        setTotalPages(res.data.totalPages || 1)
        setPage(next)
      }
    } catch {}
  }, [isAuthenticated, isAdmin, page])

  const pushNotification = useCallback((raw: any) => {
    const n: AppNotification = {
      id: raw.id ?? Date.now(),
      type: raw.type || 'system',
      title: raw.title || 'Notification',
      message: raw.message || '',
      isRead: false,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
      count: raw.count ?? 1,
      relatedTaskId: raw.relatedTaskId ?? null,
      relatedTaskStringId: raw.relatedTaskStringId ?? null,
      expiresAt: raw.expiresAt ?? null,
    }
    setNotifications(prev => {
      const idx = prev.findIndex(p => p.id === n.id)
      if (idx !== -1) {
        const updated = [...prev]
        updated.splice(idx, 1)
        return [n, ...updated]
      }
      return [n, ...prev]
    })
  }, [])

  useEffect(() => {
    if (!isAuthenticated() || isAdmin()) return
    const setupHub = async () => {
      const token = await AsyncStorage.getItem('token')
      if (!token) return
      const hubUrl = `${ENV.signalRUrl}/api/v1/hubs/chat`
      const hub = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => token, skipNegotiation: true, transport: signalR.HttpTransportType.WebSockets })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build()
      hub.on('NewNotification', pushNotification)
      hub.on('TaskClaimed', (data: any) => pushNotification({ type: 'task_claimed', title: 'Task Claimed', message: `Your task has been claimed by ${data.helperName || 'a runner'}`, relatedTaskId: data.taskId }))
      hub.on('TaskCompleted', (data: any) => pushNotification({ type: 'task_completed', title: 'Task Completed', message: 'Task is complete and awaiting your confirmation', relatedTaskId: data.taskId }))
      hub.on('PaymentVerified', (data: any) => pushNotification({ type: 'payment_verified', title: 'Payment Verified', message: 'Payment for your task has been verified', relatedTaskId: data.taskId }))
      hub.onreconnected(() => stopPolling())
      hub.onclose(() => startPolling(fetch))
      hub.start().then(() => stopPolling()).catch(() => startPolling(fetch))
      hubRef.current = hub
    }
    setupHub()
    return () => { hubRef.current?.stop(); hubRef.current = null }
  }, [isAuthenticated, isAdmin, user?.id, pushNotification, fetch, startPolling, stopPolling])

  useEffect(() => {
    if (!isAuthenticated() || isAdmin()) { setNotifications([]); return }
    setLoading(true)
    fetch()
    startPolling(fetch)
    return () => stopPolling()
  }, [isAuthenticated, isAdmin, fetch, startPolling, stopPolling])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markRead = useCallback(async (id: number) => {
    localReadIdsRef.current.add(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await notificationsApi.markRead(String(id))
      .then(() => localReadIdsRef.current.delete(id))
      .catch(() => {})
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications(prev => { prev.forEach(n => localReadIdsRef.current.add(n.id)); return prev.map(n => ({ ...n, isRead: true })) })
    await notificationsApi.markAllRead().then(() => localReadIdsRef.current.clear()).catch(() => {})
  }, [])

  const markTaskNotificationsRead = useCallback((taskId: string | number) => {
    setNotifications(prev => {
      const toMark = prev.filter(n => !n.isRead && n.type === 'new_message' && String(n.relatedTaskId) === String(taskId))
      if (toMark.length === 0) return prev
      toMark.forEach(n => localReadIdsRef.current.add(n.id))
      notificationsApi.markTaskRead(Number(taskId))
        .then(() => toMark.forEach(n => localReadIdsRef.current.delete(n.id)))
        .catch(() => {})
      return prev.map(n => toMark.some(m => m.id === n.id) ? { ...n, isRead: true } : n)
    })
  }, [])

  const remove = useCallback(async (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await notificationsApi.remove(String(id)).catch(() => {})
  }, [])

  const clearRead = useCallback(async () => {
    setNotifications(prev => prev.filter(n => !n.isRead))
    await notificationsApi.clearRead().catch(() => {})
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading, hasMore: page < totalPages,
      loadMore, markRead, markAllRead, markTaskNotificationsRead,
      remove, clearRead, refresh: fetch,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
