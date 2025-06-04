import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { GroupDetailsSheetRoot } from '@/app/components/GroupDetailsSheetRoot';
import { GroupDetailsProvider } from '@/app/context/GroupDetailsContext';
import { Colors } from '@/constants/Colors';
import { UserInactivityProvider } from "@/context/UserInactivityContext";
import { useTheme } from '@/hooks/useTheme';
import { AmountFilterSheet, DateFilterSheet } from './(tabs)/groups/components/FilterSheets';
import { FilterSheetProvider, useFilterSheet } from './context/FilterSheetContext';

function RootLayoutContent() {
	const { theme } = useTheme();
	const colorScheme = theme.isDark ? 'dark' : 'light';
	const appColors = Colors[colorScheme];
	const { isAmountSheetVisible, isDateSheetVisible, hideAmountSheet, hideDateSheet } = useFilterSheet();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<>
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: appColors.card,
					},
					headerTintColor: appColors.text,
				}}
			>
				<Stack.Screen name="lock-Screen" options={{ headerShown: false }} />
				<Stack.Screen name="auth" options={{ headerShown: false }} />
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="+not-found" />
				<Stack.Screen name="white-overlay" options={{ headerShown: false }} />
				<Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
				<Stack.Screen name="contacts" options={{ headerShown: false }} />
			</Stack>
			<StatusBar style="auto" />
			<AmountFilterSheet
				colorScheme={colorScheme}
				isAmountSheetVisible={isAmountSheetVisible}
				isDateSheetVisible={isDateSheetVisible}
				onAmountSheetClose={hideAmountSheet}
				onDateSheetClose={hideDateSheet}
			/>
			<DateFilterSheet
				colorScheme={colorScheme}
				isAmountSheetVisible={isAmountSheetVisible}
				isDateSheetVisible={isDateSheetVisible}
				onAmountSheetClose={hideAmountSheet}
				onDateSheetClose={hideDateSheet}
			/>
			<GroupDetailsSheetRoot />
		</>
	);
}

export default function RootLayout() {
	const { theme } = useTheme();
	const colorScheme = theme.isDark ? 'dark' : 'light';

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<UserInactivityProvider>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<BottomSheetModalProvider>
						<FilterSheetProvider>
							<GroupDetailsProvider>
								<RootLayoutContent />
							</GroupDetailsProvider>
						</FilterSheetProvider>
					</BottomSheetModalProvider>
				</ThemeProvider>
			</UserInactivityProvider>
		</GestureHandlerRootView>
	);
}
