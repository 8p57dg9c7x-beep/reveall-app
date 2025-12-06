import React, { useState, memo } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const OptimizedImage = memo(({ source, style, ...props }) => {
  const [hasError, setHasError] = useState(false);

  // Show placeholder if error
  if (hasError || !source?.uri) {
    return (
      <View style={[style, styles.placeholder]} />
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode="cover"
      onError={(e) => {
        console.log('Image load error:', source?.uri);
        setHasError(true);
      }}
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
