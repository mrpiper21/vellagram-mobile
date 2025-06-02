import VellagramLogo from "@/assets/images/Logo101";
import { useUserInactivity } from "@/context/UserInactivityContext";
import { useTheme } from "@/hooks/useTheme";
import { useUserStore } from "@/store/useUserStore";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const WhiteOverlay = () => {
	const { theme } = useTheme();
	const { user, isAuthenticated } = useUserStore();
	const { isLocked } = useUserInactivity();

	useEffect(() => {
		// If user is not authenticated or doesn't have a PIN, redirect to login
		if (!isAuthenticated || !user?.pin) {
			router.replace("/auth/EmailAuthScreen");
		}
	}, [isAuthenticated, user?.pin]);

	// Don't show overlay if user is not authenticated or doesn't have a PIN
	if (!isAuthenticated || !user?.pin) {
		return null;
	}

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<VellagramLogo showText={false} animated size={120} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 9999,
	},
});

export default WhiteOverlay;
