import { Colors } from '@/constants/Colors';
import React, { createContext, useContext } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';

interface ThemeContextType {
    theme: typeof Colors.light & { isDark: boolean };
    colorScheme: ColorSchemeName;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const themeKey = colorScheme ?? "light";
    
    const theme = {
        ...Colors[themeKey as keyof typeof Colors],
        isDark
    };

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};

// Convenience hook for just the theme object
export const useAppTheme = () => {
    const { theme } = useThemeContext();
    return theme;
};

// Convenience hook for just the color scheme
export const useAppColorScheme = () => {
    const { colorScheme } = useThemeContext();
    return colorScheme;
};

// Convenience hook for just the dark mode boolean
export const useAppIsDark = () => {
    const { isDark } = useThemeContext();
    return isDark;
}; 