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
 * Standardize item for consistent usage
 * Ensures id and image fields always exist
 */
export const standardizeItem = (item) => {
  if (!item) return null;
  
  return {
    ...item,
    id: getItemId(item),
    image: getImageUrl(item),
  };
};
