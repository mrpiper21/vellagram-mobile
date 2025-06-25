import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";

// Optimized theme hook that directly uses React Native's useColorScheme
export const useTheme = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const themeKey = colorScheme ?? "light";
    
    return {
        theme: {
            ...Colors[themeKey as keyof typeof Colors],
            isDark
        },
        colorScheme,
        isDark
    };
};

// Alternative: Direct theme access without hook nesting
export const getTheme = (colorScheme: string | null) => {
    const isDark = colorScheme === "dark";
    const themeKey = colorScheme ?? "light";
    
    return {
        theme: {
            ...Colors[themeKey as keyof typeof Colors],
            isDark
        },
        colorScheme,
        isDark
    };
}; 