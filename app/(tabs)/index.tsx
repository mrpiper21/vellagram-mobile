import NoMessages from '@/components/empty-states/NoMessages';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppTheme } from '@/context/ThemeContext';
import { useSocketChat } from '@/hooks/useSocketChat';
import { useConversations, useTotalUnreadCount } from '@/store/useChatStore';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function ChatScreenContent() {
	const theme = useAppTheme();

	// Chat store hooks with error handling
	const conversationsObject = useConversations();
	const totalUnreadCount = useTotalUnreadCount();
	
	// Socket integration
	const { isConnected } = useSocketChat();

	// Memoize and validate conversations to prevent crashes
	const safeConversations = useMemo(() => {
		try {
			if (!conversationsObject || typeof conversationsObject !== 'object') {
				console.warn('Conversations object is invalid:', conversationsObject);
				return [];
			}
			
			// Transform the conversations object to an array
			const conversationsArray = Object.values(conversationsObject)
				.filter(conv => conv && typeof conv === 'object')
				.sort((a, b) => {
					// Handle cases where lastMessageTime might be undefined
					const timeA = a?.lastMessageTime || a?.createdAt || 0;
					const timeB = b?.lastMessageTime || b?.createdAt || 0;
					return timeB - timeA; // Sort by most recent first
				});
			
			return conversationsArray;
		} catch (error) {
			console.error('Error processing conversations:', error);
			return [];
		}
	}, [conversationsObject]);

	// Safe total unread count
	const safeTotalUnreadCount = useMemo(() => {
		try {
			return typeof totalUnreadCount === 'number' ? totalUnreadCount : 0;
		} catch (error) {
			console.error('Error processing total unread count:', error);
			return 0;
		}
	}, [totalUnreadCount]);

	console.log("🔍 TabOneScreen rendering with theme:", theme);
	console.log("📱 Conversations count:", safeConversations?.length);
	console.log("📱 Total unread count:", safeTotalUnreadCount);

	const renderConversation = ({ item }: { item: any }) => {
		try {
			if (!item || typeof item !== 'object') {
				console.warn('Invalid conversation item:', item);
				return null;
			}

			const lastMessage = item?.lastMessage;
			const isUnread = (item?.unreadCount || 0) > 0;

			return (
				<TouchableOpacity
					style={[styles.conversationItem, { backgroundColor: theme.card }]}
					onPress={() => {
						if (item?.id) {
							router.push(`/conversation/${item.id}`);
						}
					}}
				>
					<View style={styles.avatarContainer}>
						<View style={[styles.avatar, { backgroundColor: theme.tint }]}>
							<Text style={styles.avatarText}>
								{item?.isGroup ? 'G' : item?.participants?.[0]?.charAt(0)?.toUpperCase() || 'U'}
							</Text>
						</View>
						{isUnread && (
							<View style={[styles.unreadBadge, { backgroundColor: theme.tint }]}>
								<Text style={styles.unreadCount}>
									{(item?.unreadCount || 0) > 99 ? '99+' : (item?.unreadCount || 0)}
								</Text>
							</View>
						)}
					</View>
					
					<View style={styles.conversationInfo}>
						<View style={styles.conversationHeader}>
							<Text style={[styles.conversationName, { color: theme.text }]}>
								{item?.isGroup ? item?.groupName : 'Chat'}
							</Text>
							{lastMessage && (
								<Text style={[styles.messageTime, { color: theme.icon }]}>
									{new Date(lastMessage?.timestamp || Date.now()).toLocaleTimeString([], { 
										hour: '2-digit', 
										minute: '2-digit' 
									})}
								</Text>
							)}
						</View>
						
						<View style={styles.conversationFooter}>
							<Text 
								style={[
									styles.lastMessage, 
									{ color: isUnread ? theme.text : theme.icon }
								]}
								numberOfLines={1}
							>
								{lastMessage?.content || 'No messages yet'}
							</Text>
							{isUnread && (
								<View style={[styles.unreadDot, { backgroundColor: theme.tint }]} />
							)}
						</View>
					</View>
				</TouchableOpacity>
			);
		} catch (error) {
			console.error('Error rendering conversation:', error);
			return null;
		}
	};

	const renderEmptyState = () => (
		<NoMessages />
	);

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<Text style={[styles.headerTitle, { color: theme.text }]}>
					Chats
				</Text>
				{safeTotalUnreadCount > 0 && (
					<View style={[styles.totalUnreadBadge, { backgroundColor: theme.tint }]}>
						<Text style={styles.totalUnreadCount}>
							{safeTotalUnreadCount > 99 ? '99+' : safeTotalUnreadCount}
						</Text>
					</View>
				)}
			</View>

			{/* Conversations List */}
			<FlatList
				data={safeConversations}
				renderItem={renderConversation}
				keyExtractor={(item) => item?.id || Math.random().toString()}
				style={styles.conversationsList}
				contentContainerStyle={safeConversations?.length === 0 ? styles.emptyList : styles.conversationsContent}
				ListEmptyComponent={renderEmptyState}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}

export default function TabOneScreen() {
	return (
		<ErrorBoundary>
			<ChatScreenContent />
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	totalUnreadBadge: {
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 4,
		minWidth: 24,
		alignItems: 'center',
	},
	totalUnreadCount: {
		color: 'white',
		fontSize: 12,
		fontWeight: '600',
	},
	conversationsList: {
		flex: 1,
	},
	conversationsContent: {
		paddingVertical: 8,
	},
	emptyList: {
		flex: 1,
	},
	conversationItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginHorizontal: 16,
		marginVertical: 4,
		borderRadius: 12,
	},
	avatarContainer: {
		position: 'relative',
		marginRight: 12,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: {
		color: 'white',
		fontSize: 18,
		fontWeight: '600',
	},
	unreadBadge: {
		position: 'absolute',
		top: -2,
		right: -2,
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	unreadCount: {
		color: 'white',
		fontSize: 10,
		fontWeight: '600',
	},
	conversationInfo: {
		flex: 1,
	},
	conversationHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	conversationName: {
		fontSize: 16,
		fontWeight: '600',
	},
	messageTime: {
		fontSize: 12,
	},
	conversationFooter: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	lastMessage: {
		flex: 1,
		fontSize: 14,
		marginRight: 8,
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
}); 