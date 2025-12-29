// Help Me Decide Context
// Provides global access to open the "Help Me Decide" bottom sheet modal
// Usage: const { openHelpMeDecide } = useHelpMeDecide();

import React, { createContext, useContext, useRef, useCallback } from 'react';
import HelpMeDecideModal from '../components/HelpMeDecideModal';

const HelpMeDecideContext = createContext(null);

export function HelpMeDecideProvider({ children }) {
  const modalRef = useRef(null);
  
  const openHelpMeDecide = useCallback(() => {
    modalRef.current?.open();
  }, []);
  
  const closeHelpMeDecide = useCallback(() => {
    modalRef.current?.close();
  }, []);
  
  return (
    <HelpMeDecideContext.Provider value={{ openHelpMeDecide, closeHelpMeDecide }}>
      {children}
      <HelpMeDecideModal ref={modalRef} />
    </HelpMeDecideContext.Provider>
  );
}

export function useHelpMeDecide() {
  const context = useContext(HelpMeDecideContext);
  if (!context) {
    throw new Error('useHelpMeDecide must be used within a HelpMeDecideProvider');
  }
  return context;
}

export default HelpMeDecideContext;
