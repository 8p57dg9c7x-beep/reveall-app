import React, { memo } from 'react';
import FastImage from 'react-native-fast-image';
import { View, StyleSheet } from 'react-native';

const OptimizedImage = memo(({ source, style, ...props }) => {
  if (!source?.uri) {
    return <View style={[style, styles.placeholder]} />;
  }

  return (
    <FastImage
      source={{
        uri: source.uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={style}
      resizeMode={FastImage.resizeMode.cover}
      onError={(e) => {
        console.log('FastImage error:', source?.uri);
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
