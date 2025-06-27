import { IUser } from "@/@types/user-auth-types";
import useFormStore from "@/app/store/useFormStore";
import { normalizeIdentifiers } from "@/helpers/normalizeIdentifiers";
import { checkPhoneNumberRegisteration, fetchAllUsers } from "@/services/contact.service";
import { ContactUser, useContactStore } from "@/store/useContactStore";
import { useUserStore } from "@/store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const APP_STATE_KEY = "app_state";
const LOCK_TIME = 5 * 60 * 1000; // 5 minutes
const PHONE_CHECK_CACHE_KEY = "phone_check_cache";
const PHONE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes cache
const BATCH_SIZE = 10; // Process contacts in batches
const BATCH_DELAY = 100; // Delay between batches

interface PhoneCheckCache {
    [phoneNumber: string]: {
        isRegistered: boolean;
        timestamp: number;
        userData?: any;
    };
}

interface UserInactivityContextType {
    allUsers: IUser[] | null;
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
    checkInactivity: () => void;
    checkPhoneRegistration: (phoneNumber: string) => Promise<{ isRegistered: boolean; userData?: any }>;
    clearPhoneCheckCache: () => void;
    contactsProcessingStatus: {
        isProcessing: boolean;
        processed: number;
        total: number;
        currentBatch: number;
    };
}

const UserInactivityContext = createContext<UserInactivityContextType | undefined>(undefined);

