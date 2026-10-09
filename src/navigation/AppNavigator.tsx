import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { COLORS, RADIUS } from '../config/theme'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import AdminMobileBlockedScreen from '../screens/AdminMobileBlockedScreen'
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
const HIDE_BOTTOM_NAV = ['TaskChat', 'Login', 'Register', 'AdminMobileBlocked']

function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <View style={[s.brandMark, { width: size, height: size, borderRadius: size * 0.34 }]}>
      <Text style={[s.brandMarkText, { fontSize: size * 0.68 }]}>d</Text>
      <View style={[s.brandDot, { width: size * 0.16, height: size * 0.16, borderRadius: size * 0.08 }]} />
    </View>
  )
}

function TopNavbar({ navRef }: { navRef: any }) {
  const { unreadCount } = useNotifications()
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.topBar, { paddingTop: insets.top }]}>
      <View style={s.topBarInner}>
        <View style={s.brandRow}>
          <BrandMark size={35} />
          <View>
            <Text style={s.brandName}>DoForYou</Text>
            <Text style={s.brandTagline}>SMALL TASKS. REAL HELP.</Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `Inbox, ${unreadCount} unread` : 'Open inbox'}
          style={s.inboxButton}
          onPress={() => navRef.current?.navigate('Notifications' as never)}
        >
          <Text style={s.inboxGlyph}>•••</Text>
          {unreadCount > 0 && (
            <View style={s.inboxBadge}><Text style={s.inboxBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BottomNav({ currentRoute, navRef }: { currentRoute: string; navRef: any }) {
  const { isAuthenticated, canPostErrands, canAcceptTasks, isAdmin } = useAuth()
  const insets = useSafeAreaInsets()

  if (!isAuthenticated() || isAdmin() || HIDE_BOTTOM_NAV.includes(currentRoute)) return null

  const canPost = canPostErrands()
  const canAccept = canAcceptTasks()
  const primaryTaskRoute = canPost ? 'PostErrand' : canAccept ? 'MyActiveTasks' : 'BrowseErrands'
  const primaryTaskLabel = canPost ? 'Post' : canAccept ? 'My tasks' : 'Tasks'
  const primaryTaskGlyph = canPost ? '+' : canAccept ? '▤' : '↗'
  const isActive = (route: string) => currentRoute === route
  const go = (route: string) => navRef.current?.navigate(route as never)

  const item = (route: string, glyph: string, label: string) => (
    <TouchableOpacity
      key={route}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive(route) }}
      accessibilityLabel={label}
      style={s.navItem}
      onPress={() => go(route)}
    >
      {isActive(route) && <View style={s.activePip} />}
      <Text style={[s.navGlyph, isActive(route) && s.navGlyphActive]}>{glyph}</Text>
      <Text style={[s.navLabel, isActive(route) && s.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={[s.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {item('Dashboard', '⌂', 'Home')}
      {item('BrowseErrands', '⌕', 'Explore')}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={primaryTaskLabel}
        style={s.primaryNavItem}
        onPress={() => go(primaryTaskRoute)}
      >
        <View style={[s.primaryNavButton, isActive(primaryTaskRoute) && s.primaryNavButtonActive]}>
          <Text style={s.primaryNavGlyph}>{primaryTaskGlyph}</Text>
        </View>
        <Text style={[s.navLabel, s.primaryNavLabel, isActive(primaryTaskRoute) && s.navLabelActive]}>{primaryTaskLabel}</Text>
      </TouchableOpacity>
      {item('Notifications', '◌', 'Inbox')}
      {item('Profile', '○', 'Account')}
    </View>
  )
}

const nativeHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: COLORS.ink },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: '800' as const, fontSize: 16 },
  headerShadowVisible: false,
  headerBackTitle: '',
}

export default function AppNavigator() {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth()
  const navRef = useNavigationContainerRef()
  const [currentRoute, setCurrentRoute] = React.useState('Dashboard')

  if (loading) return null

  const authenticated = isAuthenticated()
  const adminMode = authenticated && isAdmin()
  const navigatorKey = adminMode ? 'admin-only' : authenticated ? 'customer-app' : 'public-auth'

  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const route = navRef.current?.getCurrentRoute()?.name
        if (route) setCurrentRoute(route)
      }}
    >
      <View style={s.app}>
        {authenticated && !adminMode && <TopNavbar navRef={navRef} />}
        <View style={s.screenArea}>
          <Stack.Navigator
            key={navigatorKey}
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}
          >
            {adminMode ? (
              <Stack.Screen name="AdminMobileBlocked">
                {() => <AdminMobileBlockedScreen onSignOut={logout} />}
              </Stack.Screen>
            ) : !authenticated ? (
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
                  options={{ ...nativeHeader, title: 'Task conversation' }}
                />
              </>
            )}
          </Stack.Navigator>
        </View>
        {authenticated && !adminMode && <BottomNav currentRoute={currentRoute} navRef={navRef} />}
      </View>
    </NavigationContainer>
  )
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: COLORS.background },
  screenArea: { flex: 1 },
  topBar: { backgroundColor: COLORS.background, zIndex: 10 },
  topBarInner: {
    minHeight: 63, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 17, paddingBottom: 11,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: COLORS.white, fontWeight: '900', marginTop: -3 },
  brandDot: { position: 'absolute', right: 5, bottom: 5, backgroundColor: COLORS.primary },
  brandName: { color: COLORS.ink, fontSize: 15, fontWeight: '900', letterSpacing: -0.35 },
  brandTagline: { fontSize: 7, color: COLORS.textMuted, fontWeight: '900', letterSpacing: 1.25, marginTop: 3 },
  inboxButton: { width: 41, height: 41, backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  inboxGlyph: { marginTop: -8, fontSize: 18, fontWeight: '900', letterSpacing: 1, color: COLORS.textPrimary },
  inboxBadge: { position: 'absolute', minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 9, top: -3, right: -3, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  inboxBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '900' },
  bottomNav: {
    flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-around',
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 7, paddingHorizontal: 5, minHeight: 66,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 49, position: 'relative' },
  activePip: { position: 'absolute', top: -7, width: 18, height: 3, borderRadius: 2, backgroundColor: COLORS.primary },
  navGlyph: { fontSize: 22, fontWeight: '500', color: COLORS.textMuted, minHeight: 24 },
  navGlyphActive: { color: COLORS.primaryDark },
  navLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted },
  navLabelActive: { color: COLORS.primaryDark },
  primaryNavItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1, minHeight: 49 },
  primaryNavButton: { width: 42, height: 42, borderRadius: 16, marginTop: -19, backgroundColor: COLORS.primary, borderWidth: 3, borderColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  primaryNavButtonActive: { backgroundColor: COLORS.primaryDark },
  primaryNavGlyph: { color: COLORS.white, fontSize: 24, fontWeight: '700', marginTop: -1 },
  primaryNavLabel: { marginTop: 1 },
})
