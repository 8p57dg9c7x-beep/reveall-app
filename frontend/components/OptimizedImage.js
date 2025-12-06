import React from 'react';
import { Image as ExpoImage } from 'expo-image';
import { StyleSheet } from 'react-native';

const blurhash = 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';

export default function OptimizedImage({ source, style, ...props }) {
  return (
    <ExpoImage
      source={source}
      style={style}
      placeholder={{ blurhash }}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      {...props}
    />
  );
}
