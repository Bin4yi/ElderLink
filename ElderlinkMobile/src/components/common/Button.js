import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/colors';

/**
 * Custom Button component optimized for elderly users
 * Features large touch targets and clear text
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? COLORS.white : COLORS.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  danger: {
    backgroundColor: COLORS.error,
  },
  
  // Sizes
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
    minWidth: 120,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontFamily: 'OpenSans-SemiBold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // Text variants
  primaryText: {
    color: COLORS.white,
  },
  
  secondaryText: {
    color: COLORS.primary,
  },
  
  outlineText: {
    color: COLORS.primary,
  },
  
  ghostText: {
    color: COLORS.primary,
  },
  
  dangerText: {
    color: COLORS.white,
  },
  
  // Text sizes
  smallText: {
    fontSize: 14,
  },
  
  mediumText: {
    fontSize: 16,
  },
  
  largeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;