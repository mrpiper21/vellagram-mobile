import VellagramLogo from "@/assets/images/Logo101";
import React from "react";
import { View } from "react-native";

const WhiteOverlay = () => {
	return (
		<View
			style={{
				flex: 1,
				backgroundColor: "white",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<VellagramLogo />
		</View>
	);
};

export default WhiteOverlay;
