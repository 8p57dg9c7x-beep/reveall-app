import React, { memo } from 'react';
import { Image, View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

const OptimizedImage = memo(({ source, style, ...props }) => {
  if (!source?.uri) {
    return <View style={[style, styles.placeholder]} />;
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode="cover"
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
