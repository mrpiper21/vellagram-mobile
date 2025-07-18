import { DecryptText } from "@/helpers/cypher";
import { Message as MessageType } from "@/types/conversation";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
	Animated,
	Easing,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	useWindowDimensions,
} from "react-native";

interface MessageProps {
	message: MessageType;
	isOwnMessage: boolean;
	theme: any;
}

export const Message: React.FC<MessageProps> = ({
	message,
	isOwnMessage,
	theme,
}) => {
	const [showActions, setShowActions] = React.useState(false);
	const [modalY, setModalY] = React.useState(0);
	const [modalX, setModalX] = React.useState(0);
	const [decyphered, setDecyphered] = React.useState<string | null>(null);
	const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
	const opacityAnim = React.useRef(new Animated.Value(0)).current;
	const bubbleRef = React.useRef<View>(null);

	const window = useWindowDimensions();
	const MODAL_WIDTH = 180; // or whatever your modal minWidth is
	const MODAL_MARGIN = 8;

	const getStatusIcon = (status?: string) => {
		switch (status) {
			case "pending":
				return "time";
			case "delivered":
				return "checkmark";
			case "read":
				return "checkmark-done";
			default:
				return "time";
		}
	};

	const handleLongPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		if (bubbleRef.current) {
			bubbleRef.current.measure((fx, fy, width, height, px, py) => {
				let x = px + width / 2 - MODAL_WIDTH / 2;
				let y = py + height + MODAL_MARGIN;

				// Clamp X so modal stays within screen
				if (x < MODAL_MARGIN) x = MODAL_MARGIN;
				if (x + MODAL_WIDTH > window.width - MODAL_MARGIN)
					x = window.width - MODAL_WIDTH - MODAL_MARGIN;

				// Clamp Y if needed (optional)
				if (y + 80 > window.height) y = window.height - 100;

				setModalY(y);
				setModalX(x);
				setShowActions(true);
				Animated.parallel([
					Animated.timing(scaleAnim, {
						toValue: 1,
						duration: 180,
						useNativeDriver: true,
						easing: Easing.out(Easing.ease),
					}),
					Animated.timing(opacityAnim, {
						toValue: 1,
						duration: 120,
						useNativeDriver: true,
					}),
				]).start();
			});
		}
	};

	const handleCloseActions = () => {
		Animated.parallel([
			Animated.timing(scaleAnim, {
				toValue: 0.8,
				duration: 120,
				useNativeDriver: true,
			}),
			Animated.timing(opacityAnim, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start(() => setShowActions(false));
	};

	const handleDecypher = () => {
		if (message.isEncrypted && message.encryptionKey) {
			setDecyphered(
				DecryptText(message.content, Number(message.encryptionKey))
			);
		}
		handleCloseActions();
	};

	const handleDelete = () => {
		// Implement delete logic here (e.g., call a prop or dispatch)
		handleCloseActions();
	};

	return (
		<View
			style={[
				styles.messageContainer,
				isOwnMessage ? styles.ownMessage : styles.otherMessage,
			]}
		>
			<TouchableOpacity
				activeOpacity={0.8}
				onLongPress={handleLongPress}
				delayLongPress={250}
				ref={bubbleRef}
			>
				<View
					style={[
						styles.messageBubble,
						isOwnMessage ? styles.ownBubble : styles.otherBubble,
						{
							backgroundColor: isOwnMessage ? theme.border : theme.tint + "22",
							borderColor: message.isEncrypted ? theme.tint : theme.border,
							...(message.isEncrypted && {
								backgroundColor: theme.cyphered,
								fontFamily: "san-serif",
							}),
						},
					]}
				>
					<Text style={[styles.messageText, { color: theme.text }]}>
						{message.isEncrypted && (
							<Feather
								name="lock"
								size={14}
								color={theme.text}
								style={{ marginRight: 4, opacity: 0.6 }}
							/>
						)}
						{decyphered ?? message.content}
					</Text>
					<View style={styles.messageFooter}>
						<Text style={[styles.messageTime, { color: theme.text }]}>
							{new Date(message.timestamp).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</Text>
						{isOwnMessage && (
							<Ionicons
								name={getStatusIcon(message.status)}
								size={14}
								color={theme.text}
								style={styles.statusIcon}
							/>
						)}
					</View>
				</View>
			</TouchableOpacity>
			{showActions && (
				<Modal
					visible={showActions}
					transparent
					animationType="none"
					onRequestClose={handleCloseActions}
				>
					<TouchableOpacity
						style={{ flex: 1 }}
						activeOpacity={1}
						onPress={handleCloseActions}
					>
						<Animated.View
							style={{
								position: "absolute",
								left: modalX,
								top: modalY,
								zIndex: 1000,
								backgroundColor: theme.card,
								borderRadius: 12,
								borderWidth: 1,
								borderColor: theme.border,
								paddingVertical: 8,
								paddingHorizontal: 0,
								shadowColor: "#000",
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.15,
								shadowRadius: 8,
								elevation: 6,
								minWidth: MODAL_WIDTH,
								transform: [{ scale: scaleAnim }],
								opacity: opacityAnim,
							}}
						>
							<TouchableOpacity
								style={{ paddingVertical: 12, paddingHorizontal: 20 }}
								onPress={handleDelete}
							>
								<Text style={{ color: theme.text, fontSize: 16 }}>
									Delete message
								</Text>
							</TouchableOpacity>
							{message.isEncrypted && message.encryptionKey && (
								<TouchableOpacity
									style={{ paddingVertical: 12, paddingHorizontal: 20 }}
									onPress={handleDecypher}
								>
									<Text style={{ color: theme.text, fontSize: 16 }}>
										Decypher text
									</Text>
								</TouchableOpacity>
							)}
						</Animated.View>
					</TouchableOpacity>
				</Modal>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	messageContainer: {
		marginVertical: 4,
		paddingHorizontal: 16,
	},
	ownMessage: {
		alignItems: "flex-end",
	},
	otherMessage: {
		alignItems: "flex-start",
	},
	messageBubble: {
		maxWidth: "80%",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
		marginBottom: 2,
		alignSelf: "flex-start",
	},
	ownBubble: {
		alignSelf: "flex-end",
	},
	otherBubble: {
		alignSelf: "flex-start",
	},
	encryptedBubble: {
		borderWidth: 1,
	},
	messageText: {
		fontSize: 16,
		lineHeight: 20,
		flexDirection: "row",
		alignItems: "center",
	},
	messageFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: 2,
	},
	messageTime: {
		fontSize: 12,
		opacity: 0.7,
	},
	statusIcon: {
		marginLeft: 2,
	},
});
