import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import GroupConversationCard from "@/app/components/cards/GroupConversationCard";
import { useAppTheme } from "@/context/ThemeContext";
// import { useGroupStore } from "@/store/useGroupStore";
import { useGroupStore } from "@/app/store/useGroupStore";
import { useUserStore } from "@/store/useUserStore";
import CreateSavingsGroupSheet from "./CreateSavingsGroupSheet";

const SavingsScreen: React.FC = () => {
	const theme = useAppTheme();
	const { user } = useUserStore();
	const { groups, isLoading, fetchGroups } = useGroupStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateSheet, setShowCreateSheet] = useState(false);

	useEffect(() => {
		fetchGroups();
	}, [fetchGroups]);

	// Filter groups based on search query
	const filteredGroups = useMemo(() => {
		if (!searchQuery.trim()) {
			return groups;
		}

		const query = searchQuery.toLowerCase().trim();
		return groups.filter((group) => {
			const nameMatch = group.name.toLowerCase().includes(query);
			return nameMatch;
		});
	}, [groups, searchQuery]);

	const renderGroupConversationItem = ({ item }: { item: any }) => (
		<TouchableOpacity
			onPress={() =>
				router.push(`/(authenticated)/group-chat/${item.id}` as any)
			}
			activeOpacity={0.7}
		>
			<GroupConversationCard
				item={{
					id: item.id,
					name: item.name,
					lastMessage: {
						content: "Group created successfully! Welcome to the group chat.",
						timestamp: new Date(item.createdAt).getTime(),
						senderId: item.admin,
						senderName: "System",
						status: "read",
					},
					unreadCount: 0,
					participants: item.users.map((userId: string) => ({
						id: userId,
						name: "Member",
						profile: null,
					})),
				}}
				theme={theme}
				currentUser={user}
				participants={item.users.map((userId: string) => ({
					id: userId,
					name: "Member",
					profile: null,
				}))}
			/>
		</TouchableOpacity>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyStateContainer}>
			{searchQuery.trim() ? (
				<View style={styles.searchEmptyState}>
					<Ionicons name="search" size={48} color={theme.textSecondary} />
					<Text
						style={[styles.searchEmptyText, { color: theme.textSecondary }]}
					>
						No groups found for "{searchQuery}"
					</Text>
					<Text
						style={[styles.searchEmptySubtext, { color: theme.textSecondary }]}
					>
						Try searching for a different group name
					</Text>
				</View>
			) : (
				<View style={styles.defaultEmptyState}>
					<FontAwesome5 name="users" size={64} color={theme.textSecondary} />
					<Text style={[styles.emptyTitle, { color: theme.text }]}>
						No Groups Yet
					</Text>
					<Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
						Create your first savings group to start collaborating with friends
						and family
					</Text>
				</View>
			)}
		</View>
	);

	const renderSearchBar = () => (
		<View
			style={[styles.searchContainer, { backgroundColor: theme.background }]}
		>
			<View
				style={[
					styles.searchInputContainer,
					{ backgroundColor: theme.card, borderColor: theme.border },
				]}
			>
				<View style={styles.searchIconContainer}>
					<Ionicons name="search" size={20} color={theme.textSecondary} />
				</View>
				<TextInput
					style={[styles.searchInput, { color: theme.text }]}
					placeholder="Search groups..."
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
						<Ionicons
							name="close-circle"
							size={20}
							color={theme.textSecondary}
						/>
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
		// Refresh groups after creation
		fetchGroups();
		setShowCreateSheet(false);
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
				data={filteredGroups}
				renderItem={renderGroupConversationItem}
				keyExtractor={(item) => item.id}
				style={styles.conversationsList}
				contentContainerStyle={[
					filteredGroups.length === 0
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
				refreshing={isLoading}
				onRefresh={fetchGroups}
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
		minWidth: 410,
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