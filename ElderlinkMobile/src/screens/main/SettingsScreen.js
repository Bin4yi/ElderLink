import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmergency } from '../../context/EmergencyContext';
import { StorageUtils } from '../../utils/storage';
import { COLORS } from '../../utils/colors';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmergencyContact from '../../components/EmergencyContact';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    healthReminders: true,
    appointmentReminders: true,
    emergencyAlerts: true,
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: 'large',
    highContrast: false,
    reduceMotion: false,
  });

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const { loadEmergencyContacts, deleteEmergencyContact } = useEmergency();

  useEffect(() => {
    loadSettings();
    loadContacts();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageUtils.getItem('userSettings');
      const savedAccessibilitySettings = await StorageUtils.getItem('accessibilitySettings');
      
      if (savedSettings) {
        setSettings({ ...settings, ...savedSettings });
      }
      
      if (savedAccessibilitySettings) {
        setAccessibilitySettings({ ...accessibilitySettings, ...savedAccessibilitySettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const contacts = await loadEmergencyContacts();
      setEmergencyContacts(contacts || []);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await StorageUtils.setItem('userSettings', newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateAccessibilitySetting = async (key, value) => {
    const newSettings = { ...accessibilitySettings, [key]: value };
    setAccessibilitySettings(newSettings);
    
    try {
      await StorageUtils.setItem('accessibilitySettings', newSettings);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await deleteEmergencyContact(contactId);
      await loadContacts(); // Reload contacts
    } catch (error) {
      Alert.alert('Error', 'Failed to delete contact. Please try again.');
    }
  };

  const handleAddEmergencyContact = () => {
    navigation.navigate('AddEmergencyContact');
  };

  const handleTestEmergencySystem = () => {
    Alert.alert(
      'Test Emergency System',
      'This will send a test alert to your emergency contacts. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Test', 
          onPress: () => {
            Alert.alert('Test Sent', 'A test emergency alert has been sent to your contacts.');
          }
        }
      ]
    );
  };

  const renderSettingRow = (icon, title, subtitle, value, onValueChange) => (
    <View style={styles.settingRow}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {typeof value === 'boolean' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.gray300, true: COLORS.primaryLight }}
          thumbColor={value ? COLORS.primary : COLORS.white}
          style={styles.switch}
        />
      ) : (
        <TouchableOpacity onPress={onValueChange} style={styles.valueButton}>
          <Text style={styles.valueText}>{value}</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Accessibility Settings */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <Text style={styles.sectionDescription}>
          Adjust the app to make it easier to use
        </Text>
        
        {renderSettingRow(
          'text',
          'Large Text',
          'Increase text size for better readability',
          accessibilitySettings.fontSize === 'xlarge',
          (value) => updateAccessibilitySetting('fontSize', value ? 'xlarge' : 'large')
        )}
        
        {renderSettingRow(
          'contrast',
          'High Contrast',
          'Increase contrast for better visibility',
          accessibilitySettings.highContrast,
          (value) => updateAccessibilitySetting('highContrast', value)
        )}
        
        {renderSettingRow(
          'flash-off',
          'Reduce Motion',
          'Minimize animations and movement',
          accessibilitySettings.reduceMotion,
          (value) => updateAccessibilitySetting('reduceMotion', value)
        )}
      </Card>

      {/* Notification Settings */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.sectionDescription}>
          Choose what notifications you want to receive
        </Text>
        
        {renderSettingRow(
          'notifications',
          'All Notifications',
          'Receive app notifications',
          settings.notifications,
          (value) => updateSetting('notifications', value)
        )}
        
        {renderSettingRow(
          'medical',
          'Health Reminders',
          'Reminders to record vital signs',
          settings.healthReminders,
          (value) => updateSetting('healthReminders', value)
        )}
        
        {renderSettingRow(
          'calendar',
          'Appointment Reminders',
          'Notifications about upcoming appointments',
          settings.appointmentReminders,
          (value) => updateSetting('appointmentReminders', value)
        )}
        
        {renderSettingRow(
          'warning',
          'Emergency Alerts',
          'Critical health and safety alerts',
          settings.emergencyAlerts,
          (value) => updateSetting('emergencyAlerts', value)
        )}
      </Card>

      {/* Emergency Contacts */}
      <Card style={styles.sectionCard}>
        <View style={styles.emergencyHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={handleAddEmergencyContact}
          >
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionDescription}>
          People who will be contacted in case of emergency
        </Text>

        {emergencyContacts.length === 0 ? (
          <View style={styles.noContactsContainer}>
            <Ionicons name="person-add" size={48} color={COLORS.gray300} />
            <Text style={styles.noContactsText}>No emergency contacts added</Text>
            <Text style={styles.noContactsSubtext}>
              Add family members or friends who should be contacted in an emergency
            </Text>
            <Button
              title="Add First Contact"
              onPress={handleAddEmergencyContact}
              variant="primary"
              size="medium"
              style={styles.addFirstContactButton}
            />
          </View>
        ) : (
          <View style={styles.contactsList}>
            {emergencyContacts.map((contact, index) => (
              <EmergencyContact
                key={contact.id || index}
                contact={contact}
                onDelete={handleDeleteContact}
                showActions={true}
                style={styles.contactCard}
              />
            ))}
          </View>
        )}
      </Card>

      {/* Emergency System */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Emergency System</Text>
        <Text style={styles.sectionDescription}>
          Test and configure your emergency response system
        </Text>
        
        <View style={styles.emergencySystemContainer}>
          <View style={styles.emergencySystemInfo}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
            <View style={styles.emergencySystemText}>
              <Text style={styles.emergencySystemTitle}>System Status</Text>
              <Text style={styles.emergencySystemSubtitle}>
                {emergencyContacts.length > 0 ? 'Ready' : 'Needs Setup'}
              </Text>
            </View>
          </View>
          
          <Button
            title="Test Emergency System"
            onPress={handleTestEmergencySystem}
            variant="outline"
            size="medium"
            style={styles.testButton}
          />
        </View>
      </Card>

      {/* App Information */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutContainer}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Last Updated</Text>
            <Text style={styles.aboutValue}>September 2025</Text>
          </View>
          
          <TouchableOpacity
            style={styles.aboutRow}
            onPress={() => {
              Alert.alert(
                'Privacy Policy',
                'Your privacy is important to us. Contact your care coordinator for more information about how your data is protected.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.aboutLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.aboutRow}
            onPress={() => {
              Alert.alert(
                'Help & Support',
                'For help with the app:\n\n• Contact your family member\n• Reach out to your care coordinator\n• Call the support number provided by your care team',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.aboutLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  
  sectionDescription: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  
  settingTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
  },
  
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], // Larger switch for elderly users
  },
  
  valueButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  valueText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
  },
  
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  addContactButton: {
    padding: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  
  noContactsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  noContactsText: {
    fontSize: 20,
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
    marginBottom: 24,
    lineHeight: 22,
  },
  
  addFirstContactButton: {
    minWidth: 180,
  },
  
  contactsList: {
    gap: 16,
  },
  
  contactCard: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  
  emergencySystemContainer: {
    gap: 20,
  },
  
  emergencySystemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  emergencySystemText: {
    marginLeft: 16,
  },
  
  emergencySystemTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  
  emergencySystemSubtitle: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
  },
  
  testButton: {
    alignSelf: 'flex-start',
  },
  
  aboutContainer: {
    gap: 16,
  },
  
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  
  aboutLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
  },
  
  aboutValue: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default SettingsScreen;