import ConversationCard from "@/app/components/cards/ConversationCard";
import renderSearchBar from "@/app/components/chatTabs/renderSearchBar";
import NoMessages from "@/components/empty-states/NoMessages";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserInactivity } from "@/context/UserInactivityContext";
import { getOtherParticipantDetails } from "@/helpers/conversationUtils";
import { useSocketChat } from "@/hooks/useSocketChat";
import { useTheme } from "@/hooks/useTheme";
import { useConversations, useTotalUnreadCount } from "@/store/useChatStore";
import { useContactStore } from "@/store/useContactStore";
import { useUserStore } from "@/store/useUserStore";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
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

function ChatScreenContent() {
	const theme = useAppTheme();
	const conversationsObject = useConversations();
	const totalUnreadCount = useTotalUnreadCount();
	const { allUsers } = useUserInactivity();
	const { contacts } = useContactStore();
	const { user: currentUser } = useUserStore();
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Socket integration
	const { isConnected } = useSocketChat();

	// Handle refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		// Simulate refresh delay
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	// Memoize and validate conversations to prevent crashes
	const safeConversations = useMemo(() => {
		try {
			if (!conversationsObject || typeof conversationsObject !== "object") {
				console.warn("Conversations object is invalid:", conversationsObject);
				return [];
			}

			// Transform the conversations object to an array
			const conversationsArray = Object.values(conversationsObject)
				.filter((conv) => conv && typeof conv === "object")
				.sort((a, b) => {
					// Handle cases where lastMessageTime might be undefined
					const timeA = a?.lastMessageTime || a?.createdAt || 0;
					const timeB = b?.lastMessageTime || b?.createdAt || 0;
					return timeB - timeA; // Sort by most recent first
				});

			return conversationsArray;
		} catch (error) {
			console.error("Error processing conversations:", error);
			return [];
		}
	}, [conversationsObject]);

	// Filter conversations based on search query
	const filteredConversations = useMemo(() => {
		if (!searchQuery.trim()) {
			return safeConversations;
		}

		const query = searchQuery.toLowerCase().trim();
		console.log("🔍 Searching for query:", query);

		return safeConversations.filter((conversation) => {
			try {
				// Get participant details for this conversation
				const participantDetails = getOtherParticipantDetails(
					conversation?.participants,
					currentUser?.id,
					contacts,
					allUsers || []
				);

				console.log("🔍 Checking conversation:", {
					conversationId: conversation?.id,
					participantName: participantDetails?.name,
					lastMessage: conversation?.lastMessage?.content,
					query,
				});

				// Check if participant name matches search query
				const nameMatch = participantDetails?.name
					?.toLowerCase()
					.includes(query);

				// Check if last message content matches search query
				const messageMatch = conversation?.lastMessage?.content
					?.toLowerCase()
					.includes(query);

				const matches = nameMatch || messageMatch;

				if (matches) {
					console.log("✅ Conversation matches search:", {
						conversationId: conversation?.id,
						nameMatch,
						messageMatch,
						participantName: participantDetails?.name,
					});
				}

				return matches;
			} catch (error) {
				console.error("Error filtering conversation:", error);
				return false;
			}
		});
	}, [safeConversations, searchQuery, currentUser?.id, contacts, allUsers]);

	// Safe total unread count
	const safeTotalUnreadCount = useMemo(() => {
		try {
			return typeof totalUnreadCount === "number" ? totalUnreadCount : 0;
		} catch (error) {
			console.error("Error processing total unread count:", error);
			return 0;
		}
	}, [totalUnreadCount]);

	const renderConversationItem = useCallback(
		({ item }: { item: any }) => (
			<ConversationCard
				item={item}
				theme={theme}
				currentUser={currentUser}
				contacts={contacts}
				allUsers={allUsers}
			/>
		),
		[theme, currentUser, contacts, allUsers]
	);

	console.log("🔍 ChatScreen rendering with theme:", theme);
	console.log("📱 Conversations count:", safeConversations?.length);
	console.log(
		"📱 Filtered conversations count:",
		filteredConversations?.length
	);
	console.log("📱 Total unread count:", safeTotalUnreadCount);

	const renderEmptyState = () => (
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
						style={[styles.searchEmptySubtext, { color: theme.textSecondary }]}
					>
						Try searching for a different name or message
					</Text>
				</View>
			) : (
				<NoMessages />
			)}
		</View>
	);

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
				onPress={() => router.push("/contacts")}
				activeOpacity={0.85}
			>
				<Ionicons name="add" size={24} color="#fff" />
			</TouchableOpacity>
		</View>
	);
}

export default function TabOneScreen() {
    const {theme} = useTheme()
    const [activeTab, setActiveTab] = useState<"tabOne" | "tabTwo">("tabOne")
	return (
		<ErrorBoundary>
            <View style={[styles.header, { backgroundColor: theme.background }]}>
				<View
					style={[styles.headerContent, { borderBottomColor: theme.border }]}
				>
					<View style={styles.headerLeft}>
						<Text style={[styles.headerTitle, { color: theme.text }]}>
							Messages
						</Text>
					</View>
					<View style={styles.headerRight}>
						<TouchableOpacity
							style={[
								styles.headerButton,
								{
									backgroundColor: theme.card,
									borderWidth: 0.5,
									borderColor: theme.border,
								},
							]}
							onPress={() => setActiveTab(activeTab === "tabOne" ? "tabTwo" : "tabOne")}
							activeOpacity={0.8}
						>
							<FontAwesome name="users" size={20} color={theme.text} />
						</TouchableOpacity>
						<View style={{ position: "absolute", bottom: 0 }}>
							<FontAwesome5 name="piggy-bank" size={12} color={theme.text} />
						</View>
					</View>
				</View>
			</View>
			{activeTab === "tabOne" ? <ChatScreenContent />: <View><Text>Tab two</Text></View>}
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
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
	unreadIndicator: {
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
		minWidth: 20,
		alignItems: "center",
	},
	unreadIndicatorText: {
		color: "white",
		fontSize: 12,
		fontWeight: "600",
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	headerButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		elevation: 2,
	},
	clearButton: {
		marginLeft: 8,
		padding: 4,
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
	avatarText: {
		color: "white",
		fontSize: 20,
		fontWeight: "600",
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
	searchResultsText: {
		marginTop: 8,
		fontSize: 12,
		fontWeight: "400",
		textAlign: "center",
	},
});
