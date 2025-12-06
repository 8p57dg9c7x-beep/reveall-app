import React, { memo } from 'react';
import { Image } from 'expo-image';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/theme';

const OptimizedImage = memo(({ source, style, ...props }) => {
  if (!source?.uri) {
    return <View style={[style, styles.placeholder]} />;
  }

  return (
    <Image
      source={source}
      style={style}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

export default OptimizedImage;
