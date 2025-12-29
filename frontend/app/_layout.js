import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { AddiletsProvider } from '../contexts/AddiletsContext';
import { HelpMeDecideProvider } from '../contexts/HelpMeDecideContext';
import { initializeFirebase } from '../services/firebase';

// Bundle Version: 1.0.0 - v1 Launch (Premium Digital Wardrobe)
export default function RootLayout() {
  // Initialize Firebase on app launch
  useEffect(() => {
    initializeFirebase();
  }, []);

  return (
    <FavoritesProvider>
      <AddiletsProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <HelpMeDecideProvider>
        <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'fade', // Subtle fade transition between tabs
          tabBarStyle: {
            backgroundColor: COLORS.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: 'rgba(177, 76, 255, 0.08)',
            elevation: 0,
            height: 100,
            paddingBottom: 30,
            paddingTop: 12,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
          },
          tabBarActiveTintColor: COLORS.tabBarActive,
          tabBarInactiveTintColor: COLORS.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 6,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        {/* ===== v1 TABS: Closet-Centric Navigation ===== */}
        
        {/* TAB 1: TODAY - Calm welcome + wardrobe preview */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="white-balance-sunny" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 2: MY CLOSET - The heart of the app */}
        <Tabs.Screen
          name="aiwardrobe"
          options={{
            title: 'My Closet',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="wardrobe" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 3: PROFILE - Settings & saved items */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={24} color={color} />
            ),
          }}
        />

        {/* ===== STACK SCREENS (accessible via navigation) ===== */}
        <Tabs.Screen name="aistylist" options={{ href: null }} />
        <Tabs.Screen name="bodyscanner" options={{ href: null }} />
        <Tabs.Screen name="saved-outfits" options={{ href: null }} />
        <Tabs.Screen name="outfitdetail" options={{ href: null }} />
        <Tabs.Screen name="stylelab" options={{ href: null }} />
        
        {/* ===== HIDDEN FOR v1 ===== */}
        <Tabs.Screen name="discover" options={{ href: null }} />
        <Tabs.Screen name="fitness" options={{ href: null }} />
        <Tabs.Screen name="addilets" options={{ href: null }} />
        <Tabs.Screen name="style" options={{ href: null }} />
        <Tabs.Screen name="beauty" options={{ href: null }} />
        <Tabs.Screen name="beautydetail" options={{ href: null }} />
        <Tabs.Screen name="saved-beauty" options={{ href: null }} />
        <Tabs.Screen name="musicscan" options={{ href: null }} />
        <Tabs.Screen name="trendingsongs" options={{ href: null }} />
        <Tabs.Screen name="comingsoon" options={{ href: null }} />
        <Tabs.Screen name="result" options={{ href: null }} />
        <Tabs.Screen name="favorites" options={{ href: null }} />
        <Tabs.Screen name="watchlist" options={{ href: null }} />
        <Tabs.Screen name="analytics" options={{ href: null }} />
        <Tabs.Screen name="universal-search" options={{ href: null }} />
      </Tabs>
          </HelpMeDecideProvider>
      </GestureHandlerRootView>
      </AddiletsProvider>
    </FavoritesProvider>
  );
}
