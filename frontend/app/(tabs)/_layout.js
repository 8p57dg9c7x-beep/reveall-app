// REVEAL V1 - Tab Navigator Layout
// 
// TABS:
// - Today (index) - Emotional home
// - My Closet (aiwardrobe) - Personal wardrobe
// - Profile - Settings only

import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          // Tab bar styling
          tabBarStyle: {
            backgroundColor: COLORS.tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: COLORS.tabBarBorder,
            height: 60 + insets.bottom,
            paddingTop: 8,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
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
          tabBarHideOnKeyboard: true,
          // Ensure content doesn't overlap with tab bar
          sceneStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Tabs.Screen 
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="weather-sunny" size={24} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen 
          name="aiwardrobe"
          options={{
            title: 'My Closet',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="wardrobe-outline" size={24} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen 
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
