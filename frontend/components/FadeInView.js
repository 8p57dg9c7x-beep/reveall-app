import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { ANIMATIONS } from '../constants/theme';

/**
 * FadeInView - Fade in animation for screen content
 * Creates a smooth entrance effect when screens load
 */
const FadeInView = ({ 
  children, 
  style, 
  delay = 0,
  duration = ANIMATIONS.duration.normal,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
