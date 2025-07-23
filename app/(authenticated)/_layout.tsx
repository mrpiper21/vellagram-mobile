import { SocketProvider } from '@/context/useSockectContext';
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";
import React from "react";
import { GroupDetailsProvider } from "../context/GroupDetailsContext";

export default function AuthenticatedLayout() {
	return (
		<SocketProvider>
			<GroupDetailsProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<ActionSheetProvider>
						<Stack.Screen name="(tabs)" />
					</ActionSheetProvider>
					<Stack.Screen
						name="conversation/[id]"
						options={{ headerShown: false }}
					/>
					<Stack.Screen name="groupChat/[groupId]" />
					<Stack.Screen name="notification-settings" />
					<Stack.Screen name="settings" />
				</Stack>
			</GroupDetailsProvider>
		</SocketProvider>
	);
}