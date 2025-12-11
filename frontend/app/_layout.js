import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { AddiletsProvider } from '../contexts/AddiletsContext';

// Bundle Version: 4.0.0 - REVEAL Rebrand + New Navigation
export default function RootLayout() {
  return (
    <FavoritesProvider>
      <AddiletsProvider>
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
            fontSize: 10,
            fontWeight: '600',
            marginTop: -4,
          },
        }}
      >
        {/* ===== NEW REVEAL TABS (5) ===== */}
        
        {/* 1. Home - Personalized feed, Addilets, Recommendations */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={26} color={color} />
            ),
          }}
        />
        
        {/* 2. Discover - Movies, Music, MusicScan */}
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="compass" size={26} color={color} />
            ),
          }}
        />
        
        {/* 3. Style Lab - All AI Style Features */}
        <Tabs.Screen
          name="stylelab"
          options={{
            title: 'Style Lab',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="flask" size={26} color={color} />
            ),
          }}
        />
        
        {/* 4. Beauty Hub - Makeup, Dupes, Celebrity Looks */}
        <Tabs.Screen
          name="beauty"
          options={{
            title: 'Beauty',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="lipstick" size={26} color={color} />
            ),
          }}
        />
        
        {/* 5. Profile - Favorites, Wardrobe, Settings */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={26} color={color} />
            ),
          }}
        />

        {/* ===== HIDDEN STACK SCREENS - Style Lab Features ===== */}
        <Tabs.Screen name="aistylist" options={{ href: null }} />
        <Tabs.Screen name="aiwardrobe" options={{ href: null }} />
        <Tabs.Screen name="bodyscanner" options={{ href: null }} />
        <Tabs.Screen name="addilets" options={{ href: null }} />
        <Tabs.Screen name="style" options={{ href: null }} />

        {/* ===== HIDDEN STACK SCREENS - Detail Pages ===== */}
        <Tabs.Screen name="result" options={{ href: null }} />
        <Tabs.Screen name="outfitdetail" options={{ href: null }} />
        <Tabs.Screen name="beautydetail" options={{ href: null }} />

        {/* ===== HIDDEN STACK SCREENS - Other ===== */}
        <Tabs.Screen name="favorites" options={{ href: null }} />
        <Tabs.Screen name="watchlist" options={{ href: null }} />
        <Tabs.Screen name="analytics" options={{ href: null }} />
        <Tabs.Screen name="comingsoon" options={{ href: null }} />
        <Tabs.Screen name="trendingsongs" options={{ href: null }} />
        <Tabs.Screen name="saved-outfits" options={{ href: null }} />
        <Tabs.Screen name="saved-beauty" options={{ href: null }} />
        <Tabs.Screen name="universal-search" options={{ href: null }} />
      </Tabs>
      </GestureHandlerRootView>
      </AddiletsProvider>
    </FavoritesProvider>
  );
}
