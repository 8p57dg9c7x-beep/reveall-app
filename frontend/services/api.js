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
    
    // Use fetch with FormData for file uploads
    const formData = new FormData();
    
    // Create a file object with proper structure for React Native
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: imageUri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    // Don't set Content-Type header - let fetch set it with proper boundary
    const response = await fetch(`${API_BASE_URL}/api/recognize-image`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Image recognition response:', data);
    return data;
  } catch (error) {
    console.error('Image recognition error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process image'
    };
  }
};

export const recognizeMusic = async (audioUri) => {
  try {
    console.log('Recognizing music from URI:', audioUri);
    console.log('API URL:', `${API_BASE_URL}/api/recognize-music-base64`);
    
    // Read audio file as base64 using fetch (works on all platforms)
    const response = await fetch(audioUri);
    const blob = await response.blob();
    
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    const base64Audio = await base64Promise;
    console.log('Audio converted to base64, length:', base64Audio.length);

    // Send as JSON with base64 audio
    const apiResponse = await fetch(`${API_BASE_URL}/api/recognize-music-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_base64: base64Audio
      }),
    });

    const data = await apiResponse.json();
    console.log('Music recognition response:', data);
    return data;
  } catch (error) {
    console.error('Music recognition error:', error);
    return {
      success: false,
      error: error.message || 'Failed to identify song'
    };
  }
};

export const recognizeAudio = async (audioUri) => {
  try {
    console.log('Recognizing audio from URI:', audioUri);
    console.log('API URL:', `${API_BASE_URL}/api/recognize-audio`);
    
    // Use fetch with FormData for audio files
    const formData = new FormData();
    
    const uriParts = audioUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: audioUri,
      name: `audio.${fileType}`,
      type: `audio/${fileType}`,
    });

    // Don't set Content-Type header - let fetch set it with proper boundary
    const response = await fetch(`${API_BASE_URL}/api/recognize-audio`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Audio recognition response:', data);
    return data;
  } catch (error) {
    console.error('Audio recognition error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process audio'
    };
  }
};

export const recognizeVideo = async (videoUri) => {
  try {
    console.log('Recognizing video from URI:', videoUri);
    console.log('API URL:', `${API_BASE_URL}/api/recognize-video`);
    
    // Use fetch with FormData for video files
    const formData = new FormData();
    
    const uriParts = videoUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri: videoUri,
      name: `video.${fileType}`,
      type: `video/${fileType}`,
    });

    // Don't set Content-Type header - let fetch set it with proper boundary
    const response = await fetch(`${API_BASE_URL}/api/recognize-video`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Video recognition response:', data);
    return data;
  } catch (error) {
    console.error('Video recognition error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process video'
    };
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const searchMusic = async (title, artist) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/music/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, artist }),
    });
    return await response.json();
  } catch (error) {
    console.error('Music search error:', error);
    throw error;
  }
};
