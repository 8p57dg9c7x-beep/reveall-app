import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../contexts/FavoritesContext';

// Bundle Version: 2.2.0 - Favorites system
export default function RootLayout() {
  return (
    <FavoritesProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: 'rgba(177, 76, 255, 0.1)',
            elevation: 0,
            height: 85,
            paddingBottom: 30,
            paddingTop: 8,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          },
          tabBarActiveTintColor: COLORS.tabBarActive,
          tabBarInactiveTintColor: COLORS.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -4,
            fontFamily: 'Inter',
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
          name="beauty"
          options={{
            title: 'Beauty',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="lipstick" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="heart" size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            href: null, // Hide from tabs - accessed via settings/admin
          }}
        />
        <Tabs.Screen
          name="comingsoon"
          options={{
            href: null, // Hide from tabs
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
          name="beautydetail"
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
          name="saved-outfits"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="saved-beauty"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="universal-search"
          options={{
            href: null, // Hide from tabs - accessed via header buttons
          }}
        />
      </Tabs>
      </GestureHandlerRootView>
    </FavoritesProvider>
  );
}
