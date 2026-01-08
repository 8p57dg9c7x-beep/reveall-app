// Clean-Out Mode Service
// Manages wardrobe clean-out sessions and sell stack

import AsyncStorage from '@react-native-async-storage/async-storage';

const CLEANOUT_SESSION_KEY = '@reveal_cleanout_session';
const SELL_STACK_KEY = '@reveal_sell_stack';

// Decision types
export const DECISIONS = {
  KEEP: 'keep',
  SELL: 'sell',
  DONATE: 'donate',
};

// ============================================
// SESSION MANAGEMENT
// ============================================

// Start a new clean-out session
export const startCleanOutSession = async () => {
  const session = {
    startedAt: new Date().toISOString(),
    decisions: [],
  };
  await AsyncStorage.setItem(CLEANOUT_SESSION_KEY, JSON.stringify(session));
  return session;
};

// Get current session
export const getCleanOutSession = async () => {
  try {
    const stored = await AsyncStorage.getItem(CLEANOUT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.log('Error getting clean-out session:', error);
    return null;
  }
};

// Record a decision for an item
export const recordDecision = async (itemId, decision, itemData) => {
  try {
    const session = await getCleanOutSession();
    if (!session) return null;

    // Add decision to session
    const newDecision = {
      itemId,
      decision,
      decidedAt: new Date().toISOString(),
    };
    session.decisions.push(newDecision);
    await AsyncStorage.setItem(CLEANOUT_SESSION_KEY, JSON.stringify(session));

    // If marked for sell, add to sell stack
    if (decision === DECISIONS.SELL) {
      await addToSellStack(itemId, itemData);
    }

    return session;
  } catch (error) {
    console.log('Error recording decision:', error);
    return null;
  }
};

// Undo the last decision
export const undoLastDecision = async () => {
  try {
    const session = await getCleanOutSession();
    if (!session || session.decisions.length === 0) return null;

    // Get and remove the last decision
    const lastDecision = session.decisions.pop();
    await AsyncStorage.setItem(CLEANOUT_SESSION_KEY, JSON.stringify(session));

    // If it was a sell decision, remove from sell stack
    if (lastDecision.decision === DECISIONS.SELL) {
      await removeFromSellStack(lastDecision.itemId);
    }

    return { session, undoneDecision: lastDecision };
  } catch (error) {
    console.log('Error undoing decision:', error);
    return null;
  }
};

// End session and get summary
export const endCleanOutSession = async () => {
  try {
    const session = await getCleanOutSession();
    if (!session) return null;

    // Calculate summary
    const summary = {
      totalReviewed: session.decisions.length,
      kept: session.decisions.filter(d => d.decision === DECISIONS.KEEP).length,
      toSell: session.decisions.filter(d => d.decision === DECISIONS.SELL).length,
      toDonate: session.decisions.filter(d => d.decision === DECISIONS.DONATE).length,
      duration: new Date() - new Date(session.startedAt),
    };

    // Clear session
    await AsyncStorage.removeItem(CLEANOUT_SESSION_KEY);

    return summary;
  } catch (error) {
    console.log('Error ending session:', error);
    return null;
  }
};

// Get session stats without ending
export const getSessionStats = async () => {
  const session = await getCleanOutSession();
  if (!session) return { kept: 0, toSell: 0, toDonate: 0, total: 0 };

  return {
    kept: session.decisions.filter(d => d.decision === DECISIONS.KEEP).length,
    toSell: session.decisions.filter(d => d.decision === DECISIONS.SELL).length,
    toDonate: session.decisions.filter(d => d.decision === DECISIONS.DONATE).length,
    total: session.decisions.length,
  };
};

// ============================================
// SELL STACK MANAGEMENT
// ============================================

// Get sell stack
export const getSellStack = async () => {
  try {
    const stored = await AsyncStorage.getItem(SELL_STACK_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.log('Error getting sell stack:', error);
    return [];
  }
};

// Add item to sell stack
export const addToSellStack = async (itemId, itemData) => {
  try {
    const stack = await getSellStack();
    
    // Don't add duplicates
    if (stack.find(item => item.itemId === itemId)) return stack;

    const newItem = {
      itemId,
      addedAt: new Date().toISOString(),
      itemData,
    };
    stack.push(newItem);
    await AsyncStorage.setItem(SELL_STACK_KEY, JSON.stringify(stack));
    return stack;
  } catch (error) {
    console.log('Error adding to sell stack:', error);
    return [];
  }
};

// Remove item from sell stack
export const removeFromSellStack = async (itemId) => {
  try {
    const stack = await getSellStack();
    const updated = stack.filter(item => item.itemId !== itemId);
    await AsyncStorage.setItem(SELL_STACK_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.log('Error removing from sell stack:', error);
    return [];
  }
};

// Clear entire sell stack
export const clearSellStack = async () => {
  try {
    await AsyncStorage.removeItem(SELL_STACK_KEY);
    return [];
  } catch (error) {
    console.log('Error clearing sell stack:', error);
    return [];
  }
};

export default {
  DECISIONS,
  startCleanOutSession,
  getCleanOutSession,
  recordDecision,
  undoLastDecision,
  endCleanOutSession,
  getSessionStats,
  getSellStack,
  addToSellStack,
  removeFromSellStack,
  clearSellStack,
};
