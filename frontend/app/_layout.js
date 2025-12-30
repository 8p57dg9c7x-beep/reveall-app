// REVEAL V1 - Clean Navigation Architecture
// 
// RULES (Non-negotiable):
// 1. Tab bar ALWAYS visible on Today / My Closet / Profile
// 2. Switching tabs ALWAYS starts at top
// 3. Today = emotional home (one tap from anywhere)
// 4. "Help me decide" = modal (not a screen)
// 5. Profile = settings only. Sub-pages slide up as modals.
// 6. One primary CTA per screen
//
// STRUCTURE:
// ┌─────────────────────────────────────────┐
// │          TAB BAR (Always Visible)       │
// ├─────────────┬─────────────┬─────────────┤
// │    TODAY    │  MY CLOSET  │   PROFILE   │
// └─────────────┴─────────────┴─────────────┘
//
// MODALS (overlay, don't hide tabs):
// - Help Me Decide (bottom sheet)
// - Style Preferences (slide-up modal)
// - Body Scanner (slide-up modal)
// - Saved Outfits (slide-up modal)

import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { AddiletsProvider } from '../contexts/AddiletsContext';
import HelpMeDecideModal from '../components/HelpMeDecideModal';
import { initializeFirebase } from '../services/firebase';

// ============================================
// HELP ME DECIDE CONTEXT (Bottom Sheet Modal)
// ============================================
const HelpMeDecideContext = createContext(null);

export function useHelpMeDecide() {
  const context = useContext(HelpMeDecideContext);
  if (!context) {
    throw new Error('useHelpMeDecide must be used within layout');
  }
  return context;
}

// ============================================
// ROOT LAYOUT
// ============================================
export default function RootLayout() {
  const helpMeDecideRef = useRef(null);
  
  // Initialize Firebase on app launch
  useEffect(() => {
    initializeFirebase();
  }, []);

  // Help Me Decide modal controls
  const openHelpMeDecide = useCallback(() => {
    helpMeDecideRef.current?.open();
  }, []);
  
  const closeHelpMeDecide = useCallback(() => {
    helpMeDecideRef.current?.close();
  }, []);

  return (
    <FavoritesProvider>
      <AddiletsProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <HelpMeDecideContext.Provider value={{ openHelpMeDecide, closeHelpMeDecide }}>
            
            {/* ===== TAB NAVIGATOR ===== */}
            <Tabs
              screenOptions={{
                headerShown: false,
                animation: 'fade',
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
              {/* ===== TAB 1: TODAY ===== */}
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Today',
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="white-balance-sunny" size={24} color={color} />
                  ),
                }}
              />
              
              {/* ===== TAB 2: MY CLOSET ===== */}
              <Tabs.Screen
                name="aiwardrobe"
                options={{
                  title: 'My Closet',
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="wardrobe" size={24} color={color} />
                  ),
                }}
              />
              
              {/* ===== TAB 3: PROFILE ===== */}
              <Tabs.Screen
                name="profile"
                options={{
                  title: 'Profile',
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="account" size={24} color={color} />
                  ),
                }}
              />

              {/* ===== MODAL SCREENS (slide up, tab bar visible behind) ===== */}
              <Tabs.Screen 
                name="style-preferences" 
                options={{ 
                  href: null,
                  presentation: 'modal',
                }} 
              />
              <Tabs.Screen 
                name="bodyscanner" 
                options={{ 
                  href: null,
                  presentation: 'modal',
                }} 
              />
              <Tabs.Screen 
                name="saved-outfits" 
                options={{ 
                  href: null,
                  presentation: 'modal',
                }} 
              />
              <Tabs.Screen 
                name="outfitdetail" 
                options={{ 
                  href: null,
                  presentation: 'modal',
                }} 
              />
              
              {/* ===== HIDDEN SCREENS (not accessible in v1) ===== */}
              <Tabs.Screen name="aistylist" options={{ href: null }} />
              <Tabs.Screen name="stylelab" options={{ href: null }} />
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
              <Tabs.Screen name="stylepreferences" options={{ href: null }} />
            </Tabs>
            
            {/* ===== HELP ME DECIDE BOTTOM SHEET ===== */}
            <HelpMeDecideModal ref={helpMeDecideRef} />
            
          </HelpMeDecideContext.Provider>
        </GestureHandlerRootView>
      </AddiletsProvider>
    </FavoritesProvider>
  );
}
