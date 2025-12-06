import React, { useState, memo } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const CastImage = memo(({ profilePath, style }) => {
  const [imageError, setImageError] = useState(false);

  // Show fallback if no profile path or image failed
  if (!profilePath || imageError) {
    return (
      <View style={[style, styles.placeholder]}>
        <MaterialCommunityIcons name="account" size={40} color={COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `https://image.tmdb.org/t/p/w185${profilePath}` }}
      style={style}
      onError={() => setImageError(true)}
      defaultSource={require('../assets/placeholder.png')}
    />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default CastImage;
