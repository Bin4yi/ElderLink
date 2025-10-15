import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

/**
 * Loading component optimized for elderly users
 * Shows clear loading state with text description
 */
const Loading = ({
  message = 'Loading...',
  size = 'large',
  color = COLORS.primary,
  style,
  showMessage = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator 
        size={size} 
        color={color}
      />
      {showMessage && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 40,
  },
  
  message: {
    fontSize: 20,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});



export default Loading;