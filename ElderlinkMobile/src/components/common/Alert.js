import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';

/**
 * Alert component for displaying messages with different severity levels
 * Optimized for elderly users with clear icons and large text
 */
const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  closable = false,
  style,
  ...props
}) => {
  const getAlertConfig = (alertType) => {
    switch (alertType) {
      case 'success':
        return {
          backgroundColor: '#F0FDF4',
          borderColor: COLORS.success,
          iconColor: COLORS.success,
          textColor: '#166534',
          iconName: 'checkmark-circle',
        };
      case 'warning':
        return {
          backgroundColor: '#FFFBEB',
          borderColor: COLORS.warning,
          iconColor: COLORS.warning,
          textColor: '#92400E',
          iconName: 'warning',
        };
      case 'error':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: COLORS.error,
          iconColor: COLORS.error,
          textColor: '#991B1B',
          iconName: 'alert-circle',
        };
      case 'emergency':
        return {
          backgroundColor: COLORS.emergency.background,
          borderColor: COLORS.emergency.border,
          iconColor: COLORS.error,
          textColor: COLORS.emergency.text,
          iconName: 'alert',
        };
      default: // info
        return {
          backgroundColor: '#EFF6FF',
          borderColor: COLORS.info,
          iconColor: COLORS.info,
          textColor: '#1E40AF',
          iconName: 'information-circle',
        };
    }
  };

  const config = getAlertConfig(type);

  const containerStyle = [
    styles.container,
    {
      backgroundColor: config.backgroundColor,
      borderColor: config.borderColor,
    },
    style,
  ];

  return (
    <View
      style={containerStyle}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${type} alert: ${title || message}`}
      {...props}
    >
      <View style={styles.content}>
        <Ionicons
          name={config.iconName}
          size={28}
          color={config.iconColor}
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          {title && (
            <Text
              style={[
                styles.title,
                { color: config.textColor }
              ]}>
              {title}
            </Text>
          )}
          
          {message && (
            <Text
              style={[
                styles.message,
                { color: config.textColor },
                !title && styles.messageOnly
              ]}>
              {message}
            </Text>
          )}
        </View>
        
        {closable && onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Dismiss this alert message"
          >
            <Ionicons
              name="close"
              size={24}
              color={config.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  
  textContainer: {
    flex: 1,
  },
  
  title: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  message: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    lineHeight: 24,
  },
  
  messageOnly: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
  },
  
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

export default Alert;