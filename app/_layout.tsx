import { ThemeProvider } from '@/context/ThemeContext';
import { UserInactivityProvider } from '@/context/UserInactivityContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Notifications from 'expo-notifications';
import { router, Stack } from "expo-router";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "react-native-reanimated";
import { FilterSheetProvider } from './context/FilterSheetContext';
import { SocketProvider } from './context/SocketContext';

function useNotificationObserver() {
	useEffect(() => {
	  let isMounted = true;
  
	  function redirect(notification: Notifications.Notification) {
		const url = notification.request.content.data?.url;
		if (url) {
		  router.push(url as any);
		}
	  }
  
	  Notifications.getLastNotificationResponseAsync()
		.then(response => {
		  if (!isMounted || !response?.notification) {
			return;
		  }
		  redirect(response?.notification);
		});
  
	  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
		redirect(response.notification);
	  });
  
	  return () => {
		isMounted = false;
		subscription.remove();
	  };
	}, []);
  }

export default function RootLayout() {
	const colorScheme = useColorScheme();
	useNotificationObserver()
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