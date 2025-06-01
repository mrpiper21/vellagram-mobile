import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { UserInactivityProvider } from "@/context/UserInactivityContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<UserInactivityProvider>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<BottomSheetModalProvider>
						<Stack screenOptions={{ animation: "none" }}>
							<Stack.Screen name="lock-Screen" options={{ headerShown: false }} />
							<Stack.Screen name="auth" options={{ headerShown: false }} />
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
							<Stack.Screen name="+not-found" />
							<Stack.Screen name="white-overlay" options={{ headerShown: false }} />
							<Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
						</Stack>
						<StatusBar style="auto" />
					</BottomSheetModalProvider>
				</ThemeProvider>
			</UserInactivityProvider>
		</GestureHandlerRootView>
	);
}
