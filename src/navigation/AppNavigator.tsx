import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { COLORS, RADIUS, SHADOW } from '../config/theme'

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

function BrandMark() {
  return <View style={s.brandMark}><Text style={s.brandMarkText}>dfy</Text></View>
}

function TopNavbar({ navRef }: { navRef: any }) {
  const { unreadCount } = useNotifications()
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.navbar, { paddingTop: insets.top }]}>
      <View style={s.navbarInner}>
        <View style={s.brandLockup}>
          <BrandMark />
          <Text style={s.brandName}>DoForYou<Text style={s.brandDot}>.</Text></Text>
        </View>
        <TouchableOpacity
          style={s.bellBtn}
          onPress={() => navRef.current?.navigate('Notifications' as never)}
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
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
  const { isAuthenticated, canPostErrands } = useAuth()
  const { unreadCount } = useNotifications()
  const insets = useSafeAreaInsets()

  if (!isAuthenticated() || HIDE_BOTTOM_NAV.includes(currentRoute)) return null

  const go = (route: string) => navRef.current?.navigate(route as never)
  const isActive = (route: string) => currentRoute === route
  const canPost = canPostErrands()

  return (
    <View style={[s.bottomNav, { paddingBottom: insets.bottom || 8 }]}>
      <TouchableOpacity style={s.navItem} onPress={() => go('Dashboard')} accessibilityRole="button">
        <View style={[s.navIconWrap, isActive('Dashboard') && s.navIconWrapActive]}>
          <Text style={[s.navIcon, isActive('Dashboard') && s.navIconActive]}>⌂</Text>
        </View>
        <Text style={[s.navLabel, isActive('Dashboard') && s.navLabelActive]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.navItem} onPress={() => go('BrowseErrands')} accessibilityRole="button">
        <View style={[s.navIconWrap, isActive('BrowseErrands') && s.navIconWrapActive]}>
          <Text style={[s.navIcon, isActive('BrowseErrands') && s.navIconActive]}>⌕</Text>
        </View>
        <Text style={[s.navLabel, isActive('BrowseErrands') && s.navLabelActive]}>Explore</Text>
      </TouchableOpacity>

      {canPost ? (
        <TouchableOpacity style={s.navItem} onPress={() => go('PostErrand')} accessibilityRole="button">
          <View style={[s.fab, isActive('PostErrand') && s.fabActive]}><Text style={s.fabIcon}>+</Text></View>
          <Text style={[s.navLabel, s.navLabelPost, isActive('PostErrand') && s.navLabelActive]}>Post task</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.navItem} onPress={() => go('MyActiveTasks')} accessibilityRole="button">
          <View style={[s.fab, s.fabRunner, isActive('MyActiveTasks') && s.fabActive]}><Text style={s.fabIcon}>✓</Text></View>
          <Text style={[s.navLabel, s.navLabelPost, isActive('MyActiveTasks') && s.navLabelActive]}>My tasks</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={s.navItem} onPress={() => go('Notifications')} accessibilityRole="button">
        <View style={[s.navIconWrap, isActive('Notifications') && s.navIconWrapActive]}>
          <Text style={[s.navIcon, isActive('Notifications') && s.navIconActive]}>◉</Text>
          {unreadCount > 0 && <View style={s.navUnreadDot} />}
        </View>
        <Text style={[s.navLabel, isActive('Notifications') && s.navLabelActive]}>Alerts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.navItem} onPress={() => go('Profile')} accessibilityRole="button">
        <View style={[s.navIconWrap, isActive('Profile') && s.navIconWrapActive]}>
          <Text style={[s.navIcon, isActive('Profile') && s.navIconActive]}>○</Text>
        </View>
        <Text style={[s.navLabel, isActive('Profile') && s.navLabelActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  )
}

function AdminMobileNotice({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={s.adminScreen}>
      <View style={s.adminCard}>
        <View style={s.adminIcon}><Text style={s.adminIconText}>↗</Text></View>
        <Text style={s.adminEyebrow}>DFY ADMIN</Text>
        <Text style={s.adminTitle}>Admin lives on the web.</Text>
        <Text style={s.adminBody}>
          The DFY mobile app is built for task creators and runners. Administrator tools are not available here.
        </Text>
        <TouchableOpacity style={s.signOutButton} onPress={onSignOut} accessibilityRole="button">
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const orangeHeader = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: '#fff' as const,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 },
  headerBackTitle: '',
}

export default function AppNavigator() {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth()
  const navRef = useNavigationContainerRef()
  const [currentRoute, setCurrentRoute] = React.useState('Dashboard')

  if (loading) {
    return <View style={s.loadingScreen}><View style={s.loadingMark}><BrandMark /></View></View>
  }

  const signedIn = isAuthenticated()
  // Admin roles are intentionally blocked from the consumer mobile workspace.
  const adminBlocked = signedIn && isAdmin()

  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const route = navRef.current?.getCurrentRoute()?.name
        if (route) setCurrentRoute(route)
      }}
    >
      <View style={s.appRoot}>
        {signedIn && !adminBlocked && <TopNavbar navRef={navRef} />}
        <View style={s.screenArea}>
          {adminBlocked ? (
            <AdminMobileNotice onSignOut={() => { void logout() }} />
          ) : (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!signedIn ? (
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
                    options={{ headerShown: true, title: 'Task chat', ...orangeHeader }}
                  />
                </>
              )}
            </Stack.Navigator>
          )}
        </View>
        {signedIn && !adminBlocked && <BottomNav currentRoute={currentRoute} navRef={navRef} />}
      </View>
    </NavigationContainer>
  )
}

