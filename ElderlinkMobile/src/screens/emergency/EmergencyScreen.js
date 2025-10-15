import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';
import { COLORS } from '../../utils/colors';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Alert as CustomAlert } from '../../components/common/Alert';

const EmergencyScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { emergencyData, clearEmergency } = useEmergency();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState([]);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      // Load emergency contacts and assigned staff
      // This would typically come from your API
      setEmergencyContacts(emergencyData?.emergencyContacts || []);
      setAssignedStaff(emergencyData?.assignedStaff || []);
    } catch (error) {
      console.error('Error loading emergency data:', error);
    }
  };

  const handleCallEmergencyServices = () => {
    Alert.alert(
      'Call Emergency Services',
      'This will call 911 immediately. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call 911', 
          style: 'destructive',
          onPress: () => Linking.openURL('tel:911')
        }
      ]
    );
  };

  const handleCallContact = (contact) => {
    if (!contact.phone) return;
    
    Alert.alert(
      'Call Contact',
      `Call ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${contact.phone}`)
        }
      ]
    );
  };

  const handleDismissEmergency = () => {
    Alert.alert(
      'Dismiss Emergency Alert',
      'Are you sure you want to dismiss the emergency alert? This will notify your contacts that you are okay.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, I\'m Okay',
          onPress: () => {
            clearEmergency();
            navigation.navigate('Dashboard');
          }
        }
      ]
    );
  };

  const renderEmergencyContact = (contact, index) => (
    <TouchableOpacity
      key={contact.id || index}
      style={styles.contactItem}
      onPress={() => handleCallContact(contact)}
    >
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{contact.phone}</Text>
        <Text style={styles.contactRelation}>{contact.relationship}</Text>
      </View>
      <View style={styles.callButton}>
        <Ionicons name="call" size={24} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );

  const renderStaffMember = (staff, index) => (
    <TouchableOpacity
      key={staff.id || index}
      style={styles.staffItem}
      onPress={() => handleCallContact({ name: staff.name, phone: staff.phone })}
    >
      <View style={styles.staffInfo}>
        <Text style={styles.staffName}>{staff.name}</Text>
        <Text style={styles.staffRole}>{staff.role}</Text>
        <Text style={styles.staffPhone}>{staff.phone}</Text>
      </View>
      <View style={styles.callButton}>
        <Ionicons name="call" size={24} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View style={styles.container}>
      {/* Emergency Header */}
      <View style={styles.emergencyHeader}>
        <Ionicons 
          name="warning" 
          size={64} 
          color={COLORS.white} 
          style={styles.emergencyIcon}
        />
        <Text style={styles.emergencyTitle}>Emergency Alert Active</Text>
        <Text style={styles.emergencyTime}>{currentTime}</Text>
        <Text style={styles.emergencyStatus}>Help is on the way</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Emergency Services Card */}
        <Card style={styles.emergencyServicesCard}>
          <View style={styles.emergencyServicesHeader}>
            <Ionicons name="medical" size={32} color={COLORS.error} />
            <Text style={styles.emergencyServicesTitle}>Need Immediate Help?</Text>
          </View>
          <Text style={styles.emergencyServicesText}>
            If you need immediate medical attention or are in immediate danger, call 911 now.
          </Text>
          <Button
            title="Call 911"
            onPress={handleCallEmergencyServices}
            variant="danger"
            size="large"
            style={styles.emergencyButton}
          />
        </Card>

        {/* Alert Status */}
        {emergencyData && (
          <Card style={styles.statusCard}>
            <Text style={styles.statusTitle}>Alert Details</Text>
            <View style={styles.statusItem}>
              <Ionicons name="time" size={20} color={COLORS.textSecondary} />
              <Text style={styles.statusText}>
                Sent: {new Date(emergencyData.timestamp).toLocaleString()}
              </Text>
            </View>
            {emergencyData.location?.available && (
              <View style={styles.statusItem}>
                <Ionicons name="location" size={20} color={COLORS.textSecondary} />
                <Text style={styles.statusText}>
                  Location: {emergencyData.location.address?.formattedAddress || 'Location shared'}
                </Text>
              </View>
            )}
            <View style={styles.statusItem}>
              <Ionicons name="people" size={20} color={COLORS.textSecondary} />
              <Text style={styles.statusText}>
                {emergencyData.emergencyContacts?.length || 0} contacts notified
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="medical" size={20} color={COLORS.textSecondary} />
              <Text style={styles.statusText}>
                {emergencyData.assignedStaff?.length || 0} care staff notified
              </Text>
            </View>
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card style={styles.contactsCard}>
          <Text style={styles.contactsTitle}>Emergency Contacts</Text>
          <Text style={styles.contactsSubtitle}>
            Your family and friends have been notified. You can call them directly:
          </Text>
          
          {emergencyContacts.length > 0 ? (
            <View style={styles.contactsList}>
              {emergencyContacts.map(renderEmergencyContact)}
            </View>
          ) : (
            <View style={styles.noContactsMessage}>
              <Ionicons name="person-add" size={48} color={COLORS.gray300} />
              <Text style={styles.noContactsText}>No emergency contacts configured</Text>
              <Text style={styles.noContactsSubtext}>
                Add emergency contacts in Settings for faster access during emergencies.
              </Text>
            </View>
          )}
        </Card>

        {/* Care Staff */}
        {assignedStaff.length > 0 && (
          <Card style={styles.staffCard}>
            <Text style={styles.staffTitle}>Your Care Team</Text>
            <Text style={styles.staffSubtitle}>
              Your assigned care staff have been alerted:
            </Text>
            
            <View style={styles.staffList}>
              {assignedStaff.map(renderStaffMember)}
            </View>
          </Card>
        )}

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>What happens next?</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>
                Your emergency contacts and care team have been notified automatically
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>
                Someone will contact you or come to check on you shortly
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>
                If you need immediate medical help, call 911 using the button above
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4</Text>
              <Text style={styles.instructionText}>
                Stay calm and wait for help to arrive
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <Button
              title="I'm Okay Now"
              onPress={handleDismissEmergency}
              variant="success"
              size="large"
              style={styles.actionButton}
            />
            
            <Button
              title="Call 911"
              onPress={handleCallEmergencyServices}
              variant="danger"
              size="large"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.emergency?.background || COLORS.background,
  },
  
  emergencyHeader: {
    backgroundColor: COLORS.error,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  
  emergencyIcon: {
    marginBottom: 16,
  },
  
  emergencyTitle: {
    fontSize: 28,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emergencyTime: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  
  emergencyStatus: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  emergencyServicesCard: {
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  
  emergencyServicesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  emergencyServicesTitle: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.emergency?.text || COLORS.textPrimary,
    marginLeft: 12,
  },
  
  emergencyServicesText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.emergency?.text || COLORS.textPrimary,
    marginBottom: 20,
    lineHeight: 22,
  },
  
  emergencyButton: {
    marginBottom: 0,
  },
  
  statusCard: {
    marginBottom: 20,
  },
  
  statusTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statusText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  contactsCard: {
    marginBottom: 20,
  },
  
  contactsTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  
  contactsSubtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  
  contactsList: {
    gap: 12,
  },
  
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    padding: 16,
    borderRadius: 12,
  },
  
  contactInfo: {
    flex: 1,
  },
  
  contactName: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  
  contactPhone: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
    marginBottom: 2,
  },
  
  contactRelation: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
    opacity: 0.9,
  },
  
  callButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  
  noContactsMessage: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  
  noContactsText: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  
  noContactsSubtext: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  staffCard: {
    marginBottom: 20,
  },
  
  staffTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  
  staffSubtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  
  staffList: {
    gap: 12,
  },
  
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info,
    padding: 16,
    borderRadius: 12,
  },
  
  staffInfo: {
    flex: 1,
  },
  
  staffName: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  
  staffRole: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  
  staffPhone: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
  },
  
  instructionsCard: {
    marginBottom: 20,
  },
  
  instructionsTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  
  instructionsList: {
    gap: 16,
  },
  
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  instructionNumber: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 30,
    textAlign: 'center',
    marginTop: 2,
  },
  
  instructionText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  
  actionsCard: {
    marginBottom: 30,
  },
  
  actionsTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  
  actionButtons: {
    gap: 16,
  },
  
  actionButton: {
    marginBottom: 0,
  },
});

export default EmergencyScreen;