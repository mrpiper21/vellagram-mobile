import { normalizeIdentifiers } from "@/helpers/normalizeIdentifiers";
import { fetchAllUsers, initializeUserPhoneMap, isPhoneNumberRegistered, UserData } from "@/services/contact.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ContactUser {
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
  userIdentifierSet: Set<string> | null;
  
  // Actions
  batchAddContacts: (contacts: Omit<ContactUser, 'lastChecked'>[]) => void;
  updateFromUserList: (users: UserData[]) => void;
  syncContactsInBackground: () => Promise<void>;
  checkPhoneRegistration: (phoneNumber: string) => Promise<boolean>;
  clearContactCached: ()=>void
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: [],
      isChecking: false,
      lastSyncTime: null,
      userIdentifierSet: null,
      clearContactCached: ()=> {
        set({contacts: []})
      },

      batchAddContacts: (newContacts) => {
        const { contacts } = get();
        const contactMap = new Map(contacts.map(c => [c.phoneNumber, c]));
        let hasUpdates = false;

        newContacts.forEach(contact => {
          const existing = contactMap.get(contact.phoneNumber);
          if (existing) {
            // Only update if changes exist
            if (Object.keys(contact).some(key => 
              existing[key as keyof ContactUser] !== contact[key as keyof typeof contact]
            )) {
              contactMap.set(contact.phoneNumber, {
                ...existing,
                ...contact,
                lastChecked: Date.now()
              });
              hasUpdates = true;
            }
          } else {
            contactMap.set(contact.phoneNumber, {
              ...contact,
              lastChecked: Date.now()
            });
            hasUpdates = true;
          }
        });

        if (hasUpdates) {
          set({ contacts: Array.from(contactMap.values()) });
        }
      },

      updateFromUserList: (users: UserData[]) => {
        // Create optimized identifier map (phone -> user) using normalizeIdentifiers
        const userMap = new Map<string, UserData>();
        users.forEach(user => {
          normalizeIdentifiers(user.phone).forEach(id => userMap.set(id, user));
        });

        set(state => ({
          userIdentifierSet: new Set(userMap.keys()),
          contacts: state.contacts.map(contact => {
            const contactIds = normalizeIdentifiers(contact.phoneNumber);
            
            // Check if any contact ID matches a user phone
            const matchingPhone = contactIds.find(id => userMap.has(id));
            const isRegistered = !!matchingPhone;
            const userData = matchingPhone ? userMap.get(matchingPhone) : undefined;
            
            if (contact.isRegistered === isRegistered && contact.userData === userData) {
              return contact;
            }
            
            return {
              ...contact,
              name: contact.name,
              isRegistered,
              userData,
              lastChecked: Date.now()
            };
          })
        }));
      },
      
      syncContactsInBackground: async () => {
        const { isChecking, lastSyncTime, userIdentifierSet } = get();
        
        if (isChecking || (lastSyncTime && (Date.now() - lastSyncTime) < 60 * 60 * 1000)) {
          return;
        }

        set({ isChecking: true });

        try {
          // Initialize the efficient phone map with ETag support
          const [phoneMap, wasModified] = await initializeUserPhoneMap();
          
          // Only update if data was modified
          if (wasModified) {
            const [users, , ] = await fetchAllUsers();
            get().updateFromUserList(users);
            console.log("🔄 Updated contacts due to modified user data");
          } else {
            console.log("⏩ Skipped contact update - no data changes detected");
          }
          
          set({ lastSyncTime: Date.now() });
        } catch (error) {
          console.error("Background sync failed:", error);
        } finally {
          set({ isChecking: false });
        }
      },

      checkPhoneRegistration: async (phoneNumber) => {
        try {
          // Ensure the phone map is initialized
          await initializeUserPhoneMap();
          
          // Use O(1) hash map lookup instead of API call
          const registeredUser = isPhoneNumberRegistered(phoneNumber);
          return !!registeredUser;
        } catch (error) {
          console.error("Phone check error:", error);
          return false;
        }
      }
    }),
    {
      name: "contact-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        contacts: state.contacts,
        lastSyncTime: state.lastSyncTime,
        userIdentifierSet: state.userIdentifierSet 
          ? Array.from(state.userIdentifierSet) 
          : null
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as ContactState;
        return {
          ...currentState,
          ...state,
          userIdentifierSet: state.userIdentifierSet
            ? new Set(state.userIdentifierSet)
            : null
        };
      }
    }
  )
);

// Helper hooks
export const useContacts = () => useContactStore(state => state.contacts);
export const useIsCheckingContacts = () => useContactStore(state => state.isChecking);
export const useContactActions = () => useContactStore(state => ({
  syncContactsInBackground: state.syncContactsInBackground,
  checkPhoneRegistration: state.checkPhoneRegistration
}));

// Efficient contact lookup by user ID
export const useContactById = (userId: string) => {
  return useContactStore(state => {
    // Find contact by userData.id or userData._id
    return state.contacts.find(contact => 
      contact.userData?.id === userId || contact.userData?._id === userId
    );
  });
};

export const getContactById = (userId: string) => {
  const state = useContactStore.getState();
  return state.contacts.find(contact => 
    contact.userData?.id === userId || contact.userData?._id === userId
  );
};