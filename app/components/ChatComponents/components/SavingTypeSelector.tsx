import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAppTheme } from "@/context/ThemeContext";
import { SavingType } from "../types/savings-group";

interface SavingTypeSelectorProps {
	savingTypes: SavingType[];
	selectedType: string;
	onSelect: (typeId: string) => void;
}

const SavingTypeSelector: React.FC<SavingTypeSelectorProps> = ({
	savingTypes,
	selectedType,
	onSelect,
}) => {
	const theme = useAppTheme();

	return (
		<ScrollView 
			horizontal 
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.scrollContainer}
		>
			{savingTypes.map((type) => (
				<TouchableOpacity
					key={type.id}
					style={[
						styles.card,
						{
							backgroundColor: selectedType === type.id ? theme.tint : theme.card,
							borderColor: selectedType === type.id ? theme.tint : theme.border,
						},
					]}
					onPress={() => onSelect(type.id)}
				>
					<View style={styles.cardContent}>
						<Text style={[
							styles.cardName,
							{ color: selectedType === type.id ? "white" : theme.text }
						]}>
							{type.name}
						</Text>
						<Text style={[
							styles.cardDescription,
							{ color: selectedType === type.id ? "rgba(255,255,255,0.8)" : theme.textSecondary }
						]} numberOfLines={2}>
							{type.description}
						</Text>
					</View>
					{selectedType === type.id && (
						<View style={styles.checkmark}>
							<Ionicons name="checkmark-circle" size={16} color="white" />
						</View>
					)}
				</TouchableOpacity>
			))}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	scrollContainer: {
		paddingHorizontal: 20,
		gap: 12,
	},
	card: {
		width: 160,
		borderWidth: 1,
		borderRadius: 12,
		padding: 12,
		position: "relative",
	},
	cardContent: {
		flex: 1,
	},
	cardName: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 4,
	},
	cardDescription: {
		fontSize: 12,
		fontWeight: "400",
		lineHeight: 16,
	},
	checkmark: {
		position: "absolute",
		top: 8,
		right: 8,
	},
});

export default SavingTypeSelector; 