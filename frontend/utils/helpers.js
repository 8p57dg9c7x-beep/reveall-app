/**
 * Utility functions for the app
 */

/**
 * Get standardized ID from item
 * Handles both _id and id fields from MongoDB/API
 */
export const getItemId = (item) => {
  if (!item) return null;
  return item.id || item._id?.toString() || item._id || null;
};

/**
 * Get image URL from item
 * Handles multiple possible image field names
 */
export const getImageUrl = (item) => {
  if (!item) return null;
  return item.image_url || item.image || item.img || item.imageUrl || null;
};

/**
 * Normalize item to standard card format
 * ALWAYS use this before setting state or passing to components!
 */
export const asCardItem = (item) => {
  if (!item) return null;
  
  const normalizedId = getItemId(item);
  const normalizedImage = getImageUrl(item);
  
  return {
    ...item,
    id: normalizedId,
    imageToUse: normalizedImage,
    // Keep original fields for backwards compatibility
    image: normalizedImage,
    image_url: normalizedImage,
  };
};
