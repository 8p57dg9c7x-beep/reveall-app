import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Use Render backend (accessible from mobile devices)
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
    
    // Read image file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    console.log('Image base64 length:', base64.length);

    // Send as base64 instead of FormData
    const response = await api.post('/api/recognize-image', {
      image_base64: `data:image/jpeg;base64,${base64}`,
    });

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
    console.log('Recognizing audio from URI:', audioUri);
    
    // Read audio file as base64
    const base64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });

    console.log('Audio base64 length:', base64.length);
    console.log('API URL:', `${API_BASE_URL}/api/recognize-audio`);

    const response = await api.post('/api/recognize-audio', {
      audio_base64: `data:audio/m4a;base64,${base64}`,
    });

    console.log('Audio recognition response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Audio recognition error:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to process audio'
    };
  }
};

export const recognizeVideo = async (videoUri) => {
  try {
    console.log('Recognizing video from URI:', videoUri);
    console.log('API URL:', `${API_BASE_URL}/api/recognize-video`);
    
    // Read video file as base64
    const base64 = await FileSystem.readAsStringAsync(videoUri, {
      encoding: 'base64',
    });

    console.log('Video base64 length:', base64.length);

    // Send as base64 instead of FormData
    const response = await api.post('/api/recognize-video', {
      video_base64: `data:video/mp4;base64,${base64}`,
    });

    console.log('Video recognition response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Video recognition error:', error);
    console.error('Error response:', error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to process video'
    };
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
