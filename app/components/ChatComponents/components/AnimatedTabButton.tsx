import { TabButtonProps } from "@/app/components/ChatComponents/types";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import React, { useCallback, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

const AnimatedTabButton: React.FC<TabButtonProps> = ({ 
	activeTab, 
	onPress, 
	theme 
}) => {
	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePress = useCallback(() => {
		Animated.sequence([
			Animated.timing(scaleAnim, {
				toValue: 0.9,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start();
		onPress();
	}, [scaleAnim, onPress]);

	return (
		<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
			<TouchableOpacity
				style={[
					styles.headerButton,
					{
						backgroundColor: theme.card,
						borderWidth: 0.5,
						borderColor: theme.border,
					},
				]}
				onPress={handlePress}
				activeOpacity={0.8}
			>
				<FontAwesome name="exchange" size={24} color={theme.icon} />
			</TouchableOpacity>
			{activeTab === "messages" && (
				<View style={styles.tabIndicator}>
					<FontAwesome5 name="piggy-bank" size={12} color={theme.icon} />
				</View>
			)}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	headerButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		elevation: 2,
	},
	tabIndicator: {
		position: "absolute",
		bottom: 0,
		alignSelf: "center",
	},
});

export default AnimatedTabButton; 