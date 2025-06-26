import { ContactItem } from "@/components/contacts/ContactItem";
import { SearchBar } from "@/components/contacts/SearchBar";
import ContactSkeleton from "@/components/skeletons/ContactSkeleton";
import { useAppTheme } from "@/context/ThemeContext";
import ContactBackgroundService from "@/services/contactBackgroundService";
import {
    useContacts,
    useContactStore,
    useIsCheckingContacts,
} from "@/store/useContactStore";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import * as SMS from "expo-sms";
import { debounce } from "lodash";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from "react-native";

interface DeviceContact {
  id: string;
  name?: string;
  phoneNumbers?: Contacts.PhoneNumber[];
  imageAvailable?: boolean;
  image?: Contacts.Image;
}

interface ContactWithRegistration extends DeviceContact {
  isRegistered: boolean;
  userData?: any;
}

export default function ContactsScreen() {
  const theme = useAppTheme();
  const colorScheme = theme.isDark ? "dark" : "light";
  const appColors = useMemo(
    () => ({
      text: theme.text,
      background: theme.background,
      tint: theme.tint,
      icon: theme.icon,
      card: theme.card,
      border: theme.border,
      success: theme.success,
      accent: theme.accent,
    }),
    [theme]
  );

  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {checkContactRegistration} = useContactStore((state)=> state)

  // Contact store hooks - use stable selectors
  const contacts = useContacts();
  const isCheckingContacts = useIsCheckingContacts();

  // Use refs to prevent infinite loops
  const contactServiceRef = useRef<ContactBackgroundService | null>(null);
  const hasCheckedContactsRef = useRef(false);

  const cleanPhoneNumber = useCallback((number?: string) => {
    return number?.replace(/\D/g, '') || '';
  }, []);

  // New: Contact check handler with proper debouncing
  const handleContactCheck = useCallback(
    debounce((phoneNumber: string) => {
      if (phoneNumber.length >= 7) { // Minimum valid phone number length
        checkContactRegistration(phoneNumber);
      }
    }, 500),
    []
  );


  const handleInvite = useCallback(async (contact: ContactWithRegistration) => {
    if (!contact.phoneNumbers?.[0]?.number) return;
    console.log("inviting ---- ", contact.phoneNumbers[0].digits)

    const phoneNumber = contact.phoneNumbers[0].number.replace(/\D/g, "");

    // Check registration before sending invite
    const isRegistered = await checkContactRegistration(phoneNumber);
    if (isRegistered) {
      // Optionally, show a toast or update UI to reflect registration
      return;
    }

    const message = `Hey! Join me on Vellagram - the new way to connect and share moments. Download the app now!`;
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync([phoneNumber], message);
      } else {
        console.log("SMS is not available on this device");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  }, []);

  const handleChat = useCallback((userId: string) => {
    router.push(`/conversation/${userId}`);
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const service = ContactBackgroundService.getInstance();
      await service.checkUnregisteredContacts();
    } catch (error) {
      console.error("Error refreshing contacts:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initialize contact service once
  const initializeContactService = useCallback(async () => {
    if (contactServiceRef.current) return contactServiceRef.current;

    const service = ContactBackgroundService.getInstance();
    await service.startBackgroundSync(30);
    contactServiceRef.current = service;
    return service;
  }, []);

  // Load device contacts only once
  const loadDeviceContacts = useCallback(async () => {
    console.log("🔄 loadDeviceContacts called, isInitialized:", isInitialized);
    if (isInitialized) {
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Requesting contact permissions...");
      const { status } = await Contacts.requestPermissionsAsync();
      console.log("📱 Contact permission status:", status);

      if (status === "granted") {
        console.log("✅ Permission granted, loading contacts...");
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image,
          ],
        });

        console.log("📱 Raw contacts data length:", data.length);

        const formattedContacts: DeviceContact[] = data.map((contact) => ({
          id: contact.id || Math.random().toString(),
          name: contact.name,
          phoneNumbers: contact.phoneNumbers,
          imageAvailable: contact.imageAvailable,
          image: contact.image,
        }));

        setDeviceContacts(formattedContacts);
        setIsInitialized(true);

        // Initialize contact service (this will handle background checking)
        console.log(
          "🚀 Initializing contact service for background checking..."
        );
        try {
          await initializeContactService();
        } catch (error) {
          console.warn(
            "⚠️ Contact service initialization failed, but continuing with contact display:",
            error
          );
        }

        console.log("🔄 Loaded", formattedContacts.length, "device contacts");
        console.log(
          "✅ Contact registration checking will happen in background"
        );
      } else {
        console.log("❌ Permission denied");
        setError("Permission to access contacts was denied");
      }
    } catch (err) {
      console.error("❌ Error in loadDeviceContacts:", err);
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [isInitialized, initializeContactService]);

  // Load contacts on mount
  useEffect(() => {
    loadDeviceContacts();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Loading timeout reached, forcing loading to false");
        setLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [loadDeviceContacts, loading]);

  // Merge device contacts with contact store data and filter based on search
  const filteredContacts = useMemo(() => {
    const mergedContacts: ContactWithRegistration[] = deviceContacts.map(
      (deviceContact) => {
        const phoneNumber = deviceContact.phoneNumbers?.[0]?.number;
        if (!phoneNumber) return { ...deviceContact, isRegistered: false };

        const cleanPhone = phoneNumber.replace(/\D/g, "");
        const storedContact = contacts.find(
          (c) => c.phoneNumber === cleanPhone
        );

        return {
          ...deviceContact,
          isRegistered: storedContact?.isRegistered || false,
          userData: storedContact?.userData,
        };
      }
    );

    // Filter based on search query
    if (searchQuery.trim() === "") {
      return mergedContacts;
    } else {
      return mergedContacts.filter((contact) =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [deviceContacts, contacts, searchQuery]);

  // Get recently checked contacts
  const recentlyCheckedContacts = useMemo(() => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000; // 1 hour ago

    return contacts
      .filter((contact) => contact.lastChecked > oneHourAgo)
      .sort((a, b) => b.lastChecked - a.lastChecked)
      .slice(0, 5); // Show only 5 most recent
  }, [contacts]);

  const renderItem = useCallback(
    ({ item }: { item: ContactWithRegistration }) => {
      // Extract first valid phone number
      const phoneNumber = item.phoneNumbers?.[0]?.number;
      const cleanPhone = cleanPhoneNumber(phoneNumber);
      
      // Trigger API check only when needed
      if (cleanPhone && !item.isRegistered) {
        handleContactCheck(cleanPhone);
      }

      return (
        <ContactItem
          contact={item}
          appColors={appColors}
          onInvite={handleInvite}
          onChat={handleChat}
          isChecking={isCheckingContacts}
        />
      );
    },
    [appColors, handleInvite, handleChat, isCheckingContacts, cleanPhoneNumber, handleContactCheck]
  );

  const keyExtractor = useCallback(
    (item: ContactWithRegistration) => item.id,
    []
  );

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Recently Checked Section */}
        {recentlyCheckedContacts.length > 0 && (
          <View
            style={[styles.recentSection, { backgroundColor: appColors.card }]}
          >
            {recentlyCheckedContacts.map((contact) => {
              const deviceContact = deviceContacts.find((dc) => {
                const phoneNumber = dc.phoneNumbers?.[0]?.number;
                if (!phoneNumber) return false;
                const cleanPhone = phoneNumber.replace(/\D/g, "");
                return cleanPhone === contact.phoneNumber;
              });

              if (!deviceContact) return null;

              return (
                <ContactItem
                  key={contact.phoneNumber}
                  contact={contact as any}
                  appColors={appColors}
                  onInvite={handleInvite}
                  onChat={handleChat}
                  isChecking={isCheckingContacts}
                />
              );
            })}
          </View>
        )}
      </View>
    ),
    [
      recentlyCheckedContacts,
      deviceContacts,
      appColors,
      handleInvite,
      handleChat,
      isCheckingContacts,
    ]
  );

  const debouncedSearch = debounce((query: string, deviceContacts: DeviceContact[], contacts: any[]) => {
    if (!query || query.length < 2) return;
    const normalizedQuery = query.replace(/\D/g, '').toLowerCase();

    // Find matching device contacts by name or phone number
    const matches = deviceContacts.filter(contact => {
      const nameMatch = contact.name?.toLowerCase().includes(query.toLowerCase());
      const phoneMatch = contact.phoneNumbers?.some(pn =>
        pn.number?.replace(/\D/g, '').includes(normalizedQuery)
      );
      return nameMatch || phoneMatch;
    });

    // For each match, check registration if not already registered or recently checked
    matches.forEach(contact => {
      const phoneNumber = contact.phoneNumbers?.[0]?.number?.replace(/\D/g, '');
      if (!phoneNumber) return;
      const existingContact = contacts.find(c => c.phoneNumber === phoneNumber);
      // If already registered or checked recently, skip
      if (existingContact?.isRegistered) return;
      if (existingContact && (Date.now() - existingContact.lastChecked) < 24 * 60 * 60 * 1000) return;
      useContactStore.getState().checkContactRegistration(phoneNumber);
    });
  }, 500);

  if (loading) {
    console.log(
      "🔄 Showing loading state, deviceContacts length:",
      deviceContacts.length
    );
    return (
      <View
        style={[styles.container, { backgroundColor: appColors.background }]}
      >
        <SearchBar
        value={searchQuery}
        onChangeText={text => {
          setSearchQuery(text);
          debouncedSearch(text, deviceContacts, contacts);
        }}
        appColors={appColors}
        isChecking={isCheckingContacts}
      />
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <ContactSkeleton />}
          keyExtractor={(item) => item.toString()}
        />
      </View>
    );
  }

  console.log(
    "📱 Rendering contacts screen, deviceContacts length:",
    deviceContacts.length,
    "filteredContacts length:",
    filteredContacts.length
  );

  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: appColors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: appColors.text }]}>
          {error}
        </Text>
      </View>
    );
  }

  // Show contacts even if no stored contacts yet, as long as device contacts are loaded
  if (deviceContacts.length === 0 && !loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: appColors.background },
        ]}
      >
        <Text style={[styles.errorText, { color: appColors.text }]}>
          No contacts found. Please check your contact permissions.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <SearchBar
        value={searchQuery}
        onChangeText={text => {
          setSearchQuery(text);
          debouncedSearch(text, deviceContacts, contacts);
        }}
        appColors={appColors}
        isChecking={isCheckingContacts}
      />
      <FlatList
        data={filteredContacts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

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
