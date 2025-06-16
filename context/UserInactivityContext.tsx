import useFormStore from "@/app/store/useFormStore";
import { useUserStore } from "@/store/useUserStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

const APP_STATE_KEY = "app_state";
const LOCK_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

interface UserInactivityContextType {
    isLocked: boolean;
    setIsLocked: (locked: boolean) => void;
    checkInactivity: () => void;
}

const UserInactivityContext = createContext<UserInactivityContextType | undefined>(undefined);

export const UserInactivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const { user, isAuthenticated, logout } = useUserStore();
    const { formValues, clearForm } = useFormStore();

    useEffect(() => {
        if (formValues?.user && !user) {
            router.push("/auth/OtpAuthScreen");
        }
    }, [formValues]);

    useEffect(() => {
        // logout()
        // clearForm()
        if (!isAuthenticated || !user?.pin) {
            // Clear any stored background time if user is not fully authenticated
            forceClearBackgroundTime();
            return;
        }

        const subscription = AppState.addEventListener("change", handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [isAuthenticated, user?.pin]);

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
        } else if (nextAppState === "background") {
            await AsyncStorage.setItem(APP_STATE_KEY, Date.now().toString());
        }
    };

    const checkInactivity = async () => {
        // Don't check inactivity if user is not fully authenticated
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
        <UserInactivityContext.Provider value={{ isLocked, setIsLocked, checkInactivity }}>
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