import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

export const SkeletonCard = ({ width, height, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, opacity },
        style,
      ]}
    />
  );
};

export const SkeletonOutfitCard = () => (
  <View style={styles.outfitCard}>
    <SkeletonCard width="100%" height={240} style={styles.skeletonImage} />
    <View style={styles.skeletonInfo}>
      <SkeletonCard width="80%" height={14} style={styles.skeletonTitle} />
      <SkeletonCard width="50%" height={12} style={styles.skeletonPrice} />
    </View>
  </View>
);

export const SkeletonHorizontalCard = () => (
  <View style={styles.horizontalCard}>
    <SkeletonCard width={140} height={210} style={styles.skeletonHorizontalImage} />
    <SkeletonCard width={120} height={12} style={styles.skeletonHorizontalTitle} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  outfitCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonImage: {
    borderRadius: 0,
  },
  skeletonInfo: {
    padding: 12,
  },
  skeletonTitle: {
    marginBottom: 8,
  },
  skeletonPrice: {
    marginBottom: 4,
  },
  horizontalCard: {
    marginRight: 16,
    width: 140,
  },
  skeletonHorizontalImage: {
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonHorizontalTitle: {
    marginTop: 4,
  },
});

// Default export for convenience
export default SkeletonCard;
