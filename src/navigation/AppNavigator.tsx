import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { COLORS, RADIUS, SHADOW } from '../config/theme'
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
    <View style={[styles.navbar, { paddingTop: insets.top }]}>
      <View style={styles.navbarInner}>
        <View style={styles.brandGroup}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>D</Text>
            <View style={styles.brandMarkDot} />
          </View>
          <View>
            <Text style={styles.brandName}>DoForYou</Text>
            <Text style={styles.brandCaption}>EVERYDAY HELP, MADE EASIER</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => navRef.current?.navigate('Notifications' as never)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Text style={styles.bellIcon}>♧</Text>
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

function BottomNav({ currentRoute, navRef }: { currentRoute: string; navRef: any }) {
  const { isAuthenticated, canPostErrands } = useAuth()
  const insets = useSafeAreaInsets()

  if (!isAuthenticated() || HIDE_BOTTOM_NAV.includes(currentRoute)) return null

  const go = (route: string) => navRef.current?.navigate(route as never)
  const isActive = (route: string) => currentRoute === route
  const canPost = canPostErrands()

  const item = (
    route: string,
    icon: string,
    label: string,
  ) => (
    <TouchableOpacity
      key={route}
      style={styles.navItem}
      onPress={() => go(route)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive(route) }}
    >
      <View style={[styles.navIconWrap, isActive(route) && styles.navIconWrapActive]}>
        <Text style={[styles.navIcon, isActive(route) && styles.navIconActive]}>{icon}</Text>
      </View>
      <Text style={[styles.navLabel, isActive(route) && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {item('Dashboard', '⌂', 'Home')}
      {item('BrowseErrands', '⌕', 'Browse')}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => go(canPost ? 'PostErrand' : 'MyActiveTasks')}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={canPost ? 'Post a task' : 'My active tasks'}
      >
        <View style={[styles.centerAction, !canPost && styles.centerActionRunner]}>
          <Text style={styles.centerActionIcon}>{canPost ? '+' : '↗'}</Text>
        </View>
        <Text style={[styles.navLabel, (isActive('PostErrand') || isActive('MyActiveTasks')) && styles.navLabelActive]}>
          {canPost ? 'Post task' : 'My tasks'}
        </Text>
      </TouchableOpacity>
      {item('Notifications', '◉', 'Alerts')}
      {item('Profile', '○', 'Profile')}
    </View>
  )
}

const orangeHeader = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: { fontWeight: '800' as const, fontSize: 17 },
  headerBackTitle: '',
}

function AdminMobileNotice({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={styles.adminNoticePage}>
      <View style={styles.adminNoticeMark}><Text style={styles.adminNoticeMarkText}>D</Text></View>
      <Text style={styles.adminNoticeEyebrow}>DOFORYOU WORKSPACE</Text>
      <Text style={styles.adminNoticeTitle}>Admin tools live on the web.</Text>
      <Text style={styles.adminNoticeText}>
        DFY Mobile is built for task creators and runners. For account administration, moderation and platform operations, use the web admin console.
      </Text>
      <Button title="Sign out of mobile" onPress={onSignOut} fullWidth size="lg" />
    </View>
  )
}

export default function AppNavigator() {
  const { isAuthenticated, isAdmin, logout, loading } = useAuth()
  const navRef = useNavigationContainerRef()
  const [currentRoute, setCurrentRoute] = React.useState('Dashboard')

  if (loading) return null

  // Defensive UI guard for old/stale sessions: an admin never enters customer routes.
  if (isAuthenticated() && isAdmin()) {
    return <AdminMobileNotice onSignOut={() => { void logout() }} />
  }

  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const route = navRef.current?.getCurrentRoute()?.name
        if (route) setCurrentRoute(route)
      }}
    >
      <View style={styles.appShell}>
        {isAuthenticated() && <TopNavbar navRef={navRef} />}
        <View style={styles.screenBody}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated() ? (
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
        </View>
        <BottomNav currentRoute={currentRoute} navRef={navRef} />
      </View>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  appShell: { flex: 1, backgroundColor: COLORS.background },
  screenBody: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10,
  },
  navbarInner: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', ...SHADOW.primary,
  },
  brandMarkText: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginTop: -2 },
  brandMarkDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFE4B8', position: 'absolute', right: 7, bottom: 7 },
  brandName: { color: COLORS.textPrimary, fontSize: 17, lineHeight: 21, fontWeight: '900', letterSpacing: -0.4 },
  brandCaption: { color: COLORS.textMuted, fontSize: 7, fontWeight: '800', letterSpacing: 0.7, marginTop: 2 },
  bellButton: {
    position: 'relative', width: 42, height: 42, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  bellIcon: { color: COLORS.textPrimary, fontSize: 23, fontWeight: '700' },
  bellBadge: {
    position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
    borderWidth: 2, borderColor: COLORS.background,
  },
  bellBadgeText: { color: COLORS.white, fontSize: 8, fontWeight: '900' },
  bottomNav: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 8, paddingHorizontal: 5, minHeight: 70,
    alignItems: 'center', justifyContent: 'space-around',
    shadowColor: '#57371B', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.035, shadowRadius: 12, elevation: 8,
  },
  navItem: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navIconWrap: { minWidth: 42, height: 29, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  navIconWrapActive: { backgroundColor: COLORS.primaryLight },
  navIcon: { color: COLORS.textMuted, fontSize: 23, lineHeight: 27, fontWeight: '700' },
  navIconActive: { color: COLORS.primaryDark },
  navLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700' },
  navLabelActive: { color: COLORS.primaryDark },
  centerAction: {
    width: 38, height: 31, borderRadius: 12, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: -2, ...SHADOW.primary,
  },
  centerActionRunner: { backgroundColor: COLORS.textPrimary, shadowOpacity: 0.08 },
  centerActionIcon: { color: COLORS.white, fontSize: 22, fontWeight: '800', lineHeight: 25 },
  adminNoticePage: {
    flex: 1, backgroundColor: COLORS.background, justifyContent: 'center',
    padding: 28, alignItems: 'center',
  },
  adminNoticeMark: {
    width: 62, height: 62, borderRadius: 22, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 22, ...SHADOW.primary,
  },
  adminNoticeMarkText: { color: COLORS.white, fontSize: 34, fontWeight: '900' },
  adminNoticeEyebrow: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  adminNoticeTitle: { color: COLORS.textPrimary, fontSize: 28, lineHeight: 34, textAlign: 'center', fontWeight: '900', letterSpacing: -0.8, marginBottom: 12 },
  adminNoticeText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 24, maxWidth: 330 },
})
