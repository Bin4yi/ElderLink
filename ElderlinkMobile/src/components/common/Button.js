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
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  danger: {
    backgroundColor: COLORS.error,
  },
  
  // Sizes - professional but accessible
  small: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  
  large: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 52,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontFamily: 'OpenSans-SemiBold',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  
  // Text variants
  primaryText: {
    color: COLORS.white,
  },
  
  secondaryText: {
    color: COLORS.textPrimary,
  },
  
  outlineText: {
    color: COLORS.textPrimary,
  },
  
  ghostText: {
    color: COLORS.primary,
  },
  
  dangerText: {
    color: COLORS.white,
  },
  
  // Text sizes - readable but professional
  smallText: {
    fontSize: 14,
  },
  
  mediumText: {
    fontSize: 15,
  },
  
  largeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;