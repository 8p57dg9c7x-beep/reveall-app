// REVEAL V1 - Tab Navigator Layout
// 
// TABS:
// - Today (index) - Emotional home
// - My Closet (aiwardrobe) - Personal wardrobe
// - Profile - Settings only

import React, { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.tabBarBorder,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
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
