/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0891B2'; // Cyan - trust and security
const tintColorDark = '#06B6D4';  // Bright cyan

export const Colors = {
	light: {
		text: "#0F172A",
		background: "#FFFFFF",
		tint: tintColorLight,
		icon: "#64748B",
		tabIconDefault: "#94A3B8",
		tabIconSelected: tintColorLight,
		accent: "#DC2626", // Red accent for alerts/important actions
		success: "#16A34A",
		secondary: "#7C3AED", // Purple for premium features
		card: "#F8FAFC",
		border: "#E2E8F0",
	},
	dark: {
		text: "#F1F5F9",
		background: "#020617",
		tint: tintColorDark,
		icon: "#94A3B8",
		tabIconDefault: "#64748B",
		tabIconSelected: tintColorDark,
		accent: "#EF4444",
		success: "#22C55E",
		secondary: "#A855F7",
		card: "#0F172A",
		border: "#334155",
	},
};
