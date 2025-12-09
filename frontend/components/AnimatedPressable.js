import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { ANIMATIONS } from '../constants/theme';

/**
 * AnimatedPressable - A pressable component with smooth scale and fade animations
 * Provides a premium, native feel to all touchable elements
 */
const AnimatedPressable = ({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  scaleValue = ANIMATIONS.scale.pressed,
  ...props 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: scaleValue,
        damping: ANIMATIONS.spring.damping,
        stiffness: ANIMATIONS.spring.stiffness,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: ANIMATIONS.opacity.pressed,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: ANIMATIONS.scale.normal,
        damping: ANIMATIONS.spring.damping,
        stiffness: ANIMATIONS.spring.stiffness,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: ANIMATIONS.opacity.normal,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedPressable;
