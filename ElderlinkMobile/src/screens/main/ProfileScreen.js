import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfileScreen = ({ navigation }) => {
  const { user, elder, logout } = useAuth();
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = calculateAge(elder?.dateOfBirth || user?.dateOfBirth);
  const displayName = `${elder?.firstName || user?.firstName || ''} ${elder?.lastName || user?.lastName || ''}`.trim();

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileHeader}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {(elder?.profilePicture || user?.profilePicture) ? (
              <Image 
                source={{ uri: elder?.profilePicture || user?.profilePicture }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.gray500} />
              </View>
            )}
          </View>
          
          <View style={styles.nameContainer}>
            <Text style={styles.fullName}>{displayName || 'User'}</Text>
            {userAge && (
              <Text style={styles.ageText}>{userAge} years old</Text>
            )}
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={20} color={COLORS.gray600} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Personal Information */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{displayName || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{elder?.phone || user?.phone || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>
              {elder?.dateOfBirth || user?.dateOfBirth 
                ? new Date(elder?.dateOfBirth || user?.dateOfBirth).toLocaleDateString()
                : 'Not provided'
              }
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{elder?.address || 'Not provided'}</Text>
          </View>
        </View>
      </Card>

      {/* Health Information */}
      {elder && (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="medical" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Medical Conditions</Text>
              <Text style={styles.infoValue}>
                {elder.medicalConditions || 'None reported'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="bandage" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Allergies</Text>
              <Text style={styles.infoValue}>
                {elder.allergies || 'None reported'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="flask" size={20} color={COLORS.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Current Medications</Text>
              <Text style={styles.infoValue}>
                {elder.currentMedications || 'None reported'}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* App Settings */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>App Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="notifications" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('EmergencyContacts')}
        >
          <Ionicons name="people" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Emergency Contacts</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            Alert.alert(
              'Privacy Policy',
              'Your privacy is important to us. Contact your care coordinator for more information about how your data is protected.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Ionicons name="shield-checkmark" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            Alert.alert(
              'Help & Support',
              'For help with the app:\n\n• Contact your family member\n• Reach out to your care coordinator\n• Call the support number provided by your care team',
              [{ text: 'OK' }]
            );
          }}
        >
          <Ionicons name="help-circle" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
      </Card>

      {/* Sign Out */}
      <Card style={styles.signOutCard}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          size="large"
          style={styles.signOutButton}
        />
      </Card>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>ElderLink Mobile v1.0.0</Text>
        <Text style={styles.appInfoText}>Your health, our care</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  
  profileHeader: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    marginRight: 20,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  nameContainer: {
    flex: 1,
  },
  
  fullName: {
    fontSize: 28,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  
  ageText: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  
  userEmail: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
  },
  
  editButton: {
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
  },
  
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  
  infoLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  
  infoValue: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  settingText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 16,
  },
  
  signOutCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  signOutButton: {
    borderColor: COLORS.error,
  },
  
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  
  appInfoText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default ProfileScreen;