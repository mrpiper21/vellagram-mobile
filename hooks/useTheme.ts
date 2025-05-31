import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";

export const useTheme = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const theme = {
        ...Colors[colorScheme ?? "light"],
        isDark
    };

    return {
        theme,
        colorScheme,
        isDark
    };
}; 