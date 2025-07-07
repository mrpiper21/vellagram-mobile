import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "@/context/ThemeContext";
import { SavingsGroupData, SavingType } from "../types/savings-group";

interface GroupCreationConfirmationProps {
	visible: boolean;
	groupData: SavingsGroupData | null;
	onClose: () => void;
	savingTypes: SavingType[];
}

const GroupCreationConfirmation: React.FC<GroupCreationConfirmationProps> = ({
	visible,
	groupData,
	onClose,
	savingTypes,
}) => {
	const theme = useAppTheme();
	
	// Animation values
	const fadeAnim = new Animated.Value(0);
	const scaleAnim = new Animated.Value(0.8);
	const checkmarkScale = new Animated.Value(0);
	const slideAnim = new Animated.Value(50);

	useEffect(() => {
		if (visible && groupData) {
			// Start animations
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.spring(scaleAnim, {
					toValue: 1,
					tension: 100,
					friction: 8,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 400,
					useNativeDriver: true,
				}),
			]).start();

			// Animate checkmark after a delay
			setTimeout(() => {
				Animated.spring(checkmarkScale, {
					toValue: 1,
					tension: 200,
					friction: 5,
					useNativeDriver: true,
				}).start();
			}, 200);
		}
	}, [visible, groupData]);

	const handleClose = () => {
		// Reverse animations
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 0.8,
				duration: 200,
				useNativeDriver: true,
			}),
		]).start(() => {
			onClose();
			// Reset animation values
			fadeAnim.setValue(0);
			scaleAnim.setValue(0.8);
			checkmarkScale.setValue(0);
			slideAnim.setValue(50);
		});
	};

	if (!visible || !groupData) return null;

	return (
		<Animated.View 
			style={[
				styles.overlay,
				{ opacity: fadeAnim }
			]}
		>
			<Animated.View 
				style={[
					styles.content,
					{ 
						backgroundColor: theme.background,
						transform: [
							{ scale: scaleAnim },
							{ translateY: slideAnim }
						]
					}
				]}
			>
				{/* Success Checkmark */}
				<Animated.View 
					style={[
						styles.successCircle,
						{ 
							backgroundColor: theme.tint,
							transform: [{ scale: checkmarkScale }]
						}
					]}
				>
					<Ionicons name="checkmark" size={32} color="white" />
				</Animated.View>

				{/* Success Title */}
				<Text style={[styles.title, { color: theme.text }]}>
					Group Created Successfully!
				</Text>

				{/* Group Details */}
				<View style={styles.detailsContainer}>
					<DetailRow 
						label="Group Name" 
						value={groupData.groupName}
						theme={theme}
					/>
					<DetailRow 
						label="Target Amount" 
						value={`$${groupData.targetAmount}`}
						theme={theme}
					/>
					<DetailRow 
						label="Saving Type" 
						value={savingTypes.find(t => t.id === groupData.savingType)?.name || ''}
						theme={theme}
					/>
					<DetailRow 
						label="Members" 
						value={`${groupData.members.length} selected`}
						theme={theme}
					/>
					<DetailRow 
						label="Visibility" 
						value={groupData.visibility === "private" ? "Private" : "Public"}
						theme={theme}
						isLast
					/>
				</View>

				{/* Action Button */}
				<TouchableOpacity
					style={[styles.button, { backgroundColor: theme.tint }]}
					onPress={handleClose}
				>
					<Text style={styles.buttonText}>
						Done
					</Text>
				</TouchableOpacity>
			</Animated.View>
		</Animated.View>
	);
};

interface DetailRowProps {
	label: string;
	value: string;
	theme: any;
	isLast?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, theme, isLast }) => (
	<View style={[
		styles.detailRow, 
		{ 
			borderBottomColor: theme.border,
			borderBottomWidth: isLast ? 0 : 1
		}
	]}>
		<Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
			{label}
		</Text>
		<Text style={[styles.detailValue, { color: theme.text }]}>
			{value}
		</Text>
	</View>
);

const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.7)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1000,
	},
	content: {
		borderRadius: 20,
		padding: 24,
		alignItems: "center",
		width: "85%",
		maxWidth: 400,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 10,
	},
	successCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		marginBottom: 20,
		textAlign: "center",
	},
	detailsContainer: {
		width: "100%",
		marginBottom: 24,
	},
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
	},
	detailLabel: {
		fontSize: 14,
		fontWeight: "500",
	},
	detailValue: {
		fontSize: 14,
		fontWeight: "600",
	},
	button: {
		width: "100%",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default GroupCreationConfirmation; 