import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import GroupConversationCard from "@/app/components/cards/GroupConversationCard";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/store/useUserStore";
import CreateSavingsGroupSheet from "./CreateSavingsGroupSheet";

const SavingsScreen: React.FC = () => {
	const theme = useAppTheme();
	const { user: currentUser } = useUserStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateSheet, setShowCreateSheet] = useState(false);

	// Sample group conversations data
	const sampleGroupConversations = useMemo(() => [
		{
			id: "group1",
			name: "Family Group",
			lastMessage: {
				content: "Happy birthday to everyone! 🎉",
				timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
				senderId: "user2",
				senderName: "Mom",
				status: "read"
			},
			unreadCount: 3,
			participants: [
				{ id: "user1", name: "Dad", profile: null },
				{ id: "user2", name: "Mom", profile: null },
				{ id: "user3", name: "Sister", profile: null },
				{ id: "user4", name: "Brother", profile: null }
			]
		},
		{
			id: "group2",
			name: "Work Team",
			lastMessage: {
				content: "Meeting at 3 PM today",
				timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
				senderId: "user5",
				senderName: "Manager",
				status: "delivered"
			},
			unreadCount: 0,
			participants: [
				{ id: "user5", name: "Manager", profile: null },
				{ id: "user6", name: "Colleague 1", profile: null },
				{ id: "user7", name: "Colleague 2", profile: null },
				{ id: "user8", name: "Colleague 3", profile: null },
				{ id: "user9", name: "Colleague 4", profile: null }
			]
		},
		{
			id: "group3",
			name: "College Friends",
			lastMessage: {
				content: "Who's up for coffee this weekend?",
				timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
				senderId: "user10",
				senderName: "Alex",
				status: "read"
			},
			unreadCount: 1,
			participants: [
				{ id: "user10", name: "Alex", profile: null },
				{ id: "user11", name: "Sarah", profile: null },
				{ id: "user12", name: "Mike", profile: null }
			]
		},
		{
			id: "group4",
			name: "Book Club",
			lastMessage: {
				content: "Great discussion today! Next book suggestions?",
				timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
				senderId: "user13",
				senderName: "Emma",
				status: "read"
			},
			unreadCount: 0,
			participants: [
				{ id: "user13", name: "Emma", profile: null },
				{ id: "user14", name: "John", profile: null },
				{ id: "user15", name: "Lisa", profile: null },
				{ id: "user16", name: "David", profile: null },
				{ id: "user17", name: "Anna", profile: null },
				{ id: "user18", name: "Tom", profile: null }
			]
		}
	], []);

	// Filter conversations based on search query
	const filteredConversations = useMemo(() => {
		if (!searchQuery.trim()) {
			return sampleGroupConversations;
		}

		const query = searchQuery.toLowerCase().trim();
		return sampleGroupConversations.filter((conversation) => {
			const nameMatch = conversation.name.toLowerCase().includes(query);
			const messageMatch = conversation.lastMessage?.content.toLowerCase().includes(query);
			return nameMatch || messageMatch;
		});
	}, [sampleGroupConversations, searchQuery]);

	const renderGroupConversationItem = ({ item }: { item: any }) => (
		<GroupConversationCard
			item={item}
			theme={theme}
			currentUser={currentUser}
			participants={item.participants}
		/>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyStateContainer}>
			{searchQuery.trim() ? (
				<View style={styles.searchEmptyState}>
					<Ionicons name="search" size={48} color={theme.textSecondary} />
					<Text style={[styles.searchEmptyText, { color: theme.textSecondary }]}>
						No group conversations found for "{searchQuery}"
					</Text>
					<Text style={[styles.searchEmptySubtext, { color: theme.textSecondary }]}>
						Try searching for a different group name or message
					</Text>
				</View>
			) : (
				<View style={styles.defaultEmptyState}>
					<FontAwesome5 name="users" size={64} color={theme.textSecondary} />
					<Text style={[styles.emptyTitle, { color: theme.text }]}>
						No Group Conversations
					</Text>
					<Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
						Start a group chat to collaborate with friends and family
					</Text>
				</View>
			)}
		</View>
	);

	const renderSearchBar = () => (
		<View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
			<View style={[styles.searchInputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
				<View style={styles.searchIconContainer}>
					<Ionicons name="search" size={20} color={theme.textSecondary} />
				</View>
				<TextInput
					style={[styles.searchInput, { color: theme.text }]}
					placeholder="Search group conversations..."
					placeholderTextColor={theme.textSecondary}
					value={searchQuery}
					onChangeText={setSearchQuery}
					autoCapitalize="none"
					autoCorrect={false}
					returnKeyType="search"
					clearButtonMode="while-editing"
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity
						style={styles.clearButton}
						onPress={() => setSearchQuery("")}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Ionicons name="close-circle" size={20} color={theme.textSecondary} />
					</TouchableOpacity>
				)}
			</View>
		</View>
	);

	const handleCreateGroup = () => {
		setShowCreateSheet(true);
	};

	const handleCreateSavingsGroup = (data: any) => {
		console.log("Creating savings group:", data);
		// TODO: Implement savings group creation logic
		// setShowCreateSheet(false);
	};

	const handleCloseCreateSheet = () => {
		setShowCreateSheet(false);
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={theme.isDark ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
				translucent={false}
			/>
			
			<FlatList
				data={filteredConversations}
				renderItem={renderGroupConversationItem}
				keyExtractor={(item) => item.id}
				style={styles.conversationsList}
				contentContainerStyle={[
					filteredConversations.length === 0
						? styles.emptyList
						: styles.conversationsContent,
				]}
				ListHeaderComponent={renderSearchBar()}
				ListEmptyComponent={renderEmptyState}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="none"
				bounces={true}
				overScrollMode="never"
			/>

			<TouchableOpacity
				style={[
					styles.fab,
					{ backgroundColor: theme.tint, shadowColor: theme.tint },
				]}
				onPress={handleCreateGroup}
				activeOpacity={0.85}
			>
				<FontAwesome5 name="users" size={20} color="#fff" />
			</TouchableOpacity>

			<CreateSavingsGroupSheet
				visible={showCreateSheet}
				onClose={handleCloseCreateSheet}
				onCreate={handleCreateSavingsGroup}
			/>
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
	searchContainer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 0.5,
		borderBottomColor: "rgba(0,0,0,0.1)",
	},
	searchInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 16,
		borderWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	searchIconContainer: {
		marginRight: 12,
		opacity: 0.6,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		fontWeight: "400",
		paddingVertical: 0,
	},
	clearButton: {
		marginLeft: 8,
		padding: 2,
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
	defaultEmptyState: {
		alignItems: "center",
		gap: 16,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: 16,
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

export default SavingsScreen; 