/**
 * Analytics Service
 * Tracks user events for monetization insights
 */

import { API_BASE_URL } from '../config';
import * as Device from 'expo-device';

// Generate a simple session ID (persists during app session)
let sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Track analytics event
 * @param {string} eventType - product_click, outfit_view, beauty_view, category_view
 * @param {object} data - Event data
 */
export const trackEvent = async (eventType, data = {}) => {
  try {
    const event = {
      event_type: eventType,
      session_id: sessionId,
      referral_source: data.referral_source || 'app',
      ...data
    };

    const response = await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Analytics tracked: ${eventType}`);
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.log('Analytics tracking error:', error);
  }
};

/**
 * Track product click
 */
export const trackProductClick = (product, itemContext = {}) => {
  trackEvent('product_click', {
    product_name: product.name,
    product_price: product.price,
    product_affiliate_url: product.affiliate_url || '',
    item_id: itemContext.item_id,
    item_title: itemContext.item_title,
    category: itemContext.category,
  });
};

/**
 * Track outfit view
 */
export const trackOutfitView = (outfit) => {
  trackEvent('outfit_view', {
    item_id: outfit.id?.toString(),
    item_title: outfit.title,
    category: outfit.category,
  });
};

/**
 * Track beauty look view
 */
export const trackBeautyView = (beautyLook) => {
  trackEvent('beauty_view', {
    item_id: beautyLook.id?.toString(),
    item_title: beautyLook.title,
    category: beautyLook.category,
  });
};

/**
 * Track category view
 */
export const trackCategoryView = (category, type = 'outfit') => {
  trackEvent('category_view', {
    category: category,
    item_title: `${type}_category_${category}`,
  });
};

/**
 * Get analytics dashboard data
 */
export const getAnalyticsDashboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};
