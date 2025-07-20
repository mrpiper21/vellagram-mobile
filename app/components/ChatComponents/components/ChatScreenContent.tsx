import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import ConversationCard from "@/app/components/cards/ConversationCard";
import renderSearchBar from "@/app/components/chatTabs/renderSearchBar";
import NoMessages from "@/components/empty-states/NoMessages";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserInactivity } from "@/context/UserInactivityContext";
import { getOtherParticipantDetails } from "@/helpers/conversationUtils";
import { useSocketChat } from "@/hooks/useSocketChat";
import { useConversations } from "@/store/useChatStore";
import { useContactStore } from "@/store/useContactStore";
import { useUserStore } from "@/store/useUserStore";

const ChatScreenContent: React.FC = () => {
	const theme = useAppTheme();
	const conversationsObject = useConversations();
	const { allUsers } = useUserInactivity();
	const { contacts } = useContactStore();
	const { user: currentUser } = useUserStore();
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");


	const { isConnected } = useSocketChat();


	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const safeConversations = useMemo(() => {
		try {
			if (!conversationsObject || typeof conversationsObject !== "object") {
				console.warn("Conversations object is invalid:", conversationsObject);
				return [];
			}

			const conversationsArray = Object.values(conversationsObject)
				.filter((conv) => conv && typeof conv === "object")
				.sort((a, b) => {
					const timeA = a?.lastMessageTime || a?.createdAt || 0;
					const timeB = b?.lastMessageTime || b?.createdAt || 0;
					return timeB - timeA;
				});

			return conversationsArray;
		} catch (error) {
			console.error("Error processing conversations:", error);
			return [];
		}
	}, [conversationsObject]);

	const filteredConversations = useMemo(() => {
		if (!searchQuery.trim()) {
			return safeConversations;
		}

		const query = searchQuery.toLowerCase().trim();
		return safeConversations.filter((conversation) => {
			try {
				const participantDetails = getOtherParticipantDetails(
					conversation?.participants,
					currentUser?.id,
					contacts,
					allUsers || []
				);

				const nameMatch = participantDetails?.name
					?.toLowerCase()
					.includes(query);

				const messageMatch = conversation?.lastMessage?.content
					?.toLowerCase()
					.includes(query);

				return nameMatch || messageMatch;
			} catch (error) {
				console.error("Error filtering conversation:", error);
				return false;
			}
		});
	}, [safeConversations, searchQuery, currentUser?.id, contacts, allUsers]);

	const renderConversationItem = useCallback(
		({ item }: { item: any }) => (
			<ConversationCard
				item={item}
				currentUser={currentUser}
				contacts={contacts}
				allUsers={allUsers}
			/>
		),
		[currentUser, contacts, allUsers]
	);

	const renderEmptyState = useCallback(
		() => (
			<View style={styles.emptyStateContainer}>
				{searchQuery.trim() ? (
					<View style={styles.searchEmptyState}>
						<Ionicons name="search" size={48} color={theme.textSecondary} />
						<Text
							style={[styles.searchEmptyText, { color: theme.textSecondary }]}
						>
							No conversations found for "{searchQuery}"
						</Text>
						<Text
							style={[
								styles.searchEmptySubtext,
								{ color: theme.textSecondary },
							]}
						>
							Try searching for a different name or message
						</Text>
					</View>
				) : (
					<NoMessages />
				)}
			</View>
		),
		[searchQuery]
	);

	const handleFabPress = useCallback(() => {
		router.push("/contacts");
	}, []);

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={theme.isDark ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
				translucent={false}
			/>
			<FlatList
				data={filteredConversations}
				renderItem={renderConversationItem}
				keyExtractor={(item) => item?.id || Math.random().toString()}
				style={styles.conversationsList}
				contentContainerStyle={[
					filteredConversations?.length === 0
						? styles.emptyList
						: styles.conversationsContent,
					{ paddingTop: 0 },
				]}
				ListHeaderComponent={renderSearchBar({
					theme,
					searchQuery,
					setSearchQuery,
				})}
				ListEmptyComponent={renderEmptyState}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="none"
				bounces={true}
				overScrollMode="never"
			/>

			{/* Floating Action Button */}
			<TouchableOpacity
				style={[
					styles.fab,
					{ backgroundColor: theme.tint, shadowColor: theme.tint },
				]}
				onPress={handleFabPress}
				activeOpacity={0.85}
			>
				<Ionicons name="add" size={24} color="#fff" />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	conversationsList: {
		flex: 1,
	},
	conversationsContent: {
		paddingBottom: 100,
	},
	emptyList: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyStateContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	searchEmptyState: {
		alignItems: "center",
		gap: 16,
	},
	searchEmptyText: {
		fontSize: 18,
		fontWeight: "600",
		textAlign: "center",
	},
	searchEmptySubtext: {
		fontSize: 14,
		fontWeight: "400",
		textAlign: "center",
		opacity: 0.7,
	},
	fab: {
		position: "absolute",
		bottom: 90,
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 8,
		zIndex: 10,
	},
});

export default ChatScreenContent; 