import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SIZES, ANIMATIONS } from '../constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function GradientChip({ 
  label, 
  onPress, 
  active = false,
  icon = null,
  style,
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, ANIMATIONS.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, ANIMATIONS.spring);
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      activeOpacity={0.9}
    >
      {active ? (
        <LinearGradient
          colors={GRADIENTS.chip}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.chip}
        >
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={18} 
              color={COLORS.textPrimary}
              style={styles.icon}
            />
          )}
          <Text style={styles.activeText}>{label}</Text>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={['rgba(42, 24, 56, 0.4)', 'rgba(42, 24, 56, 0.4)']}
          style={styles.chip}
        >
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={18} 
              color={COLORS.textMuted}
              style={styles.icon}
            />
          )}
          <Text style={styles.inactiveText}>{label}</Text>
        </LinearGradient>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: SIZES.borderRadiusPill,
    borderWidth: 1,
    borderColor: 'rgba(177, 76, 255, 0.2)',
    minHeight: 40,
  },
  icon: {
    marginRight: 6,
  },
  activeText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inactiveText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