const s = StyleSheet.create({
  appRoot: { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  loadingMark: { width: 60, height: 60, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOW.primary },
  navbar: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight, zIndex: 100 },
  navbarInner: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: COLORS.white, fontSize: 13, fontWeight: '900', letterSpacing: -0.4 },
  brandName: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  brandDot: { color: COLORS.primary },
  bellBtn: { position: 'relative', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.background },
  bellIcon: { color: COLORS.textPrimary, fontSize: 23, transform: [{ rotate: '15deg' }] },
  bellBadge: { position: 'absolute', top: 1, right: 1, minWidth: 17, height: 17, backgroundColor: COLORS.danger, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  screenArea: { flex: 1 },
  bottomNav: { flexDirection: 'row', backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingHorizontal: 5, paddingTop: 8, minHeight: 68, alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 48 },
  navIconWrap: { width: 44, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  navIconWrapActive: { backgroundColor: COLORS.primaryLight },
  navIcon: { color: COLORS.textMuted, fontSize: 23, fontWeight: '600' },
  navIconActive: { color: COLORS.primaryDark },
  navLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  navLabelActive: { color: COLORS.primaryDark },
  navLabelPost: { marginTop: -1 },
  navUnreadDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, right: 7, top: 1, backgroundColor: COLORS.danger, borderWidth: 1, borderColor: COLORS.surface },
  fab: { width: 44, height: 44, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: -21, borderWidth: 3, borderColor: COLORS.surface, ...SHADOW.primary },
  fabRunner: { backgroundColor: COLORS.accent, shadowColor: COLORS.accent },
  fabActive: { transform: [{ scale: 1.06 }] },
  fabIcon: { fontSize: 23, lineHeight: 26, color: '#fff', fontWeight: '800' },
  adminScreen: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  adminCard: { width: '100%', maxWidth: 420, backgroundColor: COLORS.surface, borderRadius: 26, borderWidth: 1, borderColor: COLORS.border, padding: 25, alignItems: 'center', ...SHADOW.md },
  adminIcon: { width: 60, height: 60, borderRadius: 21, backgroundColor: COLORS.backgroundDark, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  adminIconText: { color: COLORS.primaryDark, fontSize: 28, fontWeight: '800' },
  adminEyebrow: { color: COLORS.primaryDark, fontSize: 10, letterSpacing: 2, fontWeight: '900', marginBottom: 8 },
  adminTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  adminBody: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  signOutButton: { marginTop: 24, minHeight: 48, paddingHorizontal: 22, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  signOutText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
})
