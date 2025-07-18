import { EncryptText } from "@/helpers/cypher";
import useFormStore from "@/store/useFormStore";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { EncryptionModal } from "./EncryptionModal";

interface MessageInputProps {
	newMessage: string;
	setNewMessage: (message: string) => void;
	onSendMessage: () => void;
	isSending: boolean;
	isConnected: boolean;
	theme: any;
	isEncrypted: boolean;
	setIsEncrypted: (val: boolean) => void;
	encryptionKey?: string;
	setEncryptionKey: (val: string | undefined) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
	newMessage,
	setNewMessage,
	onSendMessage,
	isSending,
	isConnected,
	theme,
	isEncrypted,
	setIsEncrypted,
	encryptionKey,
	setEncryptionKey,
}) => {
	const [showEncryptModal, setShowEncryptModal] = React.useState(false);
	const { formValues } = useFormStore(["formValues"]);
	const [plainMessage, setPlainMessage] = React.useState("");

	const handleSelectNumber = (num: number | string) => {
		setEncryptionKey(num ? String(num) : undefined);
		setShowEncryptModal(false);
	};

	return (
		<>
			<EncryptionModal
				visible={showEncryptModal}
				onClose={() => setShowEncryptModal(false)}
				onSelect={handleSelectNumber}
				theme={theme}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
				style={styles.keyboardAvoid}
			>
				<View
					style={[
						styles.inputBar,
						{ backgroundColor: theme.card },
						Platform.OS === "android" ? styles.inputBarAndroid : {},
					]}
				>
					<TouchableOpacity style={{ marginRight: 8, padding: 2 }}>
						<Ionicons name="add-circle-outline" size={26} color={theme.icon} />
					</TouchableOpacity>
					<View
						style={[
							styles.inputContainer,
							{
								backgroundColor: theme.isDark
									? "rgba(255, 255, 255, 0.1)"
									: "rgba(0, 0, 0, 0.05)",
							},
							Platform.OS === "android" ? styles.inputContainerAndroid : {},
						]}
					>
						<TextInput
							style={[
								styles.input,
								{ color: theme.text },
								Platform.OS === "android" ? styles.inputAndroid : {},
							]}
							placeholder="Type a message"
							placeholderTextColor={theme.icon}
							value={
								isEncrypted && encryptionKey
									? EncryptText(plainMessage, Number(encryptionKey))
									: plainMessage
							}
							onChangeText={(text) => {
								setPlainMessage(text);
								setIsEncrypted(false);
								setNewMessage(text);
							}}
							onSubmitEditing={onSendMessage}
							returnKeyType="send"
							multiline
							maxLength={500}
							textAlignVertical="center"
						/>
						{encryptionKey ? (
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => {
									setIsEncrypted(!isEncrypted);
									if (!isEncrypted) {
										setNewMessage(
											EncryptText(plainMessage, Number(encryptionKey))
										);
									} else {
										setNewMessage(plainMessage);
									}
								}}
								onLongPress={() => {
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
									setShowEncryptModal(true);
								}}
								style={{
									height: 30,
									width: 30,
									borderRadius: 70,
									alignItems: "center",
									justifyContent: "center",
									borderColor: theme.icon,
									borderWidth: 0.9,
								}}
							>
								<Feather
									name={isEncrypted ? "unlock" : "lock"}
									size={15}
									color={theme.icon}
								/>
							</TouchableOpacity>
						) : (
							<TouchableOpacity onPress={() => setShowEncryptModal(true)}>
								<MaterialCommunityIcons
									name="key-outline"
									size={24}
									color={theme.icon}
								/>
							</TouchableOpacity>
						)}
					</View>
					<TouchableOpacity
						onPress={() => {
							// Always send the plain message or encrypted, depending on isEncrypted
							if (isEncrypted && encryptionKey) {
								setNewMessage(EncryptText(plainMessage, Number(encryptionKey)));
							} else {
								setNewMessage(plainMessage);
							}
							onSendMessage();
							setPlainMessage("");
							setIsEncrypted(false);
						}}
						style={[
							styles.sendButton,
							{
								backgroundColor: theme.tint,
								borderColor: theme.border,
								opacity: isSending ? 0.6 : 1,
							},
							Platform.OS === "android" ? styles.sendButtonAndroid : {},
						]}
						disabled={!plainMessage?.trim() || isSending}
					>
						<Ionicons
							name={isSending ? "time" : "send"}
							size={20}
							color={"white"}
						/>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</>
	);
};

const styles = StyleSheet.create({
	keyboardAvoid: {
		width: "100%",
		bottom: 0,
		left: 0,
		right: 0,
	},
	inputBar: {
		flexDirection: "row",
		alignItems: "flex-end",
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 2,
		borderTopWidth: 0.5,
		borderTopColor: "rgba(150, 150, 150, 0.2)",
	},
	inputContainer: {
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
		flex: 1,
		borderRadius: 20,
		paddingHorizontal: 10,
		paddingVertical: 6,
		maxHeight: 100,
	},
	input: {
		fontSize: 16,
		lineHeight: 20,
		minHeight: 20,
		width: "90%",
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
	},
	inputBarAndroid: {
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	inputContainerAndroid: {
		borderRadius: 40,
		paddingHorizontal: 8,
		paddingVertical: 10,
	},
	inputAndroid: {
		fontSize: 16,
		lineHeight: 20,
		minHeight: 20,
		paddingVertical: 0,
	},
	sendButtonAndroid: {
		elevation: 2,
		borderRadius: 20,
	},
});
