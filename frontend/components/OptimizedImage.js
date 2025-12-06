import React, { memo, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const OptimizedImage = memo(({ source, style, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!source?.uri || hasError) {
    return (
      <View style={[style, styles.placeholder]}>
        <MaterialCommunityIcons name="image-off" size={40} color={COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.log('Image failed to load:', source.uri);
          setHasError(true);
        }}
        {...props}
      />
      {isLoading && <View style={[StyleSheet.absoluteFill, styles.loadingPlaceholder]} />}
    </View>
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
});

export default OptimizedImage;