export const UserInactivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [contactsProcessingStatus, setContactsProcessingStatus] = useState({
        isProcessing: false,
        processed: 0,
        total: 0,
        currentBatch: 0,
    });

    const user = useUserStore((state) => state.user);
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    const { formValues } = useFormStore();
    const [allUsers, setAllUsers] = useState<IUser[] | null>(null);
    
    // Cache and processing refs
    const phoneCheckCache = useRef<PhoneCheckCache>({});
    const pendingChecks = useRef<Set<string>>(new Set());
    const processingQueue = useRef<string[]>([]);
    const isProcessingRef = useRef(false);
    const userIdentifiersSet = useRef<Set<string>>(new Set());

    // Contact store methods
    const { batchAddContacts } = useContactStore();

    // Load cache and initialize on mount
    useEffect(() => {
        loadPhoneCheckCache();
        loadDeviceContacts();
    }, []);

    // Pre-compute user identifiers for faster lookups
    useEffect(() => {
        if (allUsers) {
            const identifiers = new Set<string>();
            allUsers.forEach(user => {
                normalizeIdentifiers(user.phone).forEach(id => identifiers.add(id));
                normalizeIdentifiers(user.email).forEach(id => identifiers.add(id));
            });
            userIdentifiersSet.current = identifiers;
            console.log("🔄 Pre-computed user identifiers:", identifiers.size);
        }
    }, [allUsers]);

    const loadPhoneCheckCache = async () => {
        try {
            const cached = await AsyncStorage.getItem(PHONE_CHECK_CACHE_KEY);
            if (cached) {
                phoneCheckCache.current = JSON.parse(cached);
                const now = Date.now();
                Object.keys(phoneCheckCache.current).forEach(phone => {
                    if (now - phoneCheckCache.current[phone].timestamp > PHONE_CHECK_INTERVAL) {
                        delete phoneCheckCache.current[phone];
                    }
                });
                console.log("📱 Loaded phone check cache:", Object.keys(phoneCheckCache.current).length, "entries");
            }
        } catch (error) {
            console.error("Error loading phone check cache:", error);
        }
    };

    const savePhoneCheckCache = async () => {
        try {
            await AsyncStorage.setItem(PHONE_CHECK_CACHE_KEY, JSON.stringify(phoneCheckCache.current));
        } catch (error) {
            console.error("Error saving phone check cache:", error);
        }
    };

    const processBatchedContacts = useCallback(async (contacts: Omit<ContactUser, 'lastChecked'>[]) => {
        if (isProcessingRef.current) {
            console.log("⚠️ Already processing contacts, skipping");
            return;
        }

        isProcessingRef.current = true;
        // setIsChecking(true);
        
        const totalBatches = Math.ceil(contacts.length / BATCH_SIZE);
        setContactsProcessingStatus({
            isProcessing: true,
            processed: 0,
            total: contacts.length,
            currentBatch: 0,
        });

        console.log(`🚀 Starting batch processing of ${contacts.length} contacts in ${totalBatches} batches`);

        try {
            for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
                const batch = contacts.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                
                console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} contacts)`);
                
                // Process batch with registration checks
                const processedBatch = await Promise.all(
                    batch.map(async (contact) => {
                        const registrationResult = await checkPhoneRegistration(contact.phoneNumber);
                        return {
                            ...contact,
                            isRegistered: registrationResult.isRegistered,
                            userData: registrationResult.userData,
                            lastChecked: Date.now(),
                        };
                    })
                );

                // Update store with processed batch
                batchAddContacts(processedBatch);

                // Update progress
                setContactsProcessingStatus(prev => ({
                    ...prev,
                    processed: Math.min(i + BATCH_SIZE, contacts.length),
                    currentBatch: batchNumber,
                }));

                // Small delay between batches to prevent overwhelming the system
                if (i + BATCH_SIZE < contacts.length) {
                    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
                }
            }

            console.log("✅ Completed batch processing of all contacts");
        } catch (error) {
            console.error("❌ Error in batch processing:", error);
        } finally {
            isProcessingRef.current = false;
            // setIsChecking(false);
            setContactsProcessingStatus({
                isProcessing: false,
                processed: 0,
                total: 0,
                currentBatch: 0,
            });
        }
    }, [ batchAddContacts]);

    const loadDeviceContacts = useCallback(async () => {
        if (!user?.id) return;
        
        try {
            console.log("🔐 Requesting contact permissions...");
            const { status } = await Contacts.requestPermissionsAsync();
            
            if (status !== "granted") {
                console.log("❌ Permission denied");
                return;
            }

            console.log("🚀 Loading users and device contacts in parallel...");
            
            // Parallelize fetching
            const [allUsersFromApi, { data: deviceContacts }] = await Promise.all([
                fetchAllUsers(),
                Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
                })
            ]);
            
            if (allUsersFromApi) {
                setAllUsers(allUsersFromApi);
                console.log("👥 Loaded", allUsersFromApi.length, "registered users");
            }
            
            // Process contacts for batch checking
            const contactsToProcess: Omit<ContactUser, 'lastChecked'>[] = [];
            
            for (const contact of deviceContacts) {
                contact.phoneNumbers?.forEach(phoneObj => {
                    const phone = phoneObj.number;
                    if (!phone) return;
                    
                    const normalized = normalizeIdentifiers(phone)[0];
                    if (!normalized) return;
                    
                    contactsToProcess.push({
                        id: `${contact.id}-${normalized}`,
                        phoneNumber: normalized,
                        name: contact.name,
                        avatar: contact.image?.uri,
                        isRegistered: false, // Will be determined in batch processing
                    });
                });
            }
            
            console.log(`📱 Prepared ${contactsToProcess.length} contacts for processing`);
            
            // Start batch processing in the background
            if (contactsToProcess.length > 0) {
                // Add contacts to store immediately (with isRegistered: false)
                batchAddContacts(contactsToProcess.map(c => ({ ...c, lastChecked: 0 })));
                
                // Then process them in batches
                setTimeout(() => {
                    processBatchedContacts(contactsToProcess);
                }, 500); // Small delay to let UI render first
            }
            
        } catch (error) {
            console.error("Contact loading error:", error);
        }
    }, [user?.id, batchAddContacts, processBatchedContacts]);

    // Optimized phone registration check
    const checkPhoneRegistration = useCallback(async (phoneNumber: string) => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        
        // Check cache first
        const cached = phoneCheckCache.current[cleanPhone];
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < PHONE_CHECK_INTERVAL) {
            return { 
                isRegistered: cached.isRegistered, 
                userData: cached.userData 
            };
        }
        
        // Use precomputed user set for faster lookup
        if (userIdentifiersSet.current.size > 0) {
            const normalized = normalizeIdentifiers(cleanPhone);
            const isInSet = normalized.some(id => userIdentifiersSet.current.has(id));
            
            if (isInSet && allUsers) {
                const match = allUsers.find(user => 
                    normalizeIdentifiers(user.phone).some(id => normalized.includes(id)) ||
                    normalizeIdentifiers(user.email).some(id => normalized.includes(id))
                );
                
                if (match) {
                    const result = { 
                        isRegistered: true, 
                        userData: match 
                    };
                    
                    // Update cache
                    phoneCheckCache.current[cleanPhone] = {
                        ...result,
                        timestamp: now
                    };
                    
                    return result;
                }
            }
        }
        
        // Fallback to API if not found in local data
        try {
            const result = await checkPhoneNumberRegisteration(cleanPhone);
            const apiResult = {
                isRegistered: result.isResgistered,
                userData: result.data
            };
            
            phoneCheckCache.current[cleanPhone] = {
                ...apiResult,
                timestamp: now
            };
            
            // Save cache periodically
            if (Object.keys(phoneCheckCache.current).length % 10 === 0) {
                savePhoneCheckCache();
            }
            
            return apiResult;
        } catch (error) {
            console.error("Phone check error:", error);
            return { 
                isRegistered: false, 
                userData: null 
            };
        }
    }, [allUsers]);

    // Clear cache function
    const clearPhoneCheckCache = useCallback(async () => {
        phoneCheckCache.current = {};
        pendingChecks.current.clear();
        processingQueue.current = [];
        try {
            await AsyncStorage.removeItem(PHONE_CHECK_CACHE_KEY);
            console.log("🗑️ Cleared phone check cache");
        } catch (error) {
            console.error("Error clearing phone check cache:", error);
        }
    }, []);

    // Form handling
    useEffect(() => {
        if (formValues?.user && !user) {
            router.push("/auth/OtpAuthScreen");
        }
    }, [formValues, user]);

    // Inactivity check
    const checkInactivity = async () => {
        if (!isAuthenticated || !user?.pin) {
            return;
        }

        const lastActive = await AsyncStorage.getItem(APP_STATE_KEY);
        if (lastActive) {
            const timeSinceLastActive = Date.now() - parseInt(lastActive);
            if (timeSinceLastActive >= LOCK_TIME) {
                setIsLocked(true);
                router.push("/lock-Screen");
            }
        }
    };

    return (
        <UserInactivityContext.Provider value={{ 
            allUsers,
            isLocked, 
            setIsLocked, 
            checkInactivity,
            checkPhoneRegistration,
            clearPhoneCheckCache,
            contactsProcessingStatus
        }}>
            {children}
        </UserInactivityContext.Provider>
    );
};


export const useUserInactivity = () => {
    const context = useContext(UserInactivityContext);
    if (context === undefined) {
        throw new Error("useUserInactivity must be used within a UserInactivityProvider");
    }
    return context;
};

export const forceRecordBackgroundTime = async (): Promise<void> => {
    try {
        const currentTime = Date.now().toString();
        await AsyncStorage.setItem(APP_STATE_KEY, currentTime);
    } catch (error) {
        console.error("Error force recording background time:", error);
    }
};

export const forceClearBackgroundTime = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(APP_STATE_KEY);
    } catch (error) {
        console.error("Error force clearing background time:", error);
    }
};

export const getStoredBackgroundTime = async (): Promise<number | null> => {
    try {
        const storedTime = await AsyncStorage.getItem(APP_STATE_KEY);
        if (!storedTime) return null;
        
        const time = parseInt(storedTime, 10);
        return isNaN(time) ? null : time;
    } catch (error) {
        console.error("Error getting stored background time:", error);
        return null;
    }
};