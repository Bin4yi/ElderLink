import React, { useState, useEffect } from 'react';
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
      <View style={styles.profileHeaderContainer}>
        <Card style={styles.profileHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.fullName}>{displayName || 'User'}</Text>
              <View style={styles.detailsRow}>
                {userAge && (
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{userAge} years old</Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>{user?.email}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Card>
      </View>

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
  
  profileHeaderContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  
  profileHeader: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  
  fullName: {
    fontSize: 28,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  
  detailsRow: {
    gap: 12,
  },
  
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  
  detailText: {
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    flex: 1,
  },
  
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  sectionCard: {
    marginHorizontal: 20,
    marginTop: -40,
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