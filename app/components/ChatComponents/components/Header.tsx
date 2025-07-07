import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { HeaderProps } from "../types";
import AnimatedTabButton from "./AnimatedTabButton";

const Header: React.FC<HeaderProps> = ({ activeTab, onTabSwitch, theme }) => {
	const getTitle = useCallback(() => {
		return activeTab === "messages" ? "Messages" : "Savings";
	}, [activeTab]);

	return (
		<View style={[styles.header, { backgroundColor: theme.background }]}>
			<View
				style={[styles.headerContent, { borderBottomColor: theme.border }]}
			>
				<View style={styles.headerLeft}>
					<Text style={[styles.headerTitle, { color: theme.text }]}>
						{getTitle()}
					</Text>
				</View>
				<View style={styles.headerRight}>
					<AnimatedTabButton
						activeTab={activeTab}
						onPress={onTabSwitch}
						theme={theme}
					/>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		paddingTop: 20,
		borderBottomWidth: 0,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: "700",
		letterSpacing: -0.5,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
});

export default Header; 