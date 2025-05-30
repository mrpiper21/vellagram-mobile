/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2A4759'; // Deep Navy Teal
const tintColorDark = '#3A86A8';  // Brighter Harmonious Teal (instead of #06B6D4)

export const Colors = {
    light: {
        text: "#0F172A",
        background: "#FFFFFF",
        tint: tintColorLight,
        icon: "#64748B",
        tabIconDefault: "#94A3B8",
        tabIconSelected: tintColorLight,
        accent: "#C52727", // Deepened red for better harmony
        success: "#1B7E3D", // Deeper green
        secondary: "#5A2D8C", // Muted purple
        card: "#F5F7FA",
        border: "#D1D9E3",
        highlight: "#E1E8F0" // New subtle highlight color
    },
    dark: {
        text: "#F1F5F9",
        background: "#0A0F1A", // Darker base
        tint: tintColorDark,
        icon: "#94A3B8",
        tabIconDefault: "#64748B",
        tabIconSelected: tintColorDark,
        accent: "#EF4444",
        success: "#2ECC71", // Brighter success
        secondary: "#8B5CF6",
        card: "#1A2235", // Darker card
        border: "#3C4A66",
        highlight: "#25304A" // New dark highlight
    }
};
