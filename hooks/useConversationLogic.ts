import { useUserInactivity } from "@/context/UserInactivityContext";
import { ruseSocketContext } from '@/context/useSockectContext';
import { getOtherParticipantDetails } from '@/helpers/conversationUtils';
import { useSocketChat } from '@/hooks/useSocketChat';
import { useChatStore, useConversation, useConversationMessages } from '@/store/useChatStore';
import { useContactStore } from '@/store/useContactStore';
import useFormStore from "@/store/useFormStore";
import { User } from "@/types/conversation";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, FlatList } from "react-native";
import { useMessageNotifications } from "./useMessageNotifications";

interface UseConversationLogicProps {
	conversationId: string;
	recipientId: string;
	user: User | null;
	isEncrypted?: boolean;
	encryptionKey?: string;
}

export const useConversationLogic = ({
	conversationId,
	recipientId,
	user,
	isEncrypted,
}: UseConversationLogicProps) => {
	const messages = useConversationMessages(conversationId);
	const conversation = useConversation(conversationId);
	const { contacts } = useContactStore();
	const { allUsers } = useUserInactivity();
	const { socket } = ruseSocketContext();
	const { formValues } = useFormStore(["formValues"]);

	const {
		addMessage,
		markConversationAsRead,
		setActiveConversation,
		createConversation,
	} = useChatStore((state) => state);
	const { sendMessageNotification, sendPendingMessagesNotification } =
		useMessageNotifications();
	const { sendMessage: sendSocketMessage, isConnected } = useSocketChat();

	const [newMessage, setNewMessage] = useState("");
	const [isSending, setIsSending] = useState(false);
	const flatListRef = useRef<FlatList>(null);
	const [showMenu, setShowMenu] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const menuAnimation = useRef(new Animated.Value(0)).current;
	const detailsAnimation = useRef(new Animated.Value(0)).current;

	const participantDetails = useMemo(() => {
		if (conversation?.isGroup) {
			return {
				name: conversation.groupName || "Group",
				profile: conversation.groupAvatar || "G",
				id: conversation.id,
			};
		}

		const details = getOtherParticipantDetails(
			recipientId,
			user?.id,
			contacts,
			allUsers as any
		);

		return details;
	}, [conversation, recipientId, user?.id, contacts, allUsers]);

	useEffect(() => {
		if (!conversationId) return;
		setActiveConversation(conversationId);
		markConversationAsRead(conversationId);
		if (socket && user?.id) {
			socket.emit("message_read", { conversationId });
		}
		return () => setActiveConversation(null);
	}, [conversationId, setActiveConversation, messages, socket, user?.id]);

	useEffect(() => {
		if (messages && messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);

	const toggleMenu = () => {
		const toValue = showMenu ? 0 : 1;
		const newShowMenu = !showMenu;
		setShowMenu(newShowMenu);
		Animated.spring(menuAnimation, {
			toValue,
			useNativeDriver: true,
			tension: 65,
			friction: 11,
		}).start();
	};

	const toggleDetails = () => {
		const toValue = showDetails ? 0 : 1;
		setShowDetails(!showDetails);
		Animated.spring(detailsAnimation, {
			toValue,
			useNativeDriver: true,
			tension: 65,
			friction: 11,
		}).start();
	};

	const handleMenuOption = (optionId: string) => {
		toggleMenu();
		switch (optionId) {
			case "details":
				toggleDetails();
				break;
			case "payment":
				break;
			case "leave":
				// Handle leave group
				break;
		}
	};

	const handleSendMessage = async () => {
		if (!newMessage.trim() || !user?.id || !recipientId || !conversationId)
			return;

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		setIsSending(true);
		try {
			if (!conversation) {
				createConversation({
					participants: [user.id, recipientId],
					isGroup: false,
				});
			}

			const messageStatus = isConnected ? "delivered" : "pending";
			const messageObj: any = {
				recipientId,
				senderId: user.id,
				content: newMessage.trim(),
				type: "text",
				isEncrypted,
			};
			if (isEncrypted && formValues?.key) {
				messageObj.encryptionKey = formValues.key;
			}
			addMessage(messageObj, messageStatus);

			sendSocketMessage(
				recipientId,
				newMessage.trim(),
				"text",
				isEncrypted,
				isEncrypted && formValues?.key ? formValues.key : undefined
			);
			// sendMessageNotification({
			//     senderId: user.id,
			//     content: newMessage.trim(),
			//     senderName: user.firstName,
			//     messageId: recipientId
			// })

			setNewMessage("");

			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 50);
		} catch (error) {
			Alert.alert("Error", "Failed to send message");
		} finally {
			setIsSending(false);
		}
	};

	const handleChatPress = (memberId: string) => {
		// Handle chat press for group members
	};

	return {
		messages,
		conversation,
		participantDetails,
		newMessage,
		setNewMessage,
		isSending,
		isConnected,
		flatListRef,
		showMenu,
		showDetails,
		menuAnimation,
		detailsAnimation,
		toggleMenu,
		toggleDetails,
		handleMenuOption,
		handleSendMessage,
		handleChatPress,
	};
}; 