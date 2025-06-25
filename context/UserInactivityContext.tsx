import useFormStore from "@/app/store/useFormStore";
import { checkPhoneNumberRegisteration } from "@/services/contact.service";
import ContactBackgroundService from "@/services/contactBackgroundService";
import { useUserStore } from "@/store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

const APP_STATE_KEY = "app_state";
const LOCK_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const PHONE_CHECK_CACHE_KEY = "phone_check_cache";
const PHONE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes cache

interface PhoneCheckCache {
    [phoneNumber: string]: {
        isRegistered: boolean;
        timestamp: number;
        userData?: any;
    };
}

interface UserInactivityContextType {
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
    checkInactivity: () => void;
    checkPhoneRegistration: (phoneNumber: string) => Promise<{ isRegistered: boolean; userData?: any }>;
    clearPhoneCheckCache: () => void;
}

const UserInactivityContext = createContext<UserInactivityContextType | undefined>(undefined);

export const UserInactivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const user = useUserStore((state) => state.user);
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    const logout = useUserStore((state) => state.logout);
    const { formValues, clearForm } = useFormStore();
    
    // Cache for phone number checks
    const phoneCheckCache = useRef<PhoneCheckCache>({});
    const pendingChecks = useRef<Set<string>>(new Set());
    const backgroundCheckTimeout = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load cache from storage on mount
    useEffect(() => {
        loadPhoneCheckCache();
    }, []);

    const loadPhoneCheckCache = async () => {
        try {
            const cached = await AsyncStorage.getItem(PHONE_CHECK_CACHE_KEY);
            if (cached) {
                phoneCheckCache.current = JSON.parse(cached);
                // Clean expired entries
                const now = Date.now();
                Object.keys(phoneCheckCache.current).forEach(phone => {
                    if (now - phoneCheckCache.current[phone].timestamp > PHONE_CHECK_INTERVAL) {
                        delete phoneCheckCache.current[phone];
                    }
                });
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

    // Optimized phone registration check with caching and debouncing
    const checkPhoneRegistration = useCallback(async (phoneNumber: string) => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        
        // Check cache first
        const cached = phoneCheckCache.current[cleanPhone];
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < PHONE_CHECK_INTERVAL) {
            return { isRegistered: cached.isRegistered, userData: cached.userData };
        }

        // Prevent duplicate requests
        if (pendingChecks.current.has(cleanPhone)) {
            // Wait for existing request to complete
            return new Promise<{ isRegistered: boolean; userData?: any }>((resolve) => {
                const checkComplete = () => {
                    const result = phoneCheckCache.current[cleanPhone];
                    if (result) {
                        resolve({ isRegistered: result.isRegistered, userData: result.userData });
                    } else {
                        // Retry after a short delay
                        setTimeout(() => {
                            const retryResult = phoneCheckCache.current[cleanPhone];
                            resolve({ 
                                isRegistered: retryResult?.isRegistered || false, 
                                userData: retryResult?.userData 
                            });
                        }, 1000);
                    }
                };
                
                // Poll for completion
                const pollInterval = setInterval(() => {
                    if (!pendingChecks.current.has(cleanPhone)) {
                        clearInterval(pollInterval);
                        checkComplete();
                    }
                }, 100);
            });
        }

        pendingChecks.current.add(cleanPhone);

        try {
            const result = await checkPhoneNumberRegisteration(cleanPhone);
            
            // Cache the result
            phoneCheckCache.current[cleanPhone] = {
                isRegistered: result.isResgistered,
                timestamp: now,
                userData: result.data
            };
            
            // Save to storage in background
            savePhoneCheckCache();
            
            return { isRegistered: result.isResgistered, userData: result.data };
        } catch (error) {
            console.error("Error checking phone registration:", error);
            // Return cached result if available, otherwise false
            return { 
                isRegistered: cached?.isRegistered || false, 
                userData: cached?.userData 
            };
        } finally {
            pendingChecks.current.delete(cleanPhone);
        }
    }, []);

    const clearPhoneCheckCache = useCallback(async () => {
        phoneCheckCache.current = {};
        pendingChecks.current.clear();
        try {
            await AsyncStorage.removeItem(PHONE_CHECK_CACHE_KEY);
        } catch (error) {
            console.error("Error clearing phone check cache:", error);
        }
    }, []);

    // Background phone check processing
    const processBackgroundPhoneChecks = useCallback(async (): Promise<void> => {
        if (!isAuthenticated || !user?.phone) return;

        try {
            // Check user's own phone number in background
            await checkPhoneRegistration(user.phone);
            
            // Start contact background service if not already running
            const contactService = ContactBackgroundService.getInstance();
            if (!contactService.isRunning()) {
                await contactService.startBackgroundSync(30); // Sync every 30 minutes
            } else {
                // If already running, just check unregistered contacts
                await contactService.checkUnregisteredContacts();
            }
            
            // You can add more background checks here if needed
            // For example, checking contacts that were recently viewed
        } catch (error) {
            console.error("Background phone check failed:", error);
        }
    }, [isAuthenticated, user?.phone]);

    useEffect(() => {
        if (formValues?.user && !user) {
            router.push("/auth/OtpAuthScreen");
        }
    }, [formValues, user]);

    useEffect(() => {
        if (!isAuthenticated || !user?.pin) {
            forceClearBackgroundTime();
            return;
        }

        const subscription = AppState.addEventListener("change", handleAppStateChange);
        
        // Start background processing immediately and then on interval
        processBackgroundPhoneChecks();
        backgroundCheckTimeout.current = setInterval(processBackgroundPhoneChecks, 5 * 60 * 1000); // Every 5 minutes

        return () => {
            subscription.remove();
            if (backgroundCheckTimeout.current) {
                clearInterval(backgroundCheckTimeout.current);
            }
        };
    }, [isAuthenticated, user?.pin, processBackgroundPhoneChecks]);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (!isAuthenticated || !user?.pin) {
            return;
        }

        if (nextAppState === "active") {
            const lastActive = await AsyncStorage.getItem(APP_STATE_KEY);
            if (lastActive) {
                const timeSinceLastActive = Date.now() - parseInt(lastActive);
                if (timeSinceLastActive >= LOCK_TIME) {
                    setIsLocked(true);
                    router.push("/lock-Screen");
                }
            }
            
            // Trigger background phone check when app becomes active
            processBackgroundPhoneChecks();
        } else if (nextAppState === "background") {
            await AsyncStorage.setItem(APP_STATE_KEY, Date.now().toString());
        }
    };

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
            isLocked, 
            setIsLocked, 
            checkInactivity,
            checkPhoneRegistration,
            clearPhoneCheckCache
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