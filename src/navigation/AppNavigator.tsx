import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { COLORS, SHADOW } from '../config/theme'
import Button from '../components/Button'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import DashboardScreen from '../screens/DashboardScreen'
import BrowseErrandsScreen from '../screens/tasks/BrowseErrandsScreen'
import PostErrandScreen from '../screens/tasks/PostErrandScreen'
import MyPostedTasksScreen from '../screens/tasks/MyPostedTasksScreen'
import MyActiveTasksScreen from '../screens/tasks/MyActiveTasksScreen'
import MyCompletedTasksScreen from '../screens/tasks/MyCompletedTasksScreen'
import TaskChatScreen from '../screens/tasks/TaskChatScreen'
import BankAccountsScreen from '../screens/user/BankAccountsScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import NotificationsScreen from '../screens/NotificationsScreen'

const Stack = createNativeStackNavigator()
const HIDE_BOTTOM_NAV = ['TaskChat', 'Login', 'Register']

function TopNavbar({ navRef }: { navRef: any }) {
  const { unreadCount } = useNotifications()
  const insets = useSafeAreaInsets()
  return (
    <View style={[s.navbar, { paddingTop: insets.top }]}>
      <View style={s.navbarInner}>
        <TouchableOpacity style={s.brandRow} onPress={() => navRef.current?.navigate('Dashboard' as never)} accessibilityRole="button" accessibilityLabel="Go to home">
          <View style={s.logoMark}><Text style={s.logoLetter}>D</Text><View style={s.logoDot} /></View>
          <View>
            <Text style={s.brandName}>DoForYou</Text>
            <Text style={s.brandCaption}>TASKS MADE EASIER</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.bellBtn}
          onPress={() => navRef.current?.navigate('Notifications' as never)}
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <Text style={s.bellIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={s.bellBadge}><Text style={s.bellBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BottomNav({ currentRoute, navRef }: { currentRoute: string; navRef: any }) {
  const { isAuthenticated, canPostErrands, user } = useAuth()
  const insets = useSafeAreaInsets()
  if (!isAuthenticated() || HIDE_BOTTOM_NAV.includes(currentRoute)) return null

  const canPost = canPostErrands()
  const isActive = (routes: string[]) => routes.includes(currentRoute)
  const go = (route: string) => navRef.current?.navigate(route as never)
  const tasksRoute = user?.userType === 'creator' ? 'MyPostedTasks' : 'MyActiveTasks'
  const items = [
    { route: 'Dashboard', label: 'Home', icon: '⌂', matches: ['Dashboard'] },
    { route: 'BrowseErrands', label: 'Explore', icon: '⌕', matches: ['BrowseErrands'] },
    ...(canPost ? [{ route: 'PostErrand', label: 'Post', icon: '＋', matches: ['PostErrand'] }] : []),
    { route: tasksRoute, label: 'My tasks', icon: '▤', matches: ['MyPostedTasks', 'MyActiveTasks', 'MyCompletedTasks'] },
    { route: 'Profile', label: 'Profile', icon: '○', matches: ['Profile', 'BankAccounts'] },
  ]

  return (
    <View style={[s.bottomShell, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={s.bottomNav}>
        {items.map((item) => {
          const active = isActive(item.matches)
          const isPost = item.route === 'PostErrand'
          return (
            <TouchableOpacity
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={s.navItem}
              onPress={() => go(item.route)}
              activeOpacity={0.76}
            >
              <View style={[
                s.navIconWrap,
                active && s.navIconWrapActive,
                isPost && s.postNavIconWrap,
              ]}>
                <Text style={[
                  s.navIcon,
                  active && s.navIconActive,
                  isPost && s.postNavIcon,
                ]}>{item.icon}</Text>
              </View>
              <Text style={[s.navLabel, active && s.navLabelActive, isPost && s.postNavLabel]}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const screenHeader = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: { fontWeight: '800' as const, fontSize: 16 },
  headerBackTitle: '',
  headerShadowVisible: false,
}

export default function AppNavigator() {
  const { isAuthenticated, isAdmin, logout, loading } = useAuth()
  const navRef = useNavigationContainerRef()
  const [currentRoute, setCurrentRoute] = useState('Dashboard')

  if (loading) return <View style={s.loadingSurface} />

  // Admin operations stay in the web admin console. Admin accounts cannot enter the customer app.
  if (isAuthenticated() && isAdmin()) {
    return (
      <View style={s.restrictedPage}>
        <View style={s.restrictedMark}><Text style={s.restrictedMarkText}>D</Text></View>
        <Text style={s.restrictedEyebrow}>DOFORYOU ADMIN</Text>
        <Text style={s.restrictedTitle}>This space is for customers and task runners.</Text>
        <Text style={s.restrictedBody}>Admin tools are not available in the mobile app. Please sign in to the DoForYou web admin dashboard to manage platform operations.</Text>
        <Button title="Sign out of mobile" onPress={() => logout()} fullWidth size="lg" style={{ marginTop: 18 }} />
      </View>
    )
  }

  const authenticated = isAuthenticated()
  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const route = navRef.current?.getCurrentRoute()?.name
        if (route) setCurrentRoute(route)
      }}
    >
      <View style={s.appShell}>
        {authenticated && <TopNavbar navRef={navRef} />}
        <View style={s.screenArea}>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
            {!authenticated ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="BrowseErrands" component={BrowseErrandsScreen} />
                <Stack.Screen name="PostErrand" component={PostErrandScreen} />
                <Stack.Screen name="MyPostedTasks" component={MyPostedTasksScreen} />
                <Stack.Screen name="MyActiveTasks" component={MyActiveTasksScreen} />
                <Stack.Screen name="MyCompletedTasks" component={MyCompletedTasksScreen} />
                <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen
                  name="TaskChat"
                  component={TaskChatScreen}
                  options={{ headerShown: true, title: 'Task chat', ...screenHeader }}
                />
              </>
            )}
          </Stack.Navigator>
        </View>
        {authenticated && <BottomNav currentRoute={currentRoute} navRef={navRef} />}
      </View>
    </NavigationContainer>
  )
}

const s = StyleSheet.create({
  appShell: { flex: 1, backgroundColor: COLORS.background },
  loadingSurface: { flex: 1, backgroundColor: COLORS.background },
  screenArea: { flex: 1 },
  navbar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10,
  },
  navbarInner: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: { width: 39, height: 39, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  logoLetter: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', lineHeight: 27 },
  logoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent, position: 'absolute', right: 6, bottom: 6 },
  brandName: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.3 },
  brandCaption: { fontSize: 8, color: COLORS.textSecondary, fontWeight: '800', letterSpacing: 1.3, marginTop: 2 },
  bellBtn: { width: 43, height: 43, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  bellIcon: { color: COLORS.textPrimary, fontSize: 24, lineHeight: 26, transform: [{ rotate: '-25deg' }] },
  bellBadge: { position: 'absolute', top: 3, right: 3, minWidth: 17, height: 17, backgroundColor: COLORS.danger, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 2, borderColor: COLORS.surface },
  bellBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900' },
  bottomShell: { backgroundColor: COLORS.surface, paddingTop: 7, borderTopWidth: 1, borderTopColor: COLORS.borderLight, position: 'relative' },
  bottomNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 9 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 54 },
  navIconWrap: { width: 42, height: 30, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navIconWrapActive: { backgroundColor: COLORS.primaryLight },
  navIcon: { fontSize: 23, color: COLORS.textMuted, fontWeight: '700' },
  navIconActive: { color: COLORS.primaryDark },
  navLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },
  navLabelActive: { color: COLORS.primaryDark, fontWeight: '900' },
  postNavIconWrap: { backgroundColor: COLORS.primary, ...SHADOW.primary },
  postNavIcon: { color: '#FFFFFF', fontSize: 22, lineHeight: 25 },
  postNavLabel: { color: COLORS.primaryDark, fontWeight: '900' },
  restrictedPage: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', backgroundColor: COLORS.background },
  restrictedMark: { alignSelf: 'flex-start', width: 57, height: 57, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 26, ...SHADOW.primary },
  restrictedMarkText: { color: '#FFFFFF', fontSize: 35, fontWeight: '900' },
  restrictedEyebrow: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  restrictedTitle: { color: COLORS.textPrimary, fontWeight: '900', fontSize: 29, lineHeight: 35, letterSpacing: -0.8 },
  restrictedBody: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 13 },
})
