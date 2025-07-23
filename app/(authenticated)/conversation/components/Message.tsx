import { Message as MessageType } from "@/types/conversation";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
	Animated,
	Easing,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface MessageProps {
	message: MessageType;
	isOwnMessage: boolean;
	theme: any;
	openPasscodeSheet?: () => void;
	onRequestDecypher?: (msg: MessageType) => void;
	isJustDecyphered?: boolean;
}

export const Message: React.FC<MessageProps> = ({
	message,
	isOwnMessage,
	theme,
	openPasscodeSheet,
	onRequestDecypher,
	isJustDecyphered,
}) => {
	const [showActions, setShowActions] = React.useState(false);
	const [modalY, setModalY] = React.useState(0);
	const [modalX, setModalX] = React.useState(0);
	const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
	const opacityAnim = React.useRef(new Animated.Value(0)).current;
	const bubbleRef = React.useRef<View>(null);

	const MODAL_WIDTH = 180; // or whatever your modal minWidth is

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
		]).start(() => {
			setShowActions(false);
			// if (pendingDecypher) {
			// 	passcodeSheetRef.current?.snapToIndex(0);
			// 	setPendingDecypher(false);
			// }
		});
	};

	const handleDecypher = () => {
		setShowActions(false);
	};
	const handleDelete = () => {
		// Implement delete logic here (e.g., call a prop or dispatch)
		handleCloseActions();
	};

	const CustomActionSheet = ({
		visible,
		onClose,
		options,
		previewText,
	}: any) => {
		if (!visible) return null;
		return (
			<Modal
				transparent
				animationType="none"
				visible={visible}
				onRequestClose={onClose}
			>
				<View style={customStyles.backdrop} />
				<TouchableOpacity
					style={customStyles.overlay}
					activeOpacity={1}
					onPress={onClose}
				>
					<View style={customStyles.stackContainer}>
						{previewText && (
							<View
								style={[
									customStyles.previewContainer,
									{ backgroundColor: theme.border },
								]}
							>
								<Text
									style={[customStyles.previewText, { color: theme.text }]}
									numberOfLines={4}
									ellipsizeMode="tail"
								>
									{previewText}
								</Text>
							</View>
						)}
						<Animated.View
							style={[
								customStyles.sheet,
								{ backgroundColor: theme.card },
								{
									opacity: sheetAnim,
									transform: [
										{
											translateY: sheetAnim.interpolate({
												inputRange: [0, 1],
												outputRange: [40, 0],
											}),
										},
									],
								},
							]}
						>
							{options.map((opt: any, idx: number) => (
								<TouchableOpacity
									key={idx}
									style={[
										customStyles.option,
										opt.danger && customStyles.dangerOption,
									]}
									onPress={() => {
										opt.onPress && opt.onPress();
										onClose();
									}}
								>
									<View style={customStyles.optionRow}>
										{opt.icon}
										<Text
											style={[
												customStyles.optionText,
												opt.danger
													? { color: "#e74c3c" }
													: { color: theme.icon },
											]}
										>
											{opt.label}
										</Text>
									</View>
								</TouchableOpacity>
							))}
						</Animated.View>
					</View>
				</TouchableOpacity>
			</Modal>
		);
	};

	const customStyles = StyleSheet.create({
		backdrop: {
			...StyleSheet.absoluteFillObject,
			backgroundColor: "rgba(256,256,256,0.8)",
			zIndex: 0,
		},
		overlay: {
			flex: 1,
			justifyContent: "center",
			alignItems: "flex-end", // align to right
			paddingRight: 24, // space from right edge
			zIndex: 1,
		},
		sheet: {
			borderRadius: 16,
			padding: 16,
			minWidth: 180,
			elevation: 10,
			shadowColor: "#000",
			shadowOpacity: 0.12,
			shadowRadius: 8,
			shadowOffset: { width: 0, height: 2 },
		},
		option: {
			paddingVertical: 12,
			alignItems: "flex-start",
			paddingHorizontal: 12,
		},
		optionRow: { flexDirection: "row", alignItems: "center" },
		optionText: { fontSize: 16, color: "#222", marginLeft: 12 },
		dangerOption: {},
		previewContainer: {
			borderRadius: 10,
			padding: 10,
			maxWidth: 260, // wider for more text
			maxHeight: 90, // limit height for long messages
			marginBottom: 10, // gap between preview and dropdown
			shadowColor: "#000",
			shadowOpacity: 0.08,
			shadowRadius: 6,
			shadowOffset: { width: 0, height: 2 },
			overflow: "hidden", // ensure content doesn't overflow
			flexShrink: 1,
		},
		previewText: {
			fontSize: 15,
			flexShrink: 1,
		},
		stackContainer: {
			width: "100%",
			alignItems: "flex-end",
			justifyContent: "flex-end",
			paddingRight: 24,
			paddingBottom: 32,
		},
	});

	const [actionSheetVisible, setActionSheetVisible] = useState(false);
	const [selectedText, setSelectedText] = useState<string | null>(null);
	const [sheetAnim] = useState(new Animated.Value(0));

	const handleLongPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		setSelectedText(message.content); // or a snippet if too long
		setActionSheetVisible(true);
		sheetAnim.setValue(0);
		Animated.timing(sheetAnim, {
			toValue: 1,
			duration: 220,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start();
	};

	const handleDropdownDecypher = () => {
		if (onRequestDecypher) {
			onRequestDecypher(message);
		} else if (openPasscodeSheet) {
			openPasscodeSheet();
		}
	};

	const actionOptions = [
		{
			label: "Reply",
			icon: <Feather name="corner-up-left" size={18} color={theme.icon} />,
			onPress: () => {
				/* reply logic */
			},
		},
		{
			label: "Forward",
			icon: <Feather name="corner-up-right" size={18} color={theme.icon} />,
			onPress: () => {
				/* forward logic */
			},
		},
		{
			label: "Copy",
			icon: <Feather name="copy" size={18} color={theme.icon} />,
			onPress: () => {
				/* copy logic */
			},
		},
		...(message.isEncrypted
			? [
					{
						label: "Decypher text",
						icon: <Feather name="key" size={18} color={theme.icon} />,
						onPress: handleDropdownDecypher,
					},
			  ]
			: []),
		...(isOwnMessage
			? [
					{
						label: "Delete",
						icon: <Feather name="trash-2" size={18} color="#e74c3c" />,
						onPress: () => {
							/* delete logic */
						},
						danger: true,
					},
			  ]
			: []),
		// Add more as needed
	];
	const anim = React.useRef(new Animated.Value(0)).current;

	React.useEffect(() => {
		if (isJustDecyphered) {
			Animated.sequence([
				Animated.timing(anim, {
					toValue: 1,
					duration: 400,
					useNativeDriver: true,
				}),
				Animated.timing(anim, {
					toValue: 0,
					duration: 400,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [isJustDecyphered]);

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
				// delayLongPress={250}
				ref={bubbleRef}
			>
				<Animated.View
					style={{
						transform: [
							{
								scale: anim.interpolate({
									inputRange: [0, 1],
									outputRange: [1, 1.08],
								}),
							},
						],
						backgroundColor: isJustDecyphered
							? anim.interpolate({
									inputRange: [0, 1],
									outputRange: ["#fff", "#e0ffe0"],
							  })
							: undefined,
					}}
				>
					<View
						style={[
							styles.messageBubble,
							isOwnMessage ? styles.ownBubble : styles.otherBubble,
							{
								backgroundColor: isOwnMessage
									? theme.border
									: theme.tint + "22",
								borderColor: message.isEncrypted ? theme.tint : theme.border,
								// ...(message.isEncrypted && {
								// 	backgroundColor: theme.cyphered,
								// 	fontFamily: "san-serif",
								// }),
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
							{message.content}
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
				</Animated.View>
			</TouchableOpacity>
			<CustomActionSheet
				visible={actionSheetVisible}
				onClose={() => setActionSheetVisible(false)}
				options={actionOptions}
				previewText={selectedText}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: "row",
		marginVertical: 6, // more vertical gap between messages
		paddingHorizontal: 8,
	},
	ownMessage: {
		justifyContent: "flex-end",
	},
	otherMessage: {
		justifyContent: "flex-start",
	},
	messageBubble: {
		maxWidth: "78%",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 16,
		backgroundColor: "#f4f4f8",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		marginHorizontal: 8, // consistent edge padding
	},
	ownBubble: {
		backgroundColor: "#d1f5d3",
		alignSelf: "flex-end",
	},
	otherBubble: {
		backgroundColor: "#f4f4f8",
		alignSelf: "flex-start",
	},
	encryptedBubble: {
		borderWidth: 1,
	},
	messageText: {
		fontSize: 16,
		color: "#222",
		lineHeight: 22,
	},
	messageFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginTop: 4,
	},
	messageTime: {
		fontSize: 12,
		color: "#888",
		marginLeft: 6,
	},
	statusIcon: {
		marginLeft: 2,
	},
});
