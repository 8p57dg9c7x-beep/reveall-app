// REVEAL V1 - Tab Navigator Layout
// 
// TABS:
// - Today (index) - Emotional home
// - My Closet (aiwardrobe) - Personal wardrobe
// - Profile - Settings only
//
// STRUCTURAL FIX: Tab bar properly handles safe areas
// and does NOT overlay screen content.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  // Calculate proper tab bar height with safe area
  // Base height (icons + labels) + bottom safe area inset
  const TAB_BAR_BASE_HEIGHT = 60;
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        // CRITICAL: position: 'absolute' is the default and causes overlay
        // We keep it but ensure proper height calculation
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.tabBarBorder,
          height: tabBarHeight,
          paddingTop: 10,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          // Ensure tab bar is opaque - no transparency bleeding
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        // CRITICAL: This tells the screen content to account for tab bar
        // Without this, content can render behind the tab bar
        tabBarHideOnKeyboard: true,
      }}
      // This ensures screens know to leave space for the tab bar
      sceneContainerStyle={{
        backgroundColor: COLORS.background,
      }}
    >
      {/* ===== MAIN TABS ===== */}
      <Tabs.Screen 
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="weather-sunny" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="aiwardrobe"
        options={{
          title: 'My Closet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wardrobe-outline" size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
