import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://cinescan-backend-1.onrender.com';

console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const recognizeImage = async (imageUri) => {
  try {
    console.log('Recognizing image from URI:', imageUri);
    console.log('API URL:', `${API_BASE_URL}/api/recognize-image`);
    
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/recognize-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );

    console.log('Image recognition response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Image recognition error:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to process image'
    };
  }
};

export const recognizeAudio = async (audioUri) => {
  try {
    // Read audio file as base64
    const base64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await api.post('/api/recognize-audio', {
      audio_base64: `data:audio/m4a;base64,${base64}`,
    });

    return response.data;
  } catch (error) {
    console.error('Audio recognition error:', error);
    throw error;
  }
};

export const recognizeVideo = async (videoUri) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'video.mp4',
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/recognize-video`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Video recognition error:', error);
    throw error;
  }
};

export const searchMovie = async (query) => {
  try {
    const response = await api.post('/api/search', { query });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};
