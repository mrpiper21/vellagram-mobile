import { ThemeProvider } from '@/context/ThemeContext';
import { UserInactivityProvider } from '@/context/UserInactivityContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "react-native-reanimated";
import { FilterSheetProvider } from './context/FilterSheetContext';
import { SocketProvider } from './context/SocketContext';

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<ThemeProvider>
			<UserInactivityProvider>
				<SocketProvider>
					<GestureHandlerRootView style={{ flex: 1 }}>
						<FilterSheetProvider>
							<BottomSheetModalProvider>
								<Stack>
									<Stack.Screen
										name="(authenticated)"
										options={{ headerShown: false }}
									/>
									<Stack.Screen name="auth" options={{ headerShown: false }} />
									<Stack.Screen
										name="lock-Screen"
										options={{ headerShown: false }}
									/>
								</Stack>
							</BottomSheetModalProvider>
						</FilterSheetProvider>
					</GestureHandlerRootView>
				</SocketProvider>
			</UserInactivityProvider>
		</ThemeProvider>
	);
}