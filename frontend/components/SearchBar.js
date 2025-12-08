import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const SearchBar = ({ value, onChangeText, placeholder, onClear }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name="magnify" 
        size={22} 
        color={COLORS.textSecondary} 
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        placeholderTextColor={COLORS.textSecondary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={onClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons 
            name="close-circle" 
            size={20} 
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
});

export default SearchBar;