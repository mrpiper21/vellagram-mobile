import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { RecipientInfo } from "@/types/conversation";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
	Dimensions,
	Image,
	Modal,
	Platform,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import RecipientInfoSheet, {
	RecipientInfoSheetRef,
} from "./RecipientInfoSheet";

interface HeaderProps {
	groupName: string;
	groupAvatar: string;
	profileUrl?: string;
	onMenuPress: () => void;
	recipientInfo?: RecipientInfo;
}

export const Header: React.FC<HeaderProps> = ({
	groupName,
	groupAvatar,
	onMenuPress,
	profileUrl,
	recipientInfo,
}) => {
	const { theme } = useTheme();
	const colorScheme = theme.isDark ? "dark" : "light";
	const appColors = Colors[colorScheme];
	const [showImagePreview, setShowImagePreview] = useState(false);
	const recipientInfoSheetRef = useRef<RecipientInfoSheetRef>(null);

	const handleMenuPress = () => {
		console.log("🔍 Menu button pressed!");
		onMenuPress();
	};

	const handleImagePress = () => {
		if (profileUrl) {
			setShowImagePreview(true);
		}
	};

	const closeImagePreview = () => {
		setShowImagePreview(false);
	};

	const handleNamePress = () => {
		if (recipientInfo) {
			recipientInfoSheetRef.current?.present();
		}
	};

	return (
		<>
			<StatusBar
				backgroundColor={appColors.card}
				barStyle={theme.isDark ? "light-content" : "dark-content"}
			/>
			<View style={[styles.header, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
				<View style={styles.leftSection}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={styles.backButton}
					>
						<Ionicons name="arrow-back" size={24} color={appColors.text} />
					</TouchableOpacity>
					<View style={styles.avatarNameContainer}>
						{profileUrl ? (
							<TouchableOpacity onPress={handleImagePress}>
								<Image
									style={{ height: 40, width: 40, borderRadius: 20 }}
									src={profileUrl}
								/>
							</TouchableOpacity>
						) : (
							<View style={styles.avatar}>
								<TouchableOpacity>
									<Text style={styles.avatarText}>{groupAvatar}</Text>
								</TouchableOpacity>
							</View>
						)}
						<TouchableOpacity activeOpacity={0.7} onPress={handleNamePress}>
							<Text
								style={[styles.groupName, { color: appColors.text }]}
								numberOfLines={1}
							>
								{groupName}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
				<TouchableOpacity
					onPress={handleMenuPress}
					style={styles.menuButton}
					activeOpacity={0.7}
				>
					<Ionicons name="reorder-three" size={24} color={appColors.text} />
				</TouchableOpacity>
			</View>

			{/* Image Preview Modal */}
			<Modal
				visible={showImagePreview}
				transparent={true}
				animationType="fade"
				onRequestClose={closeImagePreview}
			>
				<View style={styles.modalOverlay}>
					<TouchableOpacity
						style={styles.modalBackground}
						onPress={closeImagePreview}
						activeOpacity={1}
					>
						<TouchableOpacity
							style={styles.imageContainer}
							onPress={() => { }}
							activeOpacity={1}
						>
							<Image
								source={{ uri: profileUrl }}
								style={styles.previewImage}
								resizeMode="contain"
							/>
						</TouchableOpacity>
					</TouchableOpacity>
				</View>
			</Modal>

			{/* Recipient Info Sheet */}
			{recipientInfo && (
				<RecipientInfoSheet
					ref={recipientInfoSheetRef}
					recipientInfo={recipientInfo}
				/>
			)}
		</>
	);
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderBottomWidth: 0.5,
		paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 50,
		justifyContent: "space-between",
	},
	leftSection: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	avatarNameContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		// flex: 1,
	},
	backButton: {
		marginRight: 8,
		padding: 4,
	},
	menuButton: {
		padding: 8,
		borderRadius: 4,
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#25D366",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
	},
	avatarText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 18,
	},
	groupName: {
		fontSize: 18,
		fontWeight: "600",
		flex: 1,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.9)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalBackground: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	imageContainer: {
		width: screenWidth * 0.9,
		height: screenHeight * 0.7,
		justifyContent: "center",
		alignItems: "center",
	},
	previewImage: {
		width: "100%",
		height: "100%",
		borderRadius: 8,
	},
}); 