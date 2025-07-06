import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useTheme } from "@/hooks/useTheme";

import {
	AnimatedTabContent,
	ChatScreenContent,
	Header,
	SavingsScreen,
} from "../../components/ChatComponents/components";
import { TabType } from "../../components/ChatComponents/types";

const TabOneScreen: React.FC = () => {
	const { theme } = useTheme();
	const [activeTab, setActiveTab] = useState<TabType>("messages");
	// const { logout } = useUserStore((state) => state);

	const handleTabSwitch = useCallback(() => {
		setActiveTab(activeTab === "messages" ? "savings" : "messages");
	}, [activeTab]);

	// logout();

	return (
		<ErrorBoundary>
			<Header
				activeTab={activeTab}
				onTabSwitch={handleTabSwitch}
				theme={theme}
			/>

			<View style={styles.tabContainer}>
				<AnimatedTabContent isActive={activeTab === "messages"} index={0}>
					<ChatScreenContent />
				</AnimatedTabContent>
				<AnimatedTabContent isActive={activeTab === "savings"} index={1}>
					<SavingsScreen />
				</AnimatedTabContent>
			</View>
		</ErrorBoundary>
	);
};

const styles = StyleSheet.create({
	tabContainer: {
		flex: 1,
		position: "relative",
	},
});

export default TabOneScreen;
