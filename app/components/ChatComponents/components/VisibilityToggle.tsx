import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "@/context/ThemeContext";

interface VisibilityToggleProps {
	visibility: "private" | "public";
	onChange: (visibility: "private" | "public") => void;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
	visibility,
	onChange,
}) => {
	const theme = useAppTheme();

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[
					styles.option,
					{
						backgroundColor: visibility === "private" ? theme.tint : theme.card,
						borderColor: visibility === "private" ? theme.tint : theme.border,
					},
				]}
				onPress={() => onChange("private")}
				activeOpacity={0.8}
			>
				<View style={styles.optionContent}>
					<FontAwesome5 
						name="lock" 
						size={16} 
						color={visibility === "private" ? "white" : theme.textSecondary} 
					/>
					<Text style={[
						styles.optionTitle,
						{ color: visibility === "private" ? "white" : theme.text }
					]}>
						Private
					</Text>
					<Text style={[
						styles.optionDescription,
						{ color: visibility === "private" ? "rgba(255,255,255,0.8)" : theme.textSecondary }
					]}>
						Invite only
					</Text>
				</View>
				{visibility === "private" && (
					<View style={styles.checkmark}>
						<Ionicons name="checkmark-circle" size={16} color="white" />
					</View>
				)}
			</TouchableOpacity>

			<TouchableOpacity
				style={[
					styles.option,
					{
						backgroundColor: visibility === "public" ? theme.tint : theme.card,
						borderColor: visibility === "public" ? theme.tint : theme.border,
					},
				]}
				onPress={() => onChange("public")}
				activeOpacity={0.8}
			>
				<View style={styles.optionContent}>
					<FontAwesome5 
						name="globe" 
						size={16} 
						color={visibility === "public" ? "white" : theme.textSecondary} 
					/>
					<Text style={[
						styles.optionTitle,
						{ color: visibility === "public" ? "white" : theme.text }
					]}>
						Public
					</Text>
					<Text style={[
						styles.optionDescription,
						{ color: visibility === "public" ? "rgba(255,255,255,0.8)" : theme.textSecondary }
					]}>
						Discoverable
					</Text>
				</View>
				{visibility === "public" && (
					<View style={styles.checkmark}>
						<Ionicons name="checkmark-circle" size={16} color="white" />
					</View>
				)}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		gap: 8,
	},
	option: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 10,
		padding: 12,
		position: "relative",
		alignItems: "center",
		justifyContent: "center",
		minHeight: 60,
	},
	optionContent: {
		alignItems: "center",
		gap: 4,
	},
	optionTitle: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 1,
	},
	optionDescription: {
		fontSize: 11,
		fontWeight: "400",
		textAlign: "center",
	},
	checkmark: {
		position: "absolute",
		top: 6,
		right: 6,
	},
});

export default VisibilityToggle; 