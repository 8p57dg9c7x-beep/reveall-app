import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, GRADIENTS, SIZES, SPACING, CARD_SHADOW } from '../constants/theme';
import { searchMusic } from '../services/api';

export default function TrendingSongsScreen() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const returnPath = params.returnPath || '/discover';

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
        { id: 1, title: 'SOAK CITY', artist: '310babii', album: 'SOAK CITY', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80', duration: '2:45' },
        { id: 2, title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', album: 'Die With A Smile', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', duration: '4:11' },
        { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', album: 'Fireworks & Rollerblades', image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=400&q=80', duration: '3:02' },
        { id: 4, title: 'Too Sweet', artist: 'Hozier', album: 'Unheard', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80', duration: '4:09' },
        { id: 5, title: 'Espresso', artist: 'Sabrina Carpenter', album: 'Espresso', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80', duration: '2:55' },
        { id: 6, title: 'Please Please Please', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', duration: '3:06' },
        { id: 7, title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', album: 'HIT ME HARD AND SOFT', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80', duration: '3:30' },
        { id: 8, title: 'Good Luck, Babe!', artist: 'Chappell Roan', album: 'Good Luck, Babe!', image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&q=80', duration: '3:38' },
        { id: 9, title: 'Taste', artist: 'Sabrina Carpenter', album: 'Short n\' Sweet', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80', duration: '2:37' },
        { id: 10, title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', album: 'Where I\'ve Been, Isn\'t Where I\'m Going', image: 'https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=400&q=80', duration: '2:46' },
      ];

      setSongs(curatedSongs);
    } catch (error) {
      console.error('Error loading trending songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const [searchingIndex, setSearchingIndex] = useState(null);

  const handleSongTap = async (song, index) => {
    try {
      setSearchingIndex(index);
      
      // Call AudD search API to get full song details
      const response = await searchMusic(song.title, song.artist);
      
      setSearchingIndex(null);
      
      if (response.success && response.song) {
        // Use full data from AudD (with lyrics and streaming links)
        router.push({
          pathname: '/result',
          params: { 
            songData: JSON.stringify(response.song),
            returnPath: '/trendingsongs'
          }
        });
      } else {
        // Fallback to basic data if search fails
        const songData = {
          title: song.title,
          artist: song.artist,
          album: song.album || song.title,
          album_art: song.image,
          spotify: null,
          apple_music: null,
          lyrics: null,
        };
        
        router.push({
          pathname: '/result',
          params: { 
            songData: JSON.stringify(songData),
            returnPath: '/trendingsongs'
          }
        });
        
        // Optional: Show a brief message
        Alert.alert('Note', 'Full song details not available, showing basic info.');
      }
    } catch (error) {
      setSearchingIndex(null);
      console.error('Error searching song:', error);
      
      // Fallback to basic data on error
      const songData = {
        title: song.title,
        artist: song.artist,
        album: song.album || song.title,
        album_art: song.image,
        spotify: null,
        apple_music: null,
        lyrics: null,
      };
      
      router.push({
        pathname: '/result',
        params: { 
          songData: JSON.stringify(songData),
          returnPath: '/trendingsongs'
        }
      });
    }
  };

  const renderSongCard = (song, index) => (
    <TouchableOpacity 
      key={song.id} 
      style={styles.songCard}
      onPress={() => handleSongTap(song, index)}
      disabled={searchingIndex !== null}
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
        {searchingIndex === index ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <Text style={styles.duration}>{song.duration}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace(returnPath)}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="chart-line" size={32} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Trending Songs</Text>
          <Text style={styles.headerSubtitle}>Most popular tracks right now</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
    paddingTop: SPACING.headerPaddingTop,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.headerPaddingBottom,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.headerPaddingTop,
    left: SPACING.screenHorizontal,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: SPACING.titleToSubtitle,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingBottom: SPACING.bottomPadding,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadiusCard,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.itemGap,
    ...CARD_SHADOW,
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
    borderRadius: SIZES.borderRadiusCard,
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
