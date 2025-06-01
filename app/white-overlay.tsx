import VellagramLogo from "@/assets/images/Logo101";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { View } from "react-native";

const WhiteOverlay = () => {
	const { theme } = useTheme();

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: theme.background,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<VellagramLogo />
		</View>
	);
};

export default WhiteOverlay;
