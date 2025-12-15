import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SIZES, SHADOWS, ANIMATIONS } from '../constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GradientButton({ 
  title, 
  onPress, 
  style, 
  textStyle,
  gradient = GRADIENTS.accent,
  disabled = false,
  icon = null,
  size = 'medium', // 'small', 'medium', 'large'
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(ANIMATIONS.scale.pressed, ANIMATIONS.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(ANIMATIONS.scale.normal, ANIMATIONS.spring);
  };

  const sizeStyles = {
    small: styles.buttonSmall,
    medium: styles.buttonMedium,
    large: styles.buttonLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, sizeStyles[size], disabled && styles.disabled]}
      >
        {icon && icon}
        <Text style={[styles.text, textSizeStyles[size], textStyle, disabled && styles.textDisabled]}>
          {title}
        </Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.borderRadiusButton,
    gap: 10,
    ...Platform.select({
      ios: SHADOWS.button,
      android: {
        elevation: SHADOWS.button.elevation,
      },
    }),
  },
  // 44px minimum touch target enforced
  buttonSmall: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonMedium: {
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  buttonLarge: {
    height: 56,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  text: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 17,
  },
  disabled: {
    opacity: ANIMATIONS.opacity.disabled,
  },
  textDisabled: {
    opacity: 0.7,
  },
});
