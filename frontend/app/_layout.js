// REVEAL V1 - Root Layout with True Full-Screen Modals
// 
// ARCHITECTURE:
// ┌─────────────────────────────────────────┐
// │           STACK (Root)                  │
// │  ┌─────────────────────────────────┐    │
// │  │      TABS (Main App)            │    │
// │  │  ┌───────┬───────┬───────┐      │    │
// │  │  │ Today │Closet │Profile│      │    │
// │  │  └───────┴───────┴───────┘      │    │
// │  └─────────────────────────────────┘    │
// │                                         │
// │  [Clean-Out Mode - True Full Screen]    │
// └─────────────────────────────────────────┘

import React, { useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { AddiletsProvider } from '../contexts/AddiletsContext';
import HelpMeDecideModal from '../components/HelpMeDecideModal';
import { initializeFirebase } from '../services/firebase';

// ============================================
// HELP ME DECIDE CONTEXT
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
// ROOT LAYOUT - Stack Navigator
// ============================================
export default function RootLayout() {
  const helpMeDecideRef = useRef(null);
  
  useEffect(() => {
    initializeFirebase();
  }, []);

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
            
            <Stack screenOptions={{ headerShown: false }}>
              {/* Main tabs - this will be the (tabs) folder */}
              <Stack.Screen name="(tabs)" />
              
              {/* TRUE Full-screen modals - NO tab bar */}
              <Stack.Screen 
                name="cleanout" 
                options={{ 
                  presentation: 'fullScreenModal',
                  animation: 'slide_from_bottom',
                }} 
              />
              
              {/* Regular modals */}
              <Stack.Screen 
                name="sellstack" 
                options={{ 
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }} 
              />
            </Stack>
            
            {/* DIAGNOSTIC: HelpMeDecide BottomSheet REMOVED from render tree */}
            {/* <HelpMeDecideModal ref={helpMeDecideRef} /> */}
            
          </HelpMeDecideContext.Provider>
        </GestureHandlerRootView>
      </AddiletsProvider>
    </FavoritesProvider>
  );
}
