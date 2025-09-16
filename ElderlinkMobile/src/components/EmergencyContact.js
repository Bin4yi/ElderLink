import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

import Card from './common/Card';

/**
 * Emergency Contact component for displaying contact information
 * Optimized for elderly users with large touch targets and clear actions
 */
const EmergencyContact = ({
  contact,
  onEdit,
  onDelete,
  showActions = true,
  style
}) => {
  if (!contact) return null;

  const { name, phone, relationship, email, isPrimary } = contact;

  const handleCall = () => {
    if (!phone) return;
    
    Alert.alert(
      'Call Contact',
      `Do you want to call ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${phone}`)
        }
      ],
      { cancelable: true }
    );
  };

  const handleSMS = () => {
    if (!phone) return;
    
    Alert.alert(
      'Send Message',
      `Do you want to send a message to ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Message', 
          onPress: () => Linking.openURL(`sms:${phone}`)
        }
      ],
      { cancelable: true }
    );
  };

  const handleEmail = () => {
    if (!email) return;
    
    Alert.alert(
      'Send Email',
      `Do you want to send an email to ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL(`mailto:${email}`)
        }
      ],
      { cancelable: true }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to remove ${name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete && onDelete(contact.id)
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <Card
      style={[
        styles.card,
        isPrimary && styles.primaryCard,
        style
      ]}
    >
      {/* Header with name and primary indicator */}
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          {isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>Primary</Text>
            </View>
          )}
        </View>
        
        {showActions && onEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(contact)}
          >
            <Ionicons name="pencil" size={20} color={COLORS.gray600} />
          </TouchableOpacity>
        )}
      </View>

      {/* Relationship */}
      <View style={styles.infoRow}>
        <Ionicons name="people" size={20} color={COLORS.textSecondary} />
        <Text style={styles.relationship}>{relationship}</Text>
      </View>

      {/* Phone */}
      <View style={styles.infoRow}>
        <Ionicons name="call" size={20} color={COLORS.textSecondary} />
        <Text style={styles.phone}>{phone}</Text>
      </View>

      {/* Email */}
      {email && (
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
          <Text style={styles.email}>{email}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCall}
        >
          <Ionicons name="call" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton]}
          onPress={handleSMS}
        >
          <Ionicons name="chatbubble" size={20} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Message</Text>
        </TouchableOpacity>

        {email && (
          <TouchableOpacity
            style={[styles.actionButton, styles.emailButton]}
            onPress={handleEmail}
          >
            <Ionicons name="mail" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Email</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Delete Button */}
      {showActions && onDelete && (
        <View style={styles.deleteContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={18} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Remove Contact</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  
  primaryCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  name: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: 12,
  },
  
  primaryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  primaryText: {
    fontSize: 12,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.white,
  },
  
  editButton: {
    padding: 8,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  relationship: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    marginLeft: 12,
    textTransform: 'capitalize',
  },
  
  phone: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  email: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  actionContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
  },
  
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  
  callButton: {
    backgroundColor: COLORS.success,
  },
  
  messageButton: {
    backgroundColor: COLORS.info,
  },
  
  emailButton: {
    backgroundColor: COLORS.gray600,
  },
  
  deleteContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: 'transparent',
  },
  
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.error,
    marginLeft: 8,
  },
});

export default EmergencyContact;