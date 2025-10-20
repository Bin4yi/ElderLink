import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';
import profileService from '../../services/profile';

import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

/**
 * EditProfileScreen
 * Allows elderly users to edit their profile information
 * Elder-friendly interface with large fonts and clear buttons
 */
const EditProfileScreen = ({ navigation }) => {
  const { user, elder, updateElderData } = useAuth();
  
  // Check if user is elder - they shouldn't be able to edit profile
  useEffect(() => {
    if (user?.role === 'elder') {
      Alert.alert(
        'Access Denied',
        'You are not allowed to edit your profile. Please contact your family member or administrator for assistance.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    }
  }, [user, navigation]);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [elderProfile, setElderProfile] = useState(null);

  // Fetch elder profile on mount
  useEffect(() => {
    const fetchElderProfile = async () => {
      try {
        setLoading(true);
        
        // If elder data exists in context, use it
        if (elder) {
          setElderProfile(elder);
          setLoading(false);
          return;
        }

        // Otherwise, fetch from API
        console.log('📡 Fetching elder profile from API...');
        const response = await profileService.getElderProfile();
        
        if (response.success && response.elder) {
          setElderProfile(response.elder);
          // Update context with fetched elder data
          await updateElderData(response.elder);
        } else {
          throw new Error('Failed to load profile');
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        Alert.alert(
          'Error',
          'Failed to load your profile. Please try again.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchElderProfile();
  }, []);

  // Initialize form with current data
  useEffect(() => {
    if (elderProfile || elder || user) {
      const profile = elderProfile || elder;
      
      setFirstName(profile?.firstName || user?.firstName || '');
      setLastName(profile?.lastName || user?.lastName || '');
      setEmail(user?.email || '');
      setPhone(profile?.phone || user?.phone || '');
      
      // Format date of birth (YYYY-MM-DD)
      const dob = profile?.dateOfBirth || user?.dateOfBirth;
      if (dob) {
        const date = new Date(dob);
        const formatted = date.toISOString().split('T')[0];
        setDateOfBirth(formatted);
      }
      
      setAddress(profile?.address || '');
    }
  }, [elderProfile, elder, user]);

  // Track changes
  useEffect(() => {
    const profile = elderProfile || elder;
    const currentFirstName = profile?.firstName || user?.firstName || '';
    const currentLastName = profile?.lastName || user?.lastName || '';
    const currentEmail = user?.email || '';
    const currentPhone = profile?.phone || user?.phone || '';
    const currentAddress = profile?.address || '';
    
    const changed = 
      firstName !== currentFirstName ||
      lastName !== currentLastName ||
      email !== currentEmail ||
      phone !== currentPhone ||
      address !== currentAddress ||
      (dateOfBirth && dateOfBirth !== (profile?.dateOfBirth || user?.dateOfBirth)?.split('T')[0]);
    
    setHasChanges(changed);
  }, [firstName, lastName, email, phone, dateOfBirth, address, elderProfile, elder, user]);

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (if provided)
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Date of birth validation (if provided)
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      newErrors.dateOfBirth = 'Date format should be YYYY-MM-DD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save button press
   */
  const handleSave = async () => {
    // Block elders from saving
    if (user?.role === 'elder') {
      Alert.alert(
        'Access Denied',
        'You are not allowed to edit your profile. Please contact your family member or administrator.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please correct the errors in the form before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirm save
    Alert.alert(
      'Save Changes',
      'Are you sure you want to save these changes to your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: performSave },
      ]
    );
  };

  /**
   * Perform the actual save operation
   */
  const performSave = async () => {
    setSaving(true);

    try {
      const profile = elderProfile || elder;
      
      // Check if we have elder profile
      if (!profile || !profile.id) {
        throw new Error('Elder profile not found. Please refresh and try again.');
      }

      // Prepare update data
      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || null,
        address: address.trim(),
      };

      console.log('💾 Saving profile changes for elder:', profile.id);
      console.log('📋 Update data:', updateData);

      // Make API call to update elder profile
      const response = await profileService.updateElderProfile(
        profile.id,
        updateData
      );

      console.log('✅ Profile update response:', response);

      // Update local context with new data
      if (response.success && response.elder) {
        await updateElderData(response.elder);
        setElderProfile(response.elder);
        
        Alert.alert(
          'Success',
          SUCCESS_MESSAGES.PROFILE_UPDATED,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Save profile error:', error);
      
      Alert.alert(
        'Save Failed',
        error.message || ERROR_MESSAGES.SERVER_ERROR,
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle cancel button press
   */
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Ionicons name="person-circle" size={60} color={COLORS.primary} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Edit Your Profile</Text>
              <Text style={styles.headerSubtitle}>
                Update your personal information
              </Text>
            </View>
          </View>
        </Card>

        {/* Personal Information */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            error={errors.firstName}
            required
            leftIcon="person"
            autoCapitalize="words"
          />

          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            error={errors.lastName}
            required
            leftIcon="person"
            autoCapitalize="words"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            error={errors.email}
            required
            leftIcon="mail"
            autoCapitalize="none"
            disabled
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              Email cannot be changed. Contact your family member if needed.
            </Text>
          </View>

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g., +1 234 567 8900"
            keyboardType="phone-pad"
            error={errors.phone}
            leftIcon="call"
          />

          <Input
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            error={errors.dateOfBirth}
            leftIcon="calendar"
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={COLORS.info} />
            <Text style={styles.infoText}>
              Use format: YYYY-MM-DD (e.g., 1950-01-15)
            </Text>
          </View>

          <Input
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your full address"
            multiline
            numberOfLines={3}
            error={errors.address}
            leftIcon="location"
          />
        </Card>

        {/* Action Buttons */}
        <Card style={styles.buttonCard}>
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            size="large"
            disabled={saving || !hasChanges}
            loading={saving}
            style={styles.saveButton}
          />

          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="large"
            disabled={saving}
            style={styles.cancelButton}
          />
        </Card>

        {/* Help Info */}
        <View style={styles.helpCard}>
          <Text style={styles.helpText}>
            💡 Need help? Contact your family member or care coordinator
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  
  loadingText: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: 40,
  },
  
  headerCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
  },
  
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.info + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.info,
    marginLeft: 8,
    lineHeight: 20,
  },
  
  buttonCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  saveButton: {
    marginBottom: 12,
  },
  
  cancelButton: {
    borderColor: COLORS.gray400,
  },
  
  helpCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  
  helpText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EditProfileScreen;
