import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

/**
 * FadeInView Component
 * Provides smooth fade-in animation for any child component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to animate
 * @param {number} props.duration - Animation duration in ms (default: 500)
 * @param {number} props.delay - Delay before animation starts (default: 0)
 * @param {ViewStyle} props.style - Additional styles
 */
const FadeInView = ({ 
  children, 
  duration = 500, 
  delay = 0, 
  style = {},
  ...props 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
