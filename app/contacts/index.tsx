import { IUser } from '@/@types/user-auth-types';
import { ContactItem } from '@/components/contacts/ContactItem';
import { SearchBar } from '@/components/contacts/SearchBar';
import ContactSkeleton from '@/components/skeletons/ContactSkeleton';
import { useAppTheme } from '@/context/ThemeContext';
import { useUserInactivity } from '@/context/UserInactivityContext';
import { normalizeIdentifiers } from '@/helpers/normalizeIdentifiers';
import { useContactStore } from '@/store/useContactStore';
import { router } from 'expo-router';
import * as SMS from 'expo-sms';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

// Type definitions
interface PhoneNumber {
  number: string;
  digits?: string;
}

interface DeviceContact {
  id: string;
  name?: string;
  phoneNumbers?: PhoneNumber[];
  image?: { uri: string };
  isRegistered?: boolean;
  userData?: any;
}

type ContactWithRegistration = DeviceContact & { 
  isRegistered: boolean; 
  userData?: any 
};

const ContactsScreen = () => {
  const theme = useAppTheme();
  const appColors = useMemo(() => ({
    text: theme.text,
    background: theme.background,
    tint: theme.tint,
    icon: theme.icon,
    card: theme.card,
    border: theme.border,
    success: theme.success,
    accent: theme.accent,
  }), [theme]);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { allUsers } = useUserInactivity();

  const userMap = useMemo(() => {
    const map = new Map<string, IUser>();
    if (!allUsers) return map;

    allUsers.forEach(user => {
      const normalizedNumbers = normalizeIdentifiers(user.phone);
      normalizedNumbers.forEach(num => {
        if (!map.has(num)) {
          map.set(num, user);
        }
      });
    });
    return map;
  }, [allUsers]);


  const { contacts: storedContacts, isChecking, syncContactsInBackground } = useContactStore();
  
  const deviceContacts = useMemo<ContactWithRegistration[]>(() => {
    return storedContacts.map(sc => {
      const normalizedPhone = normalizeIdentifiers(sc.phoneNumber)[0];
      const matchingUser = userMap.get(normalizedPhone);
      
      return {
        id: sc.id,
        name: sc.name,
        phoneNumbers: sc.phoneNumber ? [{ number: sc.phoneNumber }] : [],
        image: sc.avatar ? { uri: sc.avatar } : undefined,
        isRegistered: !!matchingUser,
        userData: matchingUser
      };
    });
  }, [storedContacts, userMap]);

  // Handle contact invitation
  const handleInvite = useCallback(async (contact: ContactWithRegistration) => {
    if (!contact.phoneNumbers?.[0]?.number) return;
    
    const phoneNumber = contact.phoneNumbers[0].number.replace(/\D/g, "");
    const message = `Hey! Join me on our app - the new way to connect. Download now!`;

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync([phoneNumber], message);
      } else {
        console.log("SMS not available");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  }, []);

  // Handle starting a chat
  const handleChat = useCallback((userId: string) => {
    router.push(`/conversation/${userId}`);
  }, []);

  // Search handling with debouncing
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, []);

  const debouncedSearch = useCallback(debounce((query: string) => {
    if (query.length > 2) {
      syncContactsInBackground();
    }
  }, 500), [syncContactsInBackground]);

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return deviceContacts;

    const normalizedQuery = searchQuery.toLowerCase().replace(/\D/g, '');
    return deviceContacts.filter(contact => {
      const contactName = contact.name?.toLowerCase() || '';
      const contactPhone = contact.phoneNumbers?.[0]?.number.replace(/\D/g, '') || '';
      
      return contactName.includes(searchQuery.toLowerCase()) || 
             contactPhone.includes(normalizedQuery);
    });
  }, [deviceContacts, searchQuery]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncContactsInBackground();
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh contacts');
    } finally {
      setRefreshing(false);
    }
  }, [syncContactsInBackground]);

  // Render contact items efficiently
  const renderItem = useCallback(({ item }: { item: ContactWithRegistration }) => (
    <ContactItem
      contact={item}
      appColors={appColors}
      onInvite={() => handleInvite(item)}
      onChat={() => item.userData?.id && handleChat(item.userData.id)}
      isChecking={isChecking}
    />
  ), [appColors, isChecking, handleInvite, handleChat]);

  const keyExtractor = useCallback((item: ContactWithRegistration, index: number) => `${item.id}-${index}`, []);

  // Load contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        await syncContactsInBackground();
      } catch (err) {
        setError('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Empty state handling
  if (storedContacts.length === 0 && !loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: appColors.background }]}>
        <Text style={[styles.errorText, { color: appColors.text }]}>
          {error || 'No contacts found. Please check your contact permissions.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        appColors={appColors}
        isChecking={isChecking}
      />
      
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <ContactSkeleton />}
          keyExtractor={item => item.toString() + 1}
        />
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: appColors.text }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={15}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={appColors.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text style={[styles.errorText, { color: appColors.text }]}>
                No contacts match your search
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
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
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },
  loadingIndicator: {
    marginLeft: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
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
  recentSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
});

export default ContactsScreen