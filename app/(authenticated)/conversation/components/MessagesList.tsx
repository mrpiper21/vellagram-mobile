import { Message as MessageType, User } from "@/types/conversation";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Message } from "./Message";

interface MessagesListProps {
	messages: any[];
	flatListRef: React.RefObject<FlatList<any> | null>;
	theme: any;
	user: User | null;
}

export const MessagesList: React.FC<MessagesListProps> = ({
	messages,
	flatListRef,
	theme,
	user,
}) => {
	const renderMessage = ({ item }: { item: any }) => {
		const isOwnMessage = item?.senderId === user?.id;
		return (
			<Message
				message={item as MessageType}
				isOwnMessage={isOwnMessage}
				theme={theme}
			/>
		);
	};

	useEffect(() => {
		if (flatListRef.current && messages.length > 0) {
			requestAnimationFrame(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			});
		}
	}, [messages.length]);

	return (
		<View
			style={[styles.messagesContainer, { backgroundColor: "transparent" }]}
		>
			<FlatList
				ref={flatListRef}
				data={messages}
				keyExtractor={(item) =>
					item?.id || `msg-${item?.timestamp || Date.now()}`
				}
				renderItem={renderMessage}
				contentContainerStyle={styles.messagesList}
				showsVerticalScrollIndicator={false}
				style={{ backgroundColor: "transparent" }}
				// removeClippedSubviews={true}
				// maxToRenderPerBatch={10}
				// windowSize={10}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	messagesContainer: {
		flex: 1,
		position: "relative",
	},
	messagesList: {
		paddingVertical: 16,
		paddingBottom: 80,
	},
}); 