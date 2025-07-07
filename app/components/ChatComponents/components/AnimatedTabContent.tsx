import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

import { TabContentProps } from "../types";

const { width: screenWidth } = Dimensions.get("window");

const AnimatedTabContent: React.FC<TabContentProps> = ({ 
	children, 
	isActive, 
	index 
}) => {
	const translateX = useRef(
		new Animated.Value(isActive ? 0 : screenWidth)
	).current;
	const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(translateX, {
				toValue: isActive ? 0 : screenWidth,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(opacity, {
				toValue: isActive ? 1 : 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();
	}, [isActive, translateX, opacity]);

	return (
		<Animated.View
			style={[
				styles.tabContent,
				{
					transform: [{ translateX }],
					opacity,
				},
			]}
		>
			{children}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	tabContent: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
});

export default AnimatedTabContent; 