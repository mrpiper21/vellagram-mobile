import NoMessages from '@/components/empty-states/NoMessages';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppTheme } from '@/context/ThemeContext';
import { useSocketChat } from '@/hooks/useSocketChat';
import { useConversations, useTotalUnreadCount } from '@/store/useChatStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function ChatScreenContent() {
	const theme = useAppTheme();
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
					style={[styles.conversationItem, { backgroundColor: theme.card, borderColor: theme.border}]}
					onPress={() => {
						if (item?.id) {
							router.push(`/conversation/${item.id}`);
						}
					}}
					activeOpacity={0.85}
				>
					<View style={styles.avatarContainer}>
						<View style={[styles.avatar, { backgroundColor: theme.tint }] }>
							<Text style={styles.avatarText}>
								{item?.isGroup ? 'G' : item?.participants?.[0]?.charAt(0)?.toUpperCase() || 'U'}
							</Text>
							{isUnread && (
								<View style={[styles.unreadBadge, { backgroundColor: theme.tint }] }>
									<Text style={styles.unreadCount}>
										{(item?.unreadCount || 0) > 99 ? '99+' : (item?.unreadCount || 0)}
									</Text>
								</View>
							)}
						</View>
					</View>
					<View style={styles.conversationInfo}>
						<View style={styles.conversationHeader}>
							<Text style={styles.conversationName} numberOfLines={1}>
								{item?.isGroup ? item?.groupName : 'Chat'}
							</Text>
							{lastMessage && (
								<Text style={styles.messageTime}>
									{new Date(lastMessage?.timestamp || Date.now()).toLocaleTimeString([], { 
										hour: '2-digit', 
										minute: '2-digit' 
									})}
								</Text>
							)}
						</View>
						<View style={styles.conversationFooter}>
							<Text 
								style={[styles.lastMessage, isUnread ? styles.lastMessageUnread : styles.lastMessageRead]}
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
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, shadowColor: theme.border, shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}>
				<Text style={[styles.headerTitle, { color: theme.text }]}>
					Chats
				</Text>
				<View style={styles.headerRight}>
					{safeTotalUnreadCount > 0 && (
						<View style={[styles.totalUnreadBadge, { backgroundColor: theme.tint }]}>
							<Text style={styles.totalUnreadCount}>
								{safeTotalUnreadCount > 99 ? '99+' : safeTotalUnreadCount}
							</Text>
						</View>
					)}
					<TouchableOpacity
						style={[styles.headerPlusBtn, { backgroundColor: theme.tint }]}
						onPress={() => router.push('/contacts')}
						activeOpacity={0.8}
					>
						<Ionicons name="add" size={24} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>

			<FlatList
				data={safeConversations}
				renderItem={renderConversation}
				keyExtractor={(item) => item?.id || Math.random().toString()}
				style={styles.conversationsList}
				contentContainerStyle={safeConversations?.length === 0 ? styles.emptyList : styles.conversationsContent}
				ListEmptyComponent={renderEmptyState}
				showsVerticalScrollIndicator={false}
			/>

			<TouchableOpacity
				style={[styles.fab, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
				onPress={() => router.push('/contacts')}
				activeOpacity={0.85}
			>
				<Ionicons name="add" size={28} color="#fff" />
			</TouchableOpacity>
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
		paddingVertical: 18,
		paddingTop: 38,
		borderBottomWidth: 1,
		zIndex: 2,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	headerRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	headerPlusBtn: {
		marginLeft: 8,
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 6,
		elevation: 3,
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
		paddingBottom: 100,
	},
	emptyList: {
		flex: 1,
	},
	conversationItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		borderBottomWidth: .5,
	},
	avatarContainer: {
		marginLeft: 16,
		marginRight: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	avatarText: {
		color: 'white',
		fontSize: 18,
		fontWeight: '600',
	},
	unreadBadge: {
		position: 'absolute',
		top: -6,
		right: -6,
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 2,
		paddingHorizontal: 4,
	},
	unreadCount: {
		color: 'white',
		fontSize: 10,
		fontWeight: '600',
	},
	conversationInfo: {
		flex: 1,
		justifyContent: 'center',
	},
	conversationHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 2,
	},
	conversationName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#222',
	},
	messageTime: {
		fontSize: 12,
		color: '#888',
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
	lastMessageUnread: {
		fontWeight: '600',
		color: '#222',
	},
	lastMessageRead: {
		fontWeight: '400',
		color: '#888',
	},
	unreadDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	fab: {
		position: 'absolute',
		bottom: 32,
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: 'center',
		justifyContent: 'center',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.18,
		shadowRadius: 8,
		elevation: 6,
		zIndex: 10,
	},
}); 