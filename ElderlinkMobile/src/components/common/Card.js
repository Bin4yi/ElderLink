import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../utils/colors';

/**
 * Card component for displaying content in containers
 * Provides consistent styling and elevation
 */
const Card = ({
  children,
  style,
  onPress,
  disabled = false,
  variant = 'default',
  ...props
}) => {
  const cardStyles = [
    styles.card,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  
  // Card variants
  default: {
    backgroundColor: COLORS.white,
  },
  
  primary: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  
  emergency: {
    backgroundColor: COLORS.emergency.background,
    borderColor: COLORS.emergency.border,
  },
  
  success: {
    backgroundColor: COLORS.gray50,
    borderColor: COLORS.success,
  },
  
  warning: {
    backgroundColor: '#FEF3C7',
    borderColor: COLORS.warning,
  },
  
  elevated: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  
  flat: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  disabled: {
    opacity: 0.6,
  },
});

export default Card;