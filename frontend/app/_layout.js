import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { AddiletsProvider } from '../contexts/AddiletsContext';
import { initializeFirebase } from '../services/firebase';
import { FEATURE_FLAGS } from '../config/featureFlags';

// Bundle Version: 1.0.0 - v1 Launch (Hyper-focused: What to Wear Today)
export default function RootLayout() {
  // Initialize Firebase on app launch
  useEffect(() => {
    initializeFirebase();
  }, []);

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
            height: 100,
            paddingBottom: 30,
            paddingTop: 12,
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
        {/* ===== v1 TABS (3 Active - Hyper-focused) ===== */}
        
        {/* TAB 1: HOME - Weather Outfits + Daily Recommendations */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 2: DISCOVER - HIDDEN FOR v1 */}
        <Tabs.Screen
          name="discover"
          options={{
            href: null, // Hidden for v1
            title: 'Discover',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="compass" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 2 (actual): STYLE LAB - AI Stylist + Body Scanner + Closet */}
        <Tabs.Screen
          name="stylelab"
          options={{
            title: 'Style Lab',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="flask" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB: FITNESS - HIDDEN FOR v1 */}
        <Tabs.Screen
          name="fitness"
          options={{
            href: null, // Hidden for v1
            title: 'Fitness',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 3: PROFILE - Saved Items & Settings */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={24} color={color} />
            ),
          }}
        />

        {/* ===== v1 ACTIVE STACK SCREENS ===== */}
        <Tabs.Screen name="aistylist" options={{ href: null }} />
        <Tabs.Screen name="aiwardrobe" options={{ href: null }} />
        <Tabs.Screen name="bodyscanner" options={{ href: null }} />
        <Tabs.Screen name="saved-outfits" options={{ href: null }} />
        <Tabs.Screen name="outfitdetail" options={{ href: null }} />
        
        {/* ===== HIDDEN FOR v1 ===== */}
        <Tabs.Screen name="addilets" options={{ href: null }} />
        <Tabs.Screen name="style" options={{ href: null }} />
        <Tabs.Screen name="beauty" options={{ href: null }} />
        <Tabs.Screen name="beautydetail" options={{ href: null }} />
        <Tabs.Screen name="saved-beauty" options={{ href: null }} />
        <Tabs.Screen name="musicscan" options={{ href: null }} />
        <Tabs.Screen name="trendingsongs" options={{ href: null }} />
        <Tabs.Screen name="comingsoon" options={{ href: null }} />

        {/* ===== OTHER SCREENS ===== */}
        <Tabs.Screen name="result" options={{ href: null }} />
        <Tabs.Screen name="favorites" options={{ href: null }} />
        <Tabs.Screen name="watchlist" options={{ href: null }} />
        <Tabs.Screen name="analytics" options={{ href: null }} />
        <Tabs.Screen name="universal-search" options={{ href: null }} />
      </Tabs>
      </GestureHandlerRootView>
      </AddiletsProvider>
    </FavoritesProvider>
  );
}
