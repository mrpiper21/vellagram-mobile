import CustomPasscodeBottomSheet from "@/app/components/ui/CustomPasscodeBottomSheet";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserInactivity } from "@/context/UserInactivityContext";
import {
	getDisplayNameForUser,
	getOtherParticipantDetails,
} from "@/helpers/conversationUtils";
import { useConversationLogic } from "@/hooks/useConversationLogic";
import { useChatStore } from "@/store/useChatStore";
import { useContactById, useContactStore } from "@/store/useContactStore";
import { useUserStore } from "@/store/useUserStore";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { BackgroundPattern } from "./components/BackgroundPattern";
import { GroupDetailsSheet } from "./components/GroupDetailsSheet";
import { Header } from "./components/Header";
import { MenuDropdown } from "./components/MenuDropdown";
import { MessageInput } from "./components/MessageInput";
import { MessagesList } from "./components/MessagesList";

export default function ConversationScreen() {
	const { id: recipientId } = useLocalSearchParams<{ id: string }>();
	const theme = useAppTheme();
	const user = useUserStore((state) => state.user);
	const getConversationId = useChatStore((state) => state.getConversationId);

	const conversationId = useMemo(
		() => (user?.id ? getConversationId(user.id, recipientId) : null),
		[user?.id, recipientId]
	);

	if (!conversationId) {
		return <LoadingScreen theme={theme} />;
	}

	return (
		<ConversationView
			theme={theme}
			conversationId={conversationId}
			recipientId={recipientId}
		/>
	);
}

interface ConversationViewProps {
	theme: any;
	conversationId: string;
	recipientId: string;
}

const ConversationView = ({
	theme,
	conversationId,
	recipientId,
}: ConversationViewProps) => {
	const { contacts } = useContactStore();
	const { allUsers } = useUserInactivity();
	const recipientContact = useContactById(recipientId);
	const user = useUserStore((state) => state.user);

	// Lift encryption state
	const [isEncrypted, setIsEncrypted] = useState(false);
	const [encryptionKey, setEncryptionKey] = useState<string | undefined>(
		undefined
	);

	const {
		messages,
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
	} = useConversationLogic({
		conversationId,
		recipientId,
		user,
		isEncrypted,
		encryptionKey,
	});

	const [localMessages, setLocalMessages] = useState(messages || []);
	React.useEffect(() => {
		setLocalMessages(messages || []);
	}, [messages]);

	const [showPasscodeSheet, setShowPasscodeSheet] = useState(false);
	const [selectedMessage, setSelectedMessage] = useState<any>(null);
	const [lastDecypheredId, setLastDecypheredId] = useState<string | null>(null);

	const openPasscodeSheet = () => setShowPasscodeSheet(true);

	const handleRequestDecypher = (msg: any) => {
		setSelectedMessage(msg);
		setShowPasscodeSheet(true);
	};

	const handleDecypher = (decyphered: string) => {
		if (selectedMessage) {
			setLocalMessages((prev) =>
				prev.map((msg) =>
					msg.id === selectedMessage.id
						? { ...msg, content: decyphered, isEncrypted: false }
						: msg
				)
			);
			setLastDecypheredId(selectedMessage.id);
			setSelectedMessage(null);
		}
		setShowPasscodeSheet(false);
	};

	const conversationUser = getOtherParticipantDetails(
		recipientId,
		user?.id,
		contacts,
		allUsers || []
	);
	const displayName = getDisplayNameForUser(recipientId, conversationUser.name);
	return (
		<View style={{ flex: 1 }}>
			<Header
				groupName={displayName}
				groupAvatar={displayName?.charAt(0)?.toUpperCase() || "U"}
				onMenuPress={toggleMenu}
				profileUrl={participantDetails.profile || undefined}
				recipientInfo={{
					name: displayName,
					id: recipientId,
					profile: conversationUser.profile,
					phoneNumber: recipientContact?.phoneNumber || "",
				}}
			/>
			<BackgroundPattern theme={theme} />
			<MenuDropdown
				visible={showMenu}
				onClose={toggleMenu}
				onOptionPress={handleMenuOption}
				animation={menuAnimation}
			/>
			<GroupDetailsSheet
				visible={showDetails}
				onClose={toggleDetails}
				groupName={displayName}
				groupAvatar={displayName?.charAt(0)?.toUpperCase() || "U"}
				animation={detailsAnimation}
				onChatPress={handleChatPress}
			/>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={Platform.OS === "ios" ? 1 : 0}
			>
				{/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> */}
				<View style={{ flex: 1 }}>
					<View style={{ flex: 1 }}>
						<MessagesList
							messages={localMessages}
							flatListRef={flatListRef}
							theme={theme}
							user={user as any}
							openPasscodeSheet={openPasscodeSheet}
							onRequestDecypher={handleRequestDecypher}
							lastDecypheredId={lastDecypheredId}
						/>
					</View>
					<View style={{ backgroundColor: theme.background }}>
						<MessageInput
							newMessage={newMessage}
							setNewMessage={setNewMessage}
							onSendMessage={handleSendMessage}
							isSending={isSending}
							isConnected={isConnected}
							theme={theme}
							isEncrypted={isEncrypted}
							setIsEncrypted={setIsEncrypted}
							encryptionKey={encryptionKey}
							setEncryptionKey={setEncryptionKey}
						/>
					</View>
				</View>
				{/* </TouchableWithoutFeedback> */}
			</KeyboardAvoidingView>
			<CustomPasscodeBottomSheet
				visible={showPasscodeSheet}
				onClose={() => setShowPasscodeSheet(false)}
				userPin={user?.pin || ""}
				encryptedText={selectedMessage?.content || ""}
				encryptionKey={selectedMessage?.encryptionKey || "0"}
				onDecypher={handleDecypher}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: "relative",
	},
});
