import React from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

const SkeletonLoader = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
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
    <View style={styles.container}>
      <Animated.View style={[styles.skeleton, { opacity }]} />
    </View>
  );
};

// Enhanced skeleton for outfit/beauty cards
export const SkeletonCard = ({ isLeft }) => {
  const shimmer = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={[styles.cardContainer, isLeft ? styles.cardLeft : styles.cardRight]}>
      <View style={styles.imageBox}>
        <Animated.View 
          style={[
            styles.shimmer,
            { transform: [{ translateX }] }
          ]} 
        />
      </View>
      <View style={styles.infoBox}>
        <View style={[styles.textLine, styles.titleLine]} />
        <View style={[styles.textLine, styles.subtitleLine]} />
        <View style={[styles.textLine, styles.priceLine]} />
      </View>
    </View>
  );
};

// Grid of skeleton cards
export const SkeletonGrid = () => {
  return (
    <View style={styles.gridContainer}>
      <View style={styles.row}>
        <SkeletonCard isLeft={true} />
        <SkeletonCard isLeft={false} />
      </View>
      <View style={styles.row}>
        <SkeletonCard isLeft={true} />
        <SkeletonCard isLeft={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  skeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
  },
  cardContainer: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 310,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
  },
  imageBox: {
    width: '100%',
    height: 240,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoBox: {
    padding: 14,
    gap: 8,
  },
  textLine: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
  },
  titleLine: {
    width: '90%',
    height: 14,
  },
  subtitleLine: {
    width: '60%',
  },
  priceLine: {
    width: '40%',
  },
  gridContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default SkeletonLoader;
