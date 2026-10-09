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
import AdminAccessScreen from '../screens/auth/AdminAccessScreen'
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
const HIDE_BOTTOM_NAV = ['TaskChat', 'Login', 'Register', 'AdminAccess']

function TopNavbar({ navRef }: { navRef: any }) {
  const { unreadCount } = useNotifications()
  const insets = useSafeAreaInsets()
  return (
    <View style={[s.navbar, { paddingTop: insets.top }]}>
      <View style={s.navbarInner}>
        <View style={s.brandRow}>
          <View style={s.brandMark}><Text style={s.brandMarkText}>D</Text></View>
          <Text style={s.brandName}>DoForYou<Text style={s.brandDot}>.</Text></Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={s.bellBtn}
          onPress={() => navRef.current?.navigate('Notifications' as never)}
        >
          <Text style={s.bellIcon}>♧</Text>
          {unreadCount > 0 && (
            <View style={s.bellBadge}>
              <Text style={s.bellBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BottomNav({ currentRoute, navRef }: { currentRoute: string; navRef: any }) {
  const { isAuthenticated, isAdmin, canPostErrands, user } = useAuth()
  const insets = useSafeAreaInsets()
  if (!isAuthenticated() || isAdmin() || HIDE_BOTTOM_NAV.includes(currentRoute)) return null

  const go = (route: string) => navRef.current?.navigate(route as never)
  const isActive = (r: string) => currentRoute === r
  const canPost = canPostErrands()

  return (
    <View style={[s.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TouchableOpacity accessibilityRole="button" style={s.navItem} onPress={() => go('Dashboard')}>
        <Text style={[s.navIcon, isActive('Dashboard') && s.navIconActive]}>⌂</Text>
        <Text style={[s.navLabel, isActive('Dashboard') && s.navLabelActive]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" style={s.navItem} onPress={() => go('BrowseErrands')}>
        <Text style={[s.navIcon, isActive('BrowseErrands') && s.navIconActive]}>⌕</Text>
        <Text style={[s.navLabel, isActive('BrowseErrands') && s.navLabelActive]}>Explore</Text>
      </TouchableOpacity>
      {canPost ? (
        <TouchableOpacity accessibilityRole="button" style={s.navItem} onPress={() => go('PostErrand')}>
          <View style={[s.fab, isActive('PostErrand') && s.fabActive]}><Text style={s.fabIcon}>＋</Text></View>
          <Text style={[s.navLabel, { marginTop: 3 }, isActive('PostErrand') && s.navLabelActive]}>Post task</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity accessibilityRole="button" style={s.navItem} onPress={() => go('MyActiveTasks')}>
          <View style={[s.fab, s.fabRunner, isActive('MyActiveTasks') && s.fabActive]}><Text style={s.fabIcon}>↗</Text></View>
          <Text style={[s.navLabel, { marginTop: 3 }, isActive('MyActiveTasks') && s.navLabelActive]}>My tasks</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity accessibilityRole="button" style={s.navItem} onPress={() => go('Notifications')}>
        <View style={s.navIconWrap}>
          <Text style={[s.navIcon, isActive('Notifications') && s.navIconActive]}>♧</Text>
          {useNotificationsBadgePlaceholder(false)}
        </View>
        <Text style={[s.navLabel, isActive('Notifications') && s.navLabelActive]}>Alerts</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" style={s.navItem} onPress={() => go('Profile')}>
        <Text style={[s.navIcon, isActive('Profile') && s.navIconActive]}>{(user?.firstName || 'Y').slice(0, 1).toUpperCase()}</Text>
        <Text style={[s.navLabel, isActive('Profile') && s.navLabelActive]}>You</Text>
      </TouchableOpacity>
    </View>
  )
}

function useNotificationsBadgePlaceholder(_unused: boolean) {
  return null
}

const orangeHeader = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#fff' as const,
  headerTitleStyle: { fontWeight: '800' as const, fontSize: 17 },
  headerBackTitle: '',
}

export default function AppNavigator() {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const navRef = useNavigationContainerRef()
  const [currentRoute, setCurrentRoute] = React.useState('Dashboard')

  if (loading) return null
  const adminAccount = isAuthenticated() && isAdmin()

  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const route = navRef.current?.getCurrentRoute()?.name
        if (route) setCurrentRoute(route)
      }}
    >
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        {isAuthenticated() && !adminAccount && <TopNavbar navRef={navRef} />}
        <View style={{ flex: 1 }}>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
            {!isAuthenticated() ? (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            ) : adminAccount ? (
              <Stack.Screen name="AdminAccess" component={AdminAccessScreen} />
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
                <Stack.Screen name="TaskChat" component={TaskChatScreen} options={{ headerShown: true, title: 'Task Chat', ...orangeHeader }} />
              </>
            )}
          </Stack.Navigator>
        </View>
        {isAuthenticated() && !adminAccount && <BottomNav currentRoute={currentRoute} navRef={navRef} />}
      </View>
    </NavigationContainer>
  )
}

const s = StyleSheet.create({
  navbar: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 100,
  },
  navbarInner: {
    height: 60, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 18,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 32, height: 32, borderRadius: 11, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  brandName: { fontSize: 19, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.6 },
  brandDot: { color: COLORS.primary },
  bellBtn: { position: 'relative', width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: COLORS.primaryTint },
  bellIcon: { fontSize: 23, color: COLORS.primaryDark },
  bellBadge: { position: 'absolute', top: 1, right: 1, minWidth: 17, height: 17, backgroundColor: COLORS.danger, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  bottomNav: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderTopWidth: 1,
    borderTopColor: COLORS.borderLight, height: 68, paddingHorizontal: 4, alignItems: 'stretch',
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 44 },
  navIconWrap: { position: 'relative' },
  navIcon: { fontSize: 23, color: COLORS.textMuted, fontWeight: '600' },
  navIconActive: { color: COLORS.primary, fontWeight: '900' },
  navLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
  navLabelActive: { color: COLORS.primaryDark },
  fab: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: -16, ...{ shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 7, elevation: 5 } },
  fabRunner: { backgroundColor: COLORS.success },
  fabActive: { transform: [{ scale: 1.06 }] },
  fabIcon: { fontSize: 23, color: '#fff', fontWeight: '800' },
})
