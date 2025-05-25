import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const LOCK_TIME = 3000;
const APP_STATE_KEY = 'app-background-time';

export const UserInactivityProvider = ({ children }: { children: React.ReactNode }) => {
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const router = useRouter();

    useEffect(() => {
        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            subscription?.remove?.();
        };
    }, []);

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        console.log("AppState changed:", appState.current, "->", nextAppState);

        try {
            if (nextAppState === "inactive") {
                router.push("/white-overlay");
            } 
            else if (appState.current === "inactive" && nextAppState === "active") {
                router.back();
            }

            if (nextAppState === 'background') {
                await recordBackgroundTime();
            } 
            else if (nextAppState === "active" && appState.current === "background") {
                const shouldLock = await checkIfShouldLock();
                if (shouldLock) {
                    router.push("/lock-Screen");
                }
                await clearBackgroundTime();
            }

            appState.current = nextAppState;
        } catch (error) {
            console.error("Error handling app state change:", error);
        }
    };

    const recordBackgroundTime = async (): Promise<void> => {
        try {
            const currentTime = Date.now().toString();
            await AsyncStorage.setItem(APP_STATE_KEY, currentTime);
            console.log("Background time recorded:", currentTime);
        } catch (error) {
            console.error("Error recording background time:", error);
        }
    };

    const checkIfShouldLock = async (): Promise<boolean> => {
        try {
            const storedTime = await AsyncStorage.getItem(APP_STATE_KEY);
            
            if (!storedTime) {
                console.log("No stored background time found");
                return false;
            }

            const backgroundTime = parseInt(storedTime, 10);
            
            if (isNaN(backgroundTime)) {
                console.log("Invalid stored background time");
                return false;
            }

            const currentTime = Date.now();
            const elapsedTime = currentTime - backgroundTime;
            
            console.log(`Time in background: ${elapsedTime}ms (threshold: ${LOCK_TIME}ms)`);
            
            return elapsedTime >= LOCK_TIME;
        } catch (error) {
            console.error("Error checking if should lock:", error);
            return false;
        }
    };

    const clearBackgroundTime = async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(APP_STATE_KEY);
            console.log("Background time cleared");
        } catch (error) {
            console.error("Error clearing background time:", error);
        }
    };

    return <>{children}</>;
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