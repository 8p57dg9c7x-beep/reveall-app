/**
 * Reveal AI Backend API Service
 * Central service for all AI features connecting to Node.js backend
 */

import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

/**
 * Upload image and create AI processing job
 * @param {string} imageUri - Image URI from ImagePicker
 * @param {string} type - Job type: 'stylist', 'wardrobe', 'body-scan', 'general'
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} { jobId, status, filename }
 */
export const uploadImage = async (imageUri, type = 'general', metadata = {}) => {
  try {
    const formData = new FormData();
    
    // Get file extension
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('image', {
      uri: imageUri,
      type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      name: `upload_${Date.now()}.${fileType}`,
    });
    formData.append('type', type);
    
    if (Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    console.log(`📤 Uploading image to ${API_URL}/api/uploads/image...`);
    
    const response = await fetch(`${API_URL}/api/uploads/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    console.log(`✅ Upload successful: ${data.jobId}`);
    return data;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images (for body scanner)
 * @param {Array<string>} imageUris - Array of image URIs
 * @param {string} type - Job type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} { jobId, status }
 */
export const uploadMultipleImages = async (imageUris, type = 'body-scan', metadata = {}) => {
  try {
    const formData = new FormData();
    
    imageUris.forEach((uri, index) => {
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      formData.append('images', {
        uri: uri,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        name: `upload_${index}_${Date.now()}.${fileType}`,
      });
    });
    
    formData.append('type', type);
    
    if (Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    console.log(`📤 Uploading ${imageUris.length} images...`);
    
    const response = await fetch(`${API_URL}/api/uploads/images`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    console.log(`✅ Multi-upload successful: ${data.jobId}`);
    return data;
  } catch (error) {
    console.error('❌ Multi-upload error:', error);
    throw error;
  }
};

/**
 * Get job status
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job status and progress
 */
export const getJobStatus = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get job status');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Get job status error:', error);
    throw error;
  }
};

/**
 * Get job result
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job result data
 */
export const getJobResult = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/result`);
    
    if (!response.ok) {
      if (response.status === 202) {
        // Still processing
        return await response.json();
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get job result');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Get job result error:', error);
    throw error;
  }
};

/**
 * Poll for job completion
 * @param {string} jobId - Job ID
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Polling interval in ms
 * @returns {Promise<Object>} Final job result
 */
export const pollJobResult = async (jobId, maxAttempts = 30, interval = 1000) => {
  console.log(`⏳ Polling job ${jobId}...`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getJobStatus(jobId);
      console.log(`📊 Job ${jobId}: ${status.status} (${status.progress}%)`);
      
      if (status.status === 'completed') {
        const result = await getJobResult(jobId);
        console.log(`✅ Job ${jobId} completed!`);
        return result;
      }
      
      if (status.status === 'failed') {
        throw new Error(status.error || 'Job processing failed');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      // Wait and retry on network errors
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error('Job timed out');
};

/**
 * Generate AI Stylist looks
 * @param {string} imageUri - User photo URI
 * @param {Array<string>} stylePreferences - Selected style tags
 * @returns {Promise<Object>} Generated looks with recommendations
 */
export const generateStylistLooks = async (imageUri, stylePreferences = []) => {
  try {
    // Upload image with stylist job type
    const uploadResult = await uploadImage(imageUri, 'stylist', {
      preferences: stylePreferences,
    });
    
    // Poll for result
    const result = await pollJobResult(uploadResult.jobId);
    
    return result.result;
  } catch (error) {
    console.error('❌ Generate stylist looks error:', error);
    throw error;
  }
};

/**
 * Auto-tag wardrobe item
 * @param {string} imageUri - Item photo URI
 * @returns {Promise<Object>} Auto-tagged item data
 */
export const autoTagWardrobeItem = async (imageUri) => {
  try {
    // Upload image with wardrobe job type
    const uploadResult = await uploadImage(imageUri, 'wardrobe');
    
    // Poll for result
    const result = await pollJobResult(uploadResult.jobId);
    
    return result.result;
  } catch (error) {
    console.error('❌ Auto-tag wardrobe error:', error);
    throw error;
  }
};

/**
 * Analyze body measurements
 * @param {string} frontPhotoUri - Front view photo
 * @param {string} sidePhotoUri - Side view photo
 * @returns {Promise<Object>} Body measurements and size recommendations
 */
export const analyzeBodyScan = async (frontPhotoUri, sidePhotoUri) => {
  try {
    // Upload both images
    const uploadResult = await uploadMultipleImages(
      [frontPhotoUri, sidePhotoUri],
      'body-scan'
    );
    
    // Poll for result
    const result = await pollJobResult(uploadResult.jobId);
    
    return result.result;
  } catch (error) {
    console.error('❌ Body scan error:', error);
    throw error;
  }
};

/**
 * Check backend health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return await response.json();
  } catch (error) {
    console.error('❌ Health check error:', error);
    throw error;
  }
};

export default {
  uploadImage,
  uploadMultipleImages,
  getJobStatus,
  getJobResult,
  pollJobResult,
  generateStylistLooks,
  autoTagWardrobeItem,
  analyzeBodyScan,
  checkHealth,
};
