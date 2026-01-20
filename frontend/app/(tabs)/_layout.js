// REVEAL V1 - Tab Navigator Layout
// 
// DIAGNOSTIC TEST: Rendering only Slot to isolate scroll issues
// If scrolling works with just Slot, the issue is in Tabs component

import React from 'react';
import { Slot } from 'expo-router';

export default function TabsLayout() {
  // Minimal layout - just render the child screen
  return <Slot />;
}
