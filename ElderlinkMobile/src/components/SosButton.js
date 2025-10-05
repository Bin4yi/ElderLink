import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { SOS_CONFIG } from '../utils/constants';

import { useEmergency } from '../context/EmergencyContext';

const { width } = Dimensions.get('window');

/**
 * SOS Emergency Button Component
 * Large, prominent button with 3-second hold activation
 * Optimized for elderly users in emergency situations
 */
const SosButton = ({ elderData, onEmergencyTriggered }) => {
  console.log('🔄 SosButton component rendered with elder data:', elderData?.firstName, elderData?.id);
  
  const {
    isSOSActive,
    isSOSLoading,
    sosCountdown,
    sosProgress,
    startSOS,
    cancelSOS,
    triggerEmergencyAlert,
    error
  } = useEmergency();
  
  console.log('🔗 Emergency context state:', { 
    isSOSActive, 
    isSOSLoading, 
    sosCountdown, 
    sosProgress, 
    hasStartSOS: !!startSOS,
    hasTriggerEmergencyAlert: !!triggerEmergencyAlert,
    error: error?.message || 'none'
  });

  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate progress circle
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: sosProgress / 100,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [sosProgress]);

  // Pulse animation when SOS is active
  useEffect(() => {
    if (isSOSActive) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSOSActive]);

  // Trigger emergency when countdown reaches zero
  useEffect(() => {
    console.log('⏰ SOS Countdown Update:', { isSOSActive, sosCountdown });
    
    if (isSOSActive && sosCountdown <= 0) {
      console.log('🚨 COUNTDOWN COMPLETE! Triggering emergency...');
      handleEmergencyTrigger();
    }
  }, [isSOSActive, sosCountdown]);

  const handlePressIn = async () => {
    console.log('🔴 SOS BUTTON PRESS DETECTED!');
    console.log('🔍 Current SOS state:', { isSOSLoading, isSOSActive, sosProgress });
    
    if (isSOSLoading) {
      console.log('⚠️ SOS is already loading, ignoring press');
      return;
    }

    console.log('🚀 Starting SOS countdown...');
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Start SOS countdown
    startSOS();
    
    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
    
    console.log('✅ SOS countdown started');
  };

  const handlePressOut = () => {
    console.log('🔵 SOS BUTTON RELEASED');
    console.log('🔍 Current SOS state:', { isSOSActive, sosCountdown });
    
    if (isSOSActive) {
      console.log('🛑 Cancelling SOS countdown...');
      // Cancel SOS
      cancelSOS();
      
      // Reset scale animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      
      console.log('✅ SOS countdown cancelled');
    } else {
      console.log('ℹ️ SOS was not active, nothing to cancel');
    }
  };

  const handleEmergencyTrigger = async () => {
    try {
      console.log('🔴🔴🔴 SOS BUTTON PRESSED! 🔴🔴🔴');
      
      // Strong haptic feedback for emergency trigger
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Debug: Log the elder data structure
      console.log('🔍 Elder data received:', JSON.stringify(elderData, null, 2));
      
      // Ensure we have valid elder data with required fields
      const validElderData = elderData || {};
      
      // Check for different possible ID fields
      const elderId = validElderData.id || validElderData.userId || validElderData._id || validElderData.elderId;
      
      if (!elderId) {
        console.error('❌❌❌ EMERGENCY ALERT FAILED: No elder ID available! ❌❌❌');
        console.error('📋 Available keys in elder data:', Object.keys(validElderData));
        return;
      }
      
      // Ensure the elder data has an id field for the emergency service
      const elderDataWithId = {
        ...validElderData,
        id: elderId
      };
      
      console.log('� Initiating emergency alert for elder ID:', elderId);
      const result = await triggerEmergencyAlert(elderDataWithId);
      
      console.log('📡 Emergency alert result:', {
        success: result?.success,
        message: result?.message,
        error: result?.error
      });
      
      if (result?.success) {
        console.log('🏆🏆🏆 SOS BUTTON SUCCESS! Emergency help is on the way! 🏆🏆🏆');
        
        if (onEmergencyTriggered) {
          onEmergencyTriggered(result);
        }
      } else {
        console.error('💥💥💥 SOS BUTTON FAILED! 💥💥💥');
        console.error('Error details:', result?.error);
      }
    } catch (error) {
      console.error('🚫🚫🚫 EMERGENCY TRIGGER ERROR! 🚫🚫🚫');
      console.error('Exception:', error.message);
      console.error('Stack:', error.stack);
    }
  };

  const getButtonText = () => {
    if (isSOSLoading) return 'Sending Alert...';
    if (isSOSActive) return `Hold ${Math.ceil(sosCountdown / 1000)}s`;
    return 'SOS Emergency';
  };

  const getButtonSubtext = () => {
    if (isSOSLoading) return 'Please wait...';
    if (isSOSActive) return 'Release to cancel';
    return 'Hold for 3 seconds';
  };

  const buttonSize = Math.min(width * 0.6, 240);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            width: buttonSize,
            height: buttonSize,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        {/* Progress circle background */}
        <View style={[styles.progressBackground, { width: buttonSize, height: buttonSize }]} />
        
        {/* Progress circle */}
        <Animated.View
          style={[
            styles.progressCircle,
            {
              width: buttonSize,
              height: buttonSize,
              transform: [
                {
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Main SOS Button */}
        <Pressable
          style={[
            styles.sosButton,
            {
              width: buttonSize - 12,
              height: buttonSize - 12,
            },
            isSOSActive && styles.sosButtonActive,
            isSOSLoading && styles.sosButtonLoading,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isSOSLoading}
        >
          <View style={styles.buttonContent}>
            <Ionicons
              name={isSOSActive ? 'alert' : 'warning'}
              size={48}
              color={COLORS.white}
              style={styles.icon}
            />
            <Text style={styles.buttonText}>{getButtonText()}</Text>
            <Text style={styles.buttonSubtext}>{getButtonSubtext()}</Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Press and hold the SOS button for 3 seconds to send an emergency alert to your family and care team.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  progressBackground: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 6,
    borderColor: COLORS.gray200,
  },
  
  progressCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 6,
    borderColor: COLORS.white,
    borderTopColor: COLORS.primaryDark,
    borderRightColor: COLORS.primaryDark,
    borderBottomColor: COLORS.gray200,
    borderLeftColor: COLORS.gray200,
  },
  
  sosButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  sosButtonActive: {
    backgroundColor: COLORS.primaryDark,
    shadowOpacity: 0.4,
    elevation: 12,
  },
  
  sosButtonLoading: {
    backgroundColor: COLORS.gray500,
  },
  
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  icon: {
    marginBottom: 8,
  },
  
  buttonText: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  
  buttonSubtext: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  errorContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  
  errorText: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.error,
    textAlign: 'center',
  },
  
  instructionsContainer: {
    marginTop: 40,
    paddingHorizontal: 40,
  },
  
  instructionsText: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
});

export default SosButton;