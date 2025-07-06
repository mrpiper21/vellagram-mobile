import { useAppTheme } from '@/context/ThemeContext';
import { useUserStore } from '@/store/useUserStore';
import TokenManager from "@/utils/tokenManager";
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function AccountScreen() {
    const theme = useAppTheme();
    const { user, logout } = useUserStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

		const handleLogout = async () => {
			Alert.alert(
				"Logout",
				"Are you sure you want to logout? This will clear all your data and you'll need to sign in again.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Logout",
						style: "destructive",
						onPress: async () => {
							await performLogout();
						},
					},
				]
			);
		};

		const performLogout = async () => {
			setIsLoggingOut(true);

			try {
				console.log("🔄 Starting logout process...");

				// Clear all authentication data
				await TokenManager.clearAuth();
				console.log("✅ Cleared authentication tokens");

				// Clear user store
				logout();
				console.log("✅ Cleared user store");

				// Force navigation to login screen
				setTimeout(() => {
					router.replace("/auth/EmailAuthScreen");
					console.log("✅ Navigated to login screen");
				}, 100);
			} catch (error) {
				console.error("❌ Error during logout:", error);

				// Even if there's an error, try to clear the store and navigate
				try {
					logout();
					router.replace("/auth/EmailAuthScreen");
				} catch (fallbackError) {
					console.error("❌ Fallback logout also failed:", fallbackError);
				}

				Alert.alert(
					"Logout Error",
					"There was an error during logout. Please try again.",
					[{ text: "OK" }]
				);
			} finally {
				setIsLoggingOut(false);
				console.log("✅ Logout process completed");
			}
		};

    return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<View style={[styles.content, { backgroundColor: theme.background }]}>
					{/* Profile Section */}
					<View style={[styles.profileCard, { backgroundColor: theme.card }]}>
						<View style={[styles.avatar, { backgroundColor: theme.tint }]}>
							<Text style={styles.avatarText}>
								{user?.firstName?.charAt(0)?.toUpperCase() || "U"}
							</Text>
						</View>
						<Text style={[styles.name, { color: theme.text }]}>
							{user?.firstName} {user?.lastName}
						</Text>
						<Text style={[styles.email, { color: theme.textSecondary }]}>
							{user?.email}
						</Text>
					</View>

					{/* Menu Section */}
					<View style={[styles.menuSection, { backgroundColor: theme.card }]}>
						<TouchableOpacity
							style={[styles.menuItem, { borderBottomColor: theme.border }]}
						>
							<Ionicons name="person-outline" size={24} color={theme.text} />
							<Text style={[styles.menuText, { color: theme.text }]}>
								Edit Profile
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.menuItem, { borderBottomColor: theme.border }]}
						>
							<Ionicons
								name="notifications-outline"
								size={24}
								color={theme.text}
							/>
							<Text style={[styles.menuText, { color: theme.text }]}>
								Notifications
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.menuItem, { borderBottomColor: theme.border }]}
						>
							<Ionicons name="shield-outline" size={24} color={theme.text} />
							<Text style={[styles.menuText, { color: theme.text }]}>
								Privacy & Security
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.menuItem, { borderBottomColor: theme.border }]}
						>
							<Ionicons
								name="help-circle-outline"
								size={24}
								color={theme.text}
							/>
							<Text style={[styles.menuText, { color: theme.text }]}>
								Help & Support
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>

						<TouchableOpacity style={styles.menuItem}>
							<Ionicons
								name="information-circle-outline"
								size={24}
								color={theme.text}
							/>
							<Text style={[styles.menuText, { color: theme.text }]}>
								About
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>
					</View>

					{/* Logout Button */}
					<View>
						<TouchableOpacity
							style={[
								styles.logoutButton,
								{
									backgroundColor: isLoggingOut
										? theme.textSecondary
										: theme.accent,
									opacity: isLoggingOut ? 0.7 : 1,
								},
							]}
							onPress={handleLogout}
							disabled={isLoggingOut}
						>
							{isLoggingOut ? (
								<View style={styles.logoutLoadingContainer}>
									<ActivityIndicator size="small" color="white" />
									<Text style={styles.logoutText}>Logging out...</Text>
								</View>
							) : (
								<>
									<Ionicons name="log-out-outline" size={24} color="white" />
									<Text style={styles.logoutText}>Logout</Text>
								</>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 16,
		paddingVertical: 18,
		paddingTop: 38,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
	},
	content: {
		flex: 1,
		padding: 16,
	},
	profileCard: {
		padding: 20,
		borderRadius: 16,
		alignItems: "center",
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	avatarText: {
		color: "white",
		fontSize: 32,
		fontWeight: "bold",
	},
	name: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 4,
	},
	email: {
		fontSize: 16,
	},
	menuSection: {
		borderRadius: 16,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.05)",
	},
	menuText: {
		flex: 1,
		fontSize: 16,
		marginLeft: 12,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		borderRadius: 12,
		marginTop: "auto",
	},
	logoutText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
	logoutLoadingContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
}); 