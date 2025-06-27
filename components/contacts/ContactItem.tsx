

import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ContactItemProps {
  contact: {
    id: string;
    name?: string;
    phoneNumbers?: { number: string }[];
    image?: { uri: string };
    isRegistered: boolean;
    userData?: any;
    imageAvailable?: boolean;
  };
  appColors: any;
  onInvite: (contact: any) => void;
  onChat: (userId: string) => void;
  isChecking: boolean;
}

export const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  appColors,
  onInvite,
  onChat,
  isChecking,
}) => {
  const phoneNumber = contact.phoneNumbers?.[0]?.number || "";
  const avatarText = contact.name ? contact.name[0].toUpperCase() : "?";
  const {theme} = useTheme();
  
  // Check if we have valid user data for registered users
  const isRegisteredWithData = contact.isRegistered && contact.userData?.id;
  
  // Extract user ID safely
  const userId = contact.userData?.id || contact.userData?._id;

  return (
    <View style={[styles.contactItem, { borderBottomColor: appColors.border }]}> 
      <View style={styles.contactInfo}>
        {contact.imageAvailable && contact.image?.uri ? (
          <Image source={{ uri: contact.image.uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.tint }]}> 
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>
        )}
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
            {contact.name || "Unknown"}
          </Text>
          <Text style={[styles.phoneNumber, { color: theme.icon }]} numberOfLines={1}>
            {phoneNumber}
          </Text>
        </View>
      </View>
      
      {isRegisteredWithData ? (
        <TouchableOpacity
          style={[styles.actionButton, {borderColor: theme.text}]}
          onPress={() => userId && onChat(userId)}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Chat</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, {borderColor: theme.accent}]}
          onPress={() => onInvite(contact)}
          disabled={isChecking}
        >
          <Text style={[styles.buttonText, { color: theme.accent}]}>
            {isChecking ? 'Checking...' : 'Invite'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 82,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
  },
  checkingIndicator: {
    marginLeft: 8,
  },
}); 