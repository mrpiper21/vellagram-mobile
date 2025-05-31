import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User } from "../types/user";

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    updateUser: (updates: Partial<User>) => void;
    logout: () => void;
}

const initialState = {
    user: null,
    isAuthenticated: false,
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            ...initialState,
            setUser: (user) => set(() => ({ user, isAuthenticated: true })),
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                    isAuthenticated: true
                })),
            logout: () => set(() => initialState),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

// Memoized selectors with shallow comparison
export const useUser = () => useUserStore((state) => state.user);
export const useSetUser = () => useUserStore((state) => state.setUser);
export const useUpdateUser = () => useUserStore((state) => state.updateUser);
export const useLogout = () => useUserStore((state) => state.logout); 