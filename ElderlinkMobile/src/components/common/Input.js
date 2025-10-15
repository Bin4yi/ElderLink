import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';

/**
 * Custom Input component optimized for elderly users
 * Features large text, clear labels, and validation states
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const hasError = !!error;
  const isPassword = secureTextEntry;

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    hasError && styles.error,
    disabled && styles.disabled,
    style,
  ];

  const textInputStyle = [
    styles.input,
    multiline && styles.multilineInput,
    disabled && styles.disabledInput,
    inputStyle,
  ];

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={containerStyle}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Ionicons name={leftIcon} size={24} color={COLORS.gray500} />
          </View>
        )}
        
        <TextInput
          style={textInputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={24}
              color={COLORS.gray500}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <View style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={24} color={COLORS.gray500} />
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  required: {
    color: COLORS.error,
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  
  focused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  error: {
    borderColor: COLORS.error,
  },
  
  disabled: {
    backgroundColor: COLORS.gray100,
    borderColor: COLORS.gray200,
  },
  
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.text,
    paddingVertical: 16,
  },
  
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  
  disabledInput: {
    color: COLORS.gray400,
  },
  
  leftIcon: {
    marginRight: 12,
  },
  
  rightIcon: {
    marginLeft: 12,
  },
  
  passwordToggle: {
    marginLeft: 12,
    padding: 4,
  },
  
  errorText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.error,
    marginTop: 8,
  },
});


export default Input;