import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.tabBarBackground,
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingBottom: 30,
            paddingTop: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="compass" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="watchlist"
          options={{
            title: 'Watchlist',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bookmark" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="magnify" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="style"
          options={{
            title: 'Style',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="hanger" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="comingsoon"
          options={{
            title: 'Coming Soon',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-clock" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="result"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="outfitdetail"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="trendingsongs"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="index_old_backup"
          options={{
            href: null, // Hide from tabs
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
