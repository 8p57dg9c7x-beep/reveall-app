import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import GradientBackground from './GradientBackground';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.text}>{message}</Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
