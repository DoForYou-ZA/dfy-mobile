import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { NavigationContainer, NavigationContainerRef, useNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { COLORS, RADIUS } from '../config/theme'

import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import DashboardScreen from '../screens/DashboardScreen'
import BrowseErrandsScreen from '../screens/tasks/BrowseErrandsScreen'
import PostErrandScreen from '../screens/tasks/PostErrandScreen'
import MyPostedTasksScreen from '../screens/tasks/MyPostedTasksScreen'
import MyActiveTasksScreen from '../screens/tasks/MyActiveTasksScreen'
import TaskChatScreen from '../screens/tasks/TaskChatScreen'
import WalletScreen from '../screens/user/WalletScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import NotificationsScreen from '../screens/NotificationsScreen'

const Stack = createNativeStackNavigator()

const MAIN_ROUTES = ['Dashboard','BrowseErrands','PostErrand','MyPostedTasks','MyActiveTasks','Wallet','Profile','Notifications']
const HIDE_BOTTOM_NAV = ['TaskChat', 'Login', 'Register']

function TopNavbar({ navRef }: { navRef: any }) {
  const { unreadCount } = useNotifications()
  const insets = useSafeAreaInsets()
  return (
    <View style={[s.navbar, { paddingTop: insets.top }]}>
      <View style={s.navbarInner}>
        <Text style={s.brand}>
          <Text style={s.brandName}>DoForYou</Text>
          <Text style={s.brandDot}>.</Text>
        </Text>
        <TouchableOpacity
          style={s.bellBtn}
          onPress={() => navRef.current?.navigate('Notifications' as never)}
        >
          <Text style={s.bellIcon}>🔔</Text>
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
  const userType = user?.userType || ''

  if (!isAuthenticated() || HIDE_BOTTOM_NAV.includes(currentRoute)) return null

  const go = (route: string) => navRef.current?.navigate(route as never)
  const isActive = (r: string) => currentRoute === r
  const canPost = canPostErrands()

  return (
    <View style={[s.bottomNav, { paddingBottom: insets.bottom || 8 }]}>
      {/* Home */}
      <TouchableOpacity style={s.navItem} onPress={() => go('Dashboard')}>
        {isActive('Dashboard') && <View style={s.activeBar} />}
        <Text style={[s.navIcon, isActive('Dashboard') && s.navIconActive]}>🏠</Text>
        <Text style={[s.navLabel, isActive('Dashboard') && s.navLabelActive]}>Home</Text>
      </TouchableOpacity>

      {/* Browse */}
      <TouchableOpacity style={s.navItem} onPress={() => go('BrowseErrands')}>
        {isActive('BrowseErrands') && <View style={s.activeBar} />}
        <Text style={[s.navIcon, isActive('BrowseErrands') && s.navIconActive]}>🔍</Text>
        <Text style={[s.navLabel, isActive('BrowseErrands') && s.navLabelActive]}>Browse</Text>
      </TouchableOpacity>

      {/* FAB — Post (creator) or My Tasks (runner) */}
      {canPost ? (
        <TouchableOpacity style={s.navItem} onPress={() => go('PostErrand')}>
          <View style={[s.fab, isActive('PostErrand') && s.fabActive]}>
            <Text style={s.fabIcon}>+</Text>
          </View>
          <Text style={[s.navLabel, { marginTop: 2 }, isActive('PostErrand') && s.navLabelActive]}>Post</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.navItem} onPress={() => go('MyActiveTasks')}>
          <View style={[s.fab, s.fabRunner, isActive('MyActiveTasks') && s.fabActive]}>
            <Text style={s.fabIcon}>☰</Text>
          </View>
          <Text style={[s.navLabel, { marginTop: 2 }, isActive('MyActiveTasks') && s.navLabelActive]}>My Tasks</Text>
        </TouchableOpacity>
      )}

      {/* Wallet */}
      <TouchableOpacity style={s.navItem} onPress={() => go('Wallet')}>
        {isActive('Wallet') && <View style={s.activeBar} />}
        <Text style={[s.navIcon, isActive('Wallet') && s.navIconActive]}>💰</Text>
        <Text style={[s.navLabel, isActive('Wallet') && s.navLabelActive]}>Wallet</Text>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity style={s.navItem} onPress={() => go('Profile')}>
        {isActive('Profile') && <View style={s.activeBar} />}
        <Text style={[s.navIcon, isActive('Profile') && s.navIconActive]}>👤</Text>
        <Text style={[s.navLabel, isActive('Profile') && s.navLabelActive]}>Profile</Text>
      </TouchableOpacity>
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
  const { isAuthenticated, loading } = useAuth()
  const navRef = useNavigationContainerRef()
  const [currentRoute, setCurrentRoute] = React.useState('Dashboard')

  if (loading) return null

  return (
    <NavigationContainer
      ref={navRef}
      onStateChange={() => {
        const route = navRef.current?.getCurrentRoute()?.name
        if (route) setCurrentRoute(route)
      }}
    >
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        {isAuthenticated() && <TopNavbar navRef={navRef} />}

        <View style={{ flex: 1 }}>
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
                <Stack.Screen name="Wallet" component={WalletScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen
                  name="TaskChat"
                  component={TaskChatScreen}
                  options={{ headerShown: true, title: 'Task Chat', ...orangeHeader }}
                />
              </>
            )}
          </Stack.Navigator>
        </View>

        {isAuthenticated() && (
          <BottomNav currentRoute={currentRoute} navRef={navRef} />
        )}
      </View>
    </NavigationContainer>
  )
}

const s = StyleSheet.create({
  // .navbar — white top bar
  navbar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 100,
  },
  navbarInner: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brand: {},
  brandName: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  brandDot: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  bellBtn: {
    position: 'relative', width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center', borderRadius: 19,
  },
  bellIcon: { fontSize: 20 },
  bellBadge: {
    position: 'absolute', top: 2, right: 2,
    minWidth: 16, height: 16,
    backgroundColor: COLORS.danger, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // .bottom-nav — white, border-top, 64px, shadow-up
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    height: 64,
    paddingHorizontal: 4,
    alignItems: 'stretch',
  },

  // .bnav-item
  navItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 3, position: 'relative', minHeight: 44,
  },

  // .bnav-item.active::after — orange top bar
  activeBar: {
    position: 'absolute', top: 0, left: '25%', right: '25%',
    height: 2, backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },

  navIcon: { fontSize: 20, color: COLORS.textSecondary },
  navIconActive: { color: COLORS.primary },
  navLabel: { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },
  navLabelActive: { color: COLORS.primary },

  // .bnav-post-btn — orange FAB
  fab: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -18,
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  fabRunner: { backgroundColor: '#1F2937' },
  fabActive: { transform: [{ scale: 1.08 }] },
  fabIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
})
