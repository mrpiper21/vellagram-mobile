import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

// import { AmountFilterSheet, DateFilterSheet } from '@/app/(authenticated)/(tabs)/groups/components/FilterSheets';
// import { GroupDetailsSheetRoot } from '@/app/components/GroupDetailsSheetRoot';
import { GroupDetailsProvider } from '@/app/context/GroupDetailsContext';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { UserInactivityProvider } from "@/context/UserInactivityContext";
import { FilterSheetProvider, useFilterSheet } from './context/FilterSheetContext';

function RootLayoutContent() {
	const theme = useAppTheme();
	const { isAmountSheetVisible, isDateSheetVisible, hideAmountSheet, hideDateSheet } = useFilterSheet();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	console.log("🔍 RootLayoutContent rendering, loaded:", loaded, "isDark:", theme.isDark);

	// if (!loaded) {
	// 	return (
	// 		<View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
	// 			<Text style={{ color: theme.text, fontSize: 18 }}>Loading...</Text>
	// 		</View>
	// 	);
	// }

	return (
		<View style={{ flex: 1, backgroundColor: theme.background }}>
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: theme.card,
					},
					headerTintColor: theme.text,
					headerShown: false
				}}
			>
				<Stack.Screen name="lock-Screen" options={{ headerShown: false }} />
				<Stack.Screen name="auth" options={{ headerShown: false }} />
				<Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
				<Stack.Screen name="+not-found" />
				<Stack.Screen name="white-overlay" options={{ headerShown: false }} />
				<Stack.Screen name="contacts" options={{ headerShown: true }} />
			</Stack>
			<StatusBar style="auto" />
			{/* <AmountFilterSheet
				isAmountSheetVisible={isAmountSheetVisible}
				onAmountSheetClose={hideAmountSheet}
			/>
			<DateFilterSheet
				isDateSheetVisible={isDateSheetVisible}
				onDateSheetClose={hideDateSheet}
			/> */}
			{/* <GroupDetailsSheetRoot /> */}
		</View>
	);
}

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider>
				<NavigationThemeProvider value={DefaultTheme}>
					<FilterSheetProvider>
						<UserInactivityProvider>
							<GroupDetailsProvider>
								<BottomSheetModalProvider>
									<RootLayoutContent />
								</BottomSheetModalProvider>
							</GroupDetailsProvider>
						</UserInactivityProvider>
					</FilterSheetProvider>
				</NavigationThemeProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
