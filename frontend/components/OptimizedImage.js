import React, { memo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { Image, View, StyleSheet, Platform } from 'react-native';

const OptimizedImage = memo(({ source, style, ...props }) => {
  const [fastImageFailed, setFastImageFailed] = useState(false);

  if (!source?.uri) {
    console.log('❌ OptimizedImage: No URI provided');
    return <View style={[style, styles.placeholder]} />;
  }

  // Validate URL
  if (!source.uri.startsWith('http://') && !source.uri.startsWith('https://')) {
    console.log('❌ OptimizedImage: Invalid URL format:', source.uri);
    return <View style={[style, styles.placeholder]} />;
  }

  // Use regular Image on web, FastImage on native
  if (Platform.OS === 'web' || fastImageFailed) {
    return (
      <Image
        source={source}
        style={style}
        resizeMode="cover"
        onError={(e) => {
          console.log('❌ Image load failed:', source.uri);
        }}
        onLoad={() => {
          console.log('✅ Image loaded successfully:', source.uri);
        }}
        {...props}
      />
    );
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
        console.log('❌ FastImage failed, falling back to Image:', source.uri);
        setFastImageFailed(true);
      }}
      onLoad={() => {
        console.log('✅ FastImage loaded:', source.uri);
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
