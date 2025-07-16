import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";

import SocketStatusIndicator from "@/app/components/SocketStatusIndicator";
import { useSocket } from "@/app/context/SocketContext";
import socketService from "@/app/services/socket.service";
import { useGroupStore } from "@/app/store/useGroupStore";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/store/useUserStore";
import { BackgroundPattern } from "../conversation/components/BackgroundPattern";
import { MessageInput } from "../conversation/components/MessageInput";

const GroupChatScreen: React.FC = () => {
	const theme = useAppTheme();
	const router = useRouter();
	const { groupId: id } = useLocalSearchParams();
	const { user } = useUserStore();
	const { messages, isLoading, error, fetchMessages, sendMessage, addMessage } = useGroupStore();
	const { isConnected } = useSocket();
	const [newMessage, setNewMessage] = useState("");
	const groupId = id as string;
	const flatListRef = useRef<FlatList>(null);

	console.log("group screen ----- ", id)
	console.log("GroupChatScreen component rendered with ID:", id)

	useEffect(() => {
		if (groupId) {
			fetchMessages(groupId);
			// Join group room for real-time messages
			socketService.joinGroup(groupId);
		}

		// Cleanup: leave group room when component unmounts
		return () => {
			if (groupId) {
				socketService.leaveGroup(groupId);
			}
		};
	}, [groupId, fetchMessages]);

	const handleSendMessage = async () => {
		if (newMessage.trim() && groupId) {
			const messageContent = newMessage.trim();
			setNewMessage("");
			
			try {
				// Send via API for persistence
				await sendMessage(groupId, messageContent, "text");
				
				// Also send via socket for real-time delivery
				socketService.sendGroupMessage(groupId, messageContent, "text");
			} catch (error) {
				console.error("Error sending message:", error);
			}
		}
	};

	const renderMessage = ({ item }: { item: any }) => {
		const isOwnMessage = item.senderId === user?.id;
		
		return (
			<View style={[
				styles.messageContainer,
				isOwnMessage ? styles.ownMessage : styles.otherMessage
			]}>
				{!isOwnMessage && (
					<Text style={[styles.senderName, { color: theme.textSecondary }]}>
						{item.sender?.firstName || "Unknown"}
					</Text>
				)}
				<View style={[
					styles.messageBubble,
					{
						backgroundColor: isOwnMessage ? theme.tint : theme.card,
						borderColor: isOwnMessage ? theme.tint : theme.border,
					}
				]}>
					<Text style={[
						styles.messageText,
						{ color: isOwnMessage ? "white" : theme.text }
					]}>
						{item.content}
					</Text>
					<Text style={[
						styles.messageTime,
						{ color: isOwnMessage ? "rgba(255,255,255,0.7)" : theme.textSecondary }
					]}>
						{new Date(item.timestamp).toLocaleTimeString([], { 
							hour: '2-digit', 
							minute: '2-digit' 
						})}
					</Text>
				</View>
			</View>
		);
	};

	const groupMessages = messages[groupId] || [];


	const renderEmptyBanner = () => (
		<View style={{ padding: 12, alignItems: 'center', backgroundColor: theme.card, borderRadius: 12, margin: 16 }}>
			{/* <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16 }}>No messages yet</Text> */}
			<Text style={{ color: theme.textSecondary, marginTop: 4, textAlign: 'center' }}>
				Start the conversation by sending a message to the group!
			</Text>
		</View>
	);

	return (
		<KeyboardAvoidingView
			style={[styles.container]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
		>
			<View style={{ flex: 1, position: 'relative' }}>
				{/* Backdrop */}
				

				{/* Header */}
				<View style={[styles.header, { borderBottomColor: theme.border, zIndex: 1, backgroundColor: theme.background }]}> 
					<TouchableOpacity 
						style={styles.backButton}
						onPress={() => router.back()}
					>
						<Ionicons name="arrow-back" size={24} color={theme.text} />
					</TouchableOpacity>
					<View style={styles.headerContent}>
						<Text style={[styles.headerTitle, { color: theme.text }]}>Group Chat</Text>
						<Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}> {isLoading ? "Loading..." : `${groupMessages.length} messages`} </Text>
						<SocketStatusIndicator size="small" />
					</View>
				</View>
				<BackgroundPattern theme={theme} />

				{/* Banner */}
				{groupMessages.length === 0 && (
					<View style={{ zIndex: 1 }}>{renderEmptyBanner()}</View>
				)}

				{/* Messages List */}
				<FlatList
					ref={flatListRef}
					data={groupMessages}
					renderItem={renderMessage}
					keyExtractor={(item) => item.id}
					style={[styles.messagesList, { zIndex: 1 }]}
					contentContainerStyle={[
						groupMessages.length === 0 ? styles.emptyList : styles.messagesContent
					]}
					showsVerticalScrollIndicator={false}
					onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
					onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
				/>

				{/* Message Input */}
				<MessageInput
					newMessage={newMessage}
					setNewMessage={setNewMessage}
					onSendMessage={handleSendMessage}
					isSending={isLoading}
					isConnected={isConnected}
					theme={theme}
				/>
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingTop: 42,
		borderBottomWidth: 1,
	},
	backButton: {
		padding: 8,
		marginRight: 8,
	},
	headerContent: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
	},
	headerSubtitle: {
		fontSize: 14,
		marginTop: 2,
	},
	messagesList: {
		flex: 1,
	},
	messagesContent: {
		paddingVertical: 16,
		paddingHorizontal: 16,
	},
	emptyList: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	messageContainer: {
		marginBottom: 12,
	},
	ownMessage: {
		alignItems: "flex-end",
	},
	otherMessage: {
		alignItems: "flex-start",
	},
	messageBubble: {
		maxWidth: "80%",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 20,
		borderWidth: 1,
	},
	senderName: {
		fontSize: 12,
		fontWeight: "500",
		marginBottom: 4,
	},
	messageText: {
		fontSize: 16,
		lineHeight: 22,
	},
	messageTime: {
		fontSize: 12,
		marginTop: 4,
		alignSelf: "flex-end",
	},
	emptyStateContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginTop: 16,
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: 16,
		marginTop: 8,
		textAlign: "center",
		opacity: 0.7,
	},
	inputContainer: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: 1,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "flex-end",
		borderRadius: 24,
		borderWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		maxHeight: 100,
		paddingVertical: 8,
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 8,
	},
});

export default GroupChatScreen; 