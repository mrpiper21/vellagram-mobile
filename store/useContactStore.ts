import { checkPhoneNumberRegisteration } from "@/services/contact.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ContactUser {
    id: string;
    phoneNumber: string;
    name?: string;
    avatar?: string;
    isRegistered: boolean;
    userData?: any;
    lastChecked: number;
}

interface ContactState {
    contacts: ContactUser[];
    isChecking: boolean;
    lastSyncTime: number | null;
    
    // Actions
    addContact: (contact: Omit<ContactUser, 'lastChecked'>) => void;
    updateContact: (phoneNumber: string, updates: Partial<ContactUser>) => void;
    removeContact: (phoneNumber: string) => void;
    clearContacts: () => void;
    
    // Background checking
    checkContactRegistration: (phoneNumber: string) => Promise<boolean>;
    checkMultipleContacts: (phoneNumbers: string[]) => Promise<void>;
    syncContactsInBackground: () => Promise<void>;
    
    // Getters
    getRegisteredContacts: () => ContactUser[];
    getContactByPhone: (phoneNumber: string) => ContactUser | undefined;
    isContactRegistered: (phoneNumber: string) => boolean;
    getUnregisteredContactsToCheck: () => string[];
}

const CONTACT_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const BATCH_CHECK_DELAY = 1000; // 1 second between API calls to avoid rate limiting

export const useContactStore = create<ContactState>()(
    persist(
        (set, get) => ({
            contacts: [],
            isChecking: false,
            lastSyncTime: null,

            addContact: (contact) => {
                const { contacts } = get();
                const existingIndex = contacts.findIndex(c => c.phoneNumber === contact.phoneNumber);
                
                if (existingIndex >= 0) {
                    // Update existing contact only if there are actual changes
                    const existingContact = contacts[existingIndex];
                    const hasChanges = Object.keys(contact).some(key => 
                        existingContact[key as keyof typeof existingContact] !== contact[key as keyof typeof contact]
                    );
                    
                    if (hasChanges) {
                        const updatedContacts = [...contacts];
                        updatedContacts[existingIndex] = {
                            ...updatedContacts[existingIndex],
                            ...contact,
                            lastChecked: Date.now()
                        };
                        set({ contacts: updatedContacts });
                    }
                } else {
                    // Add new contact
                    set({
                        contacts: [...contacts, { ...contact, lastChecked: Date.now() }]
                    });
                }
            },

            updateContact: (phoneNumber, updates) => {
                const { contacts } = get();
                const updatedContacts = contacts.map(contact =>
                    contact.phoneNumber === phoneNumber
                        ? { ...contact, ...updates, lastChecked: Date.now() }
                        : contact
                );
                set({ contacts: updatedContacts });
            },

            removeContact: (phoneNumber) => {
                const { contacts } = get();
                set({
                    contacts: contacts.filter(contact => contact.phoneNumber !== phoneNumber)
                });
            },

            clearContacts: () => {
                set({ contacts: [], lastSyncTime: null });
            },

            checkContactRegistration: async (phoneNumber) => {
                const { contacts, updateContact } = get();
                const cleanPhone = phoneNumber.replace(/\D/g, '');
                
                // Check if we have a recent result
                const existingContact = contacts.find(c => c.phoneNumber === cleanPhone);
                
                if (existingContact) {
                    // If already registered, don't check again
                    if (existingContact.isRegistered) {
                        console.log("✅ Contact already registered, skipping:", cleanPhone);
                        return true;
                    }
                    
                    // If checked recently (within 24 hours), don't check again
                    if ((Date.now() - existingContact.lastChecked) < CONTACT_CHECK_INTERVAL) {
                        console.log("✅ Using cached result for:", cleanPhone);
                        return existingContact.isRegistered;
                    }
                }

                console.log("🔍 Checking phone registration for:", cleanPhone);
                
                try {
                    const result = await checkPhoneNumberRegisteration(cleanPhone);
                    
                    console.log("📱 Registration result for", cleanPhone, ":", result.isResgistered);
                    
                    updateContact(cleanPhone, {
                        phoneNumber: cleanPhone,
                        isRegistered: result.isResgistered,
                        userData: result.data,
                        lastChecked: Date.now()
                    });

                    return result.isResgistered;
                } catch (error) {
                    console.error(`❌ Error checking registration for ${cleanPhone}:`, error);
                    
                    // If we have cached data, return it
                    if (existingContact) {
                        return existingContact.isRegistered;
                    }
                    
                    return false;
                }
            },

            checkMultipleContacts: async (phoneNumbers) => {
                const { isChecking } = get();
                
                if (isChecking) {
                    console.log("⏳ Already checking contacts, skipping...");
                    return;
                }

                console.log("🚀 Starting batch contact check for", phoneNumbers.length, "contacts");
                set({ isChecking: true });

                try {
                    for (const phoneNumber of phoneNumbers) {
                        await get().checkContactRegistration(phoneNumber);
                        // Add delay between API calls to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, BATCH_CHECK_DELAY));
                    }
                    console.log("✅ Batch contact check completed");
                } catch (error) {
                    console.error("❌ Error checking multiple contacts:", error);
                } finally {
                    set({ isChecking: false });
                }
            },

            syncContactsInBackground: async () => {
                const { contacts, lastSyncTime, isChecking } = get();
                
                // Don't sync if already checking or if synced recently (within 1 hour)
                if (isChecking || (lastSyncTime && (Date.now() - lastSyncTime) < 60 * 60 * 1000)) {
                    return;
                }

                set({ isChecking: true });

                try {
                    // Get contacts that need updating (older than 24 hours)
                    const contactsToUpdate = contacts.filter(
                        contact => (Date.now() - contact.lastChecked) > CONTACT_CHECK_INTERVAL
                    );

                    if (contactsToUpdate.length > 0) {
                        const phoneNumbers = contactsToUpdate.map(c => c.phoneNumber);
                        await get().checkMultipleContacts(phoneNumbers);
                    }

                    set({ lastSyncTime: Date.now() });
                } catch (error) {
                    console.error("Error syncing contacts in background:", error);
                } finally {
                    set({ isChecking: false });
                }
            },

            getRegisteredContacts: () => {
                const { contacts } = get();
                return contacts.filter(contact => contact.isRegistered);
            },

            getContactByPhone: (phoneNumber) => {
                const { contacts } = get();
                const cleanPhone = phoneNumber.replace(/\D/g, '');
                return contacts.find(contact => contact.phoneNumber === cleanPhone);
            },

            isContactRegistered: (phoneNumber) => {
                const contact = get().getContactByPhone(phoneNumber);
                return contact?.isRegistered || false;
            },

            getUnregisteredContactsToCheck: () => {
                const { contacts } = get();
                const unregisteredContacts = contacts.filter(contact => !contact.isRegistered);
                return unregisteredContacts.map(contact => contact.phoneNumber);
            },
        }),
        {
            name: "contact-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                contacts: state.contacts,
                lastSyncTime: state.lastSyncTime,
            }),
        }
    )
);

// Export convenience hooks
export const useContacts = () => useContactStore((state) => state.contacts);
export const useRegisteredContacts = () => useContactStore((state) => state.getRegisteredContacts());
export const useIsCheckingContacts = () => useContactStore((state) => state.isChecking);
export const useContactActions = () => useContactStore((state) => ({
    addContact: state.addContact,
    updateContact: state.updateContact,
    removeContact: state.removeContact,
    clearContacts: state.clearContacts,
    checkContactRegistration: state.checkContactRegistration,
    checkMultipleContacts: state.checkMultipleContacts,
    syncContactsInBackground: state.syncContactsInBackground,
})); 