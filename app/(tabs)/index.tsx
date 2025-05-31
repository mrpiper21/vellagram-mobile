import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React, { useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";

// Simple dummy data for groups - WhatsApp style
const groups = [
	{
		id: "1",
		name: "Family Susu Circle",
		lastMessage: "Payment reminder: Next contribution due tomorrow!",
		time: "2 min ago",
		unreadCount: 3,
		avatar: "F"
	},
	{
		id: "2",
		name: "Office Workers Susu",
		lastMessage: "Welcome Sarah! Please introduce yourself",
		time: "1 hour ago",
		unreadCount: 0,
		avatar: "O"
	},
	{
		id: "3",
		name: "Friends Savings Group",
		lastMessage: "Great job everyone on this month's savings!",
		time: "3 hours ago",
		unreadCount: 1,
		avatar: "F"
	},
	{
		id: "4",
		name: "Community Development",
		lastMessage: "Meeting scheduled for next Friday",
		time: "1 day ago",
		unreadCount: 0,
		avatar: "C"
	},
	{
		id: "5",
		name: "School Parents Group",
		lastMessage: "Monthly contribution complete ✅",
		time: "2 days ago",
		unreadCount: 0,
		avatar: "S"
	}
];

export default function ChatTab() {
	const { theme } = useTheme();
	const colorScheme = theme.isDark ? "dark" : "light";
	const appColors = Colors[colorScheme];
	const [showCreateGroup, setShowCreateGroup] = useState(false);
	const [newGroupName, setNewGroupName] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	// Filter groups based on search query
	const filteredGroups = groups.filter(group =>
		group.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleGroupPress = (group: typeof groups[0]) => {
		router.push(`/conversation/[id]`,);
	};

	const handleCreateGroup = () => {
		if (newGroupName.trim()) {
			Alert.alert("Success", `Group "${newGroupName}" would be created`);
			setNewGroupName("");
			setShowCreateGroup(false);
		} else {
			Alert.alert("Error", "Please enter a group name");
		}
	};

	const renderGroup = ({ item }: { item: typeof groups[0] }) => (
		<TouchableOpacity
			style={[
				styles.groupItem,
				{ backgroundColor: appColors.background }
			]}
			onPress={() => handleGroupPress(item)}
			activeOpacity={0.7}
		>
			<View style={[styles.groupAvatar, { backgroundColor: appColors.tint }]}>
				<Text style={styles.avatarText}>{item.avatar}</Text>
			</View>

			<View style={styles.groupContent}>
				<View style={styles.groupHeader}>
					<Text style={[
						styles.groupName,
						{ color: appColors.text }
					]}>
						{item.name}
					</Text>
					<Text style={[
						styles.timeStamp,
						{ color: appColors.text }
					]}>
						{item.time}
					</Text>
				</View>

				<View style={styles.messageRow}>
					<Text style={[
						styles.lastMessage,
						{ color: appColors.text }
					]} numberOfLines={1}>
						{item.lastMessage}
					</Text>

					{item.unreadCount > 0 && (
						<View style={styles.unreadBadge}>
							<Text style={styles.unreadCount}>{item.unreadCount}</Text>
						</View>
					)}
				</View>
			</View>
		</TouchableOpacity>
	);

	const renderEmptyState = () => (
		<View style={styles.emptyState}>
			<Ionicons
				name="chatbubbles-outline"
				size={64}
				color={appColors.text}
			/>
			<Text style={[
				styles.emptyStateText,
				{ color: appColors.text }
			]}>
				{searchQuery ? 'No groups found' : 'No groups yet'}
			</Text>
			{!searchQuery && (
				<Text style={[
					styles.emptyStateSubtext,
					{ color: appColors.text }
				]}>
					Create your first Susu group to start saving together
				</Text>
			)}
		</View>
	);

	return (
		<View style={[
			styles.container,
			{ backgroundColor: appColors.background }
		]}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={[
					styles.headerTitle,
					{ color: appColors.text }
				]}>
					Chats
				</Text>
				<TouchableOpacity
					style={styles.createButton}
					onPress={() => setShowCreateGroup(true)}
				>
					<Ionicons name="add" size={24} color={appColors.text} />
				</TouchableOpacity>
			</View>

			{/* Groups List */}
			<FlatList
				data={filteredGroups}
				keyExtractor={(item) => item.id}
				renderItem={renderGroup}
				contentContainerStyle={[
					styles.list,
					filteredGroups.length === 0 && styles.emptyList
				]}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={renderEmptyState}
			/>

			{/* Create Group Modal */}
			<Modal
				visible={showCreateGroup}
				transparent={true}
				animationType="slide"
				onRequestClose={() => setShowCreateGroup(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={[
						styles.modalContent,
						{ backgroundColor: appColors.background }
					]}>
						<Text style={[
							styles.modalTitle,
							{ color: appColors.text }
						]}>
							Create New Susu Group
						</Text>

						<TextInput
							style={[
								styles.modalInput,
								{
									backgroundColor: appColors.background,
									color: appColors.text
								}
							]}
							placeholder="Enter group name..."
							placeholderTextColor={appColors.text}
							value={newGroupName}
							onChangeText={setNewGroupName}
							autoFocus={true}
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => setShowCreateGroup(false)}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.modalButton, styles.createGroupButton]}
								onPress={handleCreateGroup}
							>
								<Text style={styles.createButtonText}>Create</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 12,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: 'bold',
	},
	createButton: {
		backgroundColor: '#4CAF50',
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 16,
		marginBottom: 16,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		elevation: 1,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
	},
	searchInput: {
		flex: 1,
		marginLeft: 8,
		fontSize: 16,
	},
	list: {
		paddingBottom: 32,
	},
	emptyList: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	groupItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 0.5,
		borderBottomColor: 'rgba(0,0,0,0.1)',
	},
	groupAvatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#25D366',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	avatarText: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '600',
	},
	groupContent: {
		flex: 1,
	},
	groupHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	groupName: {
		fontSize: 16,
		fontWeight: '600',
		flex: 1,
	},
	timeStamp: {
		fontSize: 12,
		marginLeft: 8,
	},
	messageRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	lastMessage: {
		fontSize: 14,
		flex: 1,
		marginRight: 8,
	},
	unreadBadge: {
		backgroundColor: '#25D366',
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	unreadCount: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: 'bold',
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 64,
	},
	emptyStateText: {
		fontSize: 18,
		fontWeight: '600',
		marginTop: 16,
		marginBottom: 8,
	},
	emptyStateSubtext: {
		fontSize: 14,
		textAlign: 'center',
		lineHeight: 20,
		paddingHorizontal: 32,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		width: '85%',
		borderRadius: 16,
		padding: 24,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	modalInput: {
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		marginBottom: 24,
		elevation: 1,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	modalButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: '#f5f5f5',
		marginRight: 8,
	},
	createGroupButton: {
		backgroundColor: '#4CAF50',
		marginLeft: 8,
	},
	cancelButtonText: {
		color: '#666666',
		fontWeight: '600',
	},
	createButtonText: {
		color: '#ffffff',
		fontWeight: '600',
	},
});
