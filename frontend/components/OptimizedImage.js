import React, { useState } from 'react';
import { Image as ExpoImage } from 'expo-image';
import { Image as RNImage, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

export default function OptimizedImage({ source, style, ...props }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to React Native Image if ExpoImage fails
  if (hasError) {
    return (
      <RNImage
        source={source}
        style={style}
        onError={() => console.log('Image failed to load:', source?.uri)}
        {...props}
      />
    );
  }

  return (
    <View style={style}>
      <ExpoImage
        source={source}
        style={style}
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
        onError={() => {
          console.log('ExpoImage error, falling back:', source?.uri);
          setHasError(true);
        }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        {...props}
      />
      {isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
}
