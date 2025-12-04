import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';

export default function TrendingSongsScreen() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingSongs();
  }, []);

  const loadTrendingSongs = async () => {
    try {
      // TODO: Replace with real Spotify API call when ready
      // const API_URL = process.env.EXPO_PUBLIC_API_URL;
      // const response = await fetch(`${API_URL}/api/music/trending`);
      // const data = await response.json();
      // setSongs(data.tracks || []);

      // For now, using curated list (Spotify API ready)
      const curatedSongs = [
        { id: 1, title: 'SOAK CITY', artist: '310babii', album: 'SOAK CITY', image: 'https://i.scdn.co/image/ab67616d0000b2738b5e3c8b6d8e6e7b9c5f8e0a', duration: '2:45' },
        { id: 2, title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', album: 'Die With A Smile', image: 'https://i.scdn.co/image/ab67616d0000b273c015d2f73b144e0e0c4e7b9f', duration: '4:11' },
        { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', album: 'Fireworks & Rollerblades', image: 'https://i.scdn.co/image/ab67616d0000b273ef2d4ed7e8e8e3c8d9f0f8a3', duration: '3:02' },
        { id: 4, title: 'Too Sweet', artist: 'Hozier', album: 'Unheard', image: 'https://i.scdn.co/image/ab67616d0000b273b8c8e8e7f9c5d8e0e0c4e7b9', duration: '4:09' },
        { id: 5, title: 'Espresso', artist: 'Sabrina Carpenter', album: 'Espresso', image: 'https://i.scdn.co/image/ab67616d0000b273c5d8e0e0c4e7b9f8e8e7f9c5', duration: '2:55' },
        { id: 6, title: 'Please Please Please', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', image: 'https://i.scdn.co/image/ab67616d0000b273fd8d7a8d96871e791cb1f626', duration: '3:06' },
        { id: 7, title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT', image: 'https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62', duration: '3:30' },
        { id: 8, title: 'Good Luck, Babe!', artist: 'Chappell Roan', album: 'Good Luck, Babe!', image: 'https://i.scdn.co/image/ab67616d0000b2737a4781629469bb83356cd318', duration: '3:38' },
        { id: 9, title: 'Taste', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', image: 'https://i.scdn.co/image/ab67616d0000b273fd8d7a8d96871e791cb1f626', duration: '2:37' },
        { id: 10, title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', album: 'Where I\'ve Been, Isn\'t Where I\'m Going', image: 'https://i.scdn.co/image/ab67616d0000b273e3e07f424c581b1679c1f6fd', duration: '2:46' },
      ];

      setSongs(curatedSongs);
    } catch (error) {
      console.error('Error loading trending songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSongTap = (song) => {
    // Format song data to match the result screen format
    const songData = {
      title: song.title,
      artist: song.artist,
      album: song.album || song.title,
      album_art: song.image,
      // Add streaming links (YouTube always available via search)
      spotify: null, // Will show if available in future
      apple_music: null, // Will show if available in future
      lyrics: null, // Will show "No lyrics found" message
    };

    router.push({
      pathname: '/result',
      params: { songData: JSON.stringify(songData) }
    });
  };

  const renderSongCard = (song, index) => (
    <TouchableOpacity 
      key={song.id} 
      style={styles.songCard}
      onPress={() => handleSongTap(song)}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <Image source={{ uri: song.image }} style={styles.albumArt} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artistName} numberOfLines={1}>{song.artist}</Text>
      </View>
      <View style={styles.songMeta}>
        <Text style={styles.duration}>{song.duration}</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="chart-line" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Trending Songs</Text>
          <Text style={styles.headerSubtitle}>Most popular tracks right now</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {songs.map((song, index) => renderSongCard(song, index))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  songMeta: {
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});
