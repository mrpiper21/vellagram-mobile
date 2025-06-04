import { IUser } from "@/@types/user-auth-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
    user: IUser | null;
    isAuthenticated: boolean;
    setUser: (user: IUser | null) => void;
    logout: () => void;
    updateUser: (updates: Partial<IUser>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);