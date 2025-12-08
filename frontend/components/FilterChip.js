import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

const FilterChip = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.textPrimary,
  },
});

export default FilterChip;