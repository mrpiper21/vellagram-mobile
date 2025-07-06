import { AntDesign, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import { useAppTheme } from "@/context/ThemeContext";
import { Contact } from "../types/savings-group";

interface SelectedMembersDisplayProps {
	members: Contact[];
	onRemoveMember: (memberId: string) => void;
}

const SelectedMembersDisplay: React.FC<SelectedMembersDisplayProps> = ({
	members,
	onRemoveMember,
}) => {
	const theme = useAppTheme();

	if (members.length === 0) return null;

	return (
		<View style={styles.container}>
			<Text style={[styles.title, { color: theme.text }]}>
				Selected Members ({members.length})
			</Text>
			<View style={styles.membersContainer}>
				{members.map((member) => (
					<View key={member.id} style={styles.memberAvatar}>
						<View style={styles.avatarWrapper}>
							{member.profile ? (
								<Image source={{ uri: member.profile }} style={styles.avatarImage} />
							) : (
								<View style={[styles.avatarPlaceholder, { backgroundColor: theme.tint }]}>
									<AntDesign name="user" size={16} color={theme.background} />
								</View>
							)}
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => onRemoveMember(member.id)}
							>
								<Ionicons name="close-circle" size={16} color={theme.textSecondary} />
							</TouchableOpacity>
						</View>
						<Text style={[styles.memberName, { color: theme.textSecondary }]} numberOfLines={1}>
							{member.name}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 24,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	membersContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginTop: 8,
	},
	memberAvatar: {
		alignItems: "center",
		width: 60,
	},
	avatarWrapper: {
		position: "relative",
		alignItems: "center",
	},
	avatarImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginBottom: 4,
	},
	avatarPlaceholder: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 4,
	},
	removeButton: {
		position: "absolute",
		top: -4,
		right: -4,
		backgroundColor: "white",
		borderRadius: 10,
		padding: 2,
	},
	memberName: {
		fontSize: 12,
		fontWeight: "400",
		textAlign: "center",
	},
});

export default SelectedMembersDisplay; 