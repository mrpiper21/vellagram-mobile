import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
	const theme = useAppTheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: theme.tint,
				tabBarInactiveTintColor: theme.icon,
				headerStyle: {
					backgroundColor: theme.card,
				},
				headerTintColor: theme.text,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: {
						position: "absolute",
						backgroundColor: theme.card,
						borderTopColor: theme.border,
					},
					default: {
						backgroundColor: theme.card,
						borderTopColor: theme.border,
					},
				}),
			}}
			initialRouteName="index"
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Chats",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="chatbubbles-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="groups/index"
				options={{
					title: "Saving Groups",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="people-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="wallet"
				options={{
					title: "Wallet",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="wallet-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="account/index"
				options={{
					headerShown: true,
					title: "Account",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person-outline" size={size} color={color} />
					),
					headerTitleAlign: "left",
					headerTitleStyle: { fontSize: 24 },
					headerRight: () => (
						<TouchableOpacity
							onPress={() => router.push("/(authenticated)/settings")}
							activeOpacity={0.8}
						>
							<Ionicons
								name="settings-outline"
								size={24}
								color={theme.icon}
								style={{ marginRight: 16 }}
								// onPress={() => {
								// 	console.log("Settings pressed");
								// }}
							/>
						</TouchableOpacity>
					),
				}}
			/>
		</Tabs>
	);
} 