import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { AddiletsProvider } from '../contexts/AddiletsContext';

// Bundle Version: 6.1.0 - BRICK 6 Tab Bar Polish Fix
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
            height: 95,
            paddingBottom: 34,
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
            marginTop: 2,
            marginBottom: 0,
          },
          tabBarIconStyle: {
            marginTop: 4,
            marginBottom: 0,
          },
        }}
      >
        {/* ===== NEW REVEAL TABS (5) - BRICK 5 STRUCTURE ===== */}
        
        {/* TAB 1: HOME - Personalized Dashboard */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 2: DISCOVER - Explore Everything */}
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="compass" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 3: STYLE LAB - All AI Tools */}
        <Tabs.Screen
          name="stylelab"
          options={{
            title: 'Style Lab',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="flask" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 4: FITNESS - Coming Soon */}
        <Tabs.Screen
          name="fitness"
          options={{
            title: 'Fitness',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
            ),
          }}
        />
        
        {/* TAB 5: PROFILE - Account & Settings */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" size={24} color={color} />
            ),
          }}
        />

        {/* ===== HIDDEN STACK SCREENS - Style Lab Features ===== */}
        <Tabs.Screen name="aistylist" options={{ href: null }} />
        <Tabs.Screen name="aiwardrobe" options={{ href: null }} />
        <Tabs.Screen name="bodyscanner" options={{ href: null }} />
        <Tabs.Screen name="addilets" options={{ href: null }} />
        <Tabs.Screen name="style" options={{ href: null }} />

        {/* ===== HIDDEN STACK SCREENS - Discover Features ===== */}
        <Tabs.Screen name="beauty" options={{ href: null }} />
        <Tabs.Screen name="musicscan" options={{ href: null }} />
        <Tabs.Screen name="trendingsongs" options={{ href: null }} />

        {/* ===== HIDDEN STACK SCREENS - Detail Pages ===== */}
        <Tabs.Screen name="result" options={{ href: null }} />
        <Tabs.Screen name="outfitdetail" options={{ href: null }} />
        <Tabs.Screen name="beautydetail" options={{ href: null }} />

        {/* ===== HIDDEN STACK SCREENS - Other ===== */}
        <Tabs.Screen name="favorites" options={{ href: null }} />
        <Tabs.Screen name="watchlist" options={{ href: null }} />
        <Tabs.Screen name="analytics" options={{ href: null }} />
        <Tabs.Screen name="comingsoon" options={{ href: null }} />
        <Tabs.Screen name="saved-outfits" options={{ href: null }} />
        <Tabs.Screen name="saved-beauty" options={{ href: null }} />
        <Tabs.Screen name="universal-search" options={{ href: null }} />
      </Tabs>
      </GestureHandlerRootView>
      </AddiletsProvider>
    </FavoritesProvider>
  );
}
