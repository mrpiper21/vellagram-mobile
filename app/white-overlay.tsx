import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, View } from "react-native";

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
			<Text
				style={{ color: Colors.light.text, fontSize: 24, fontWeight: "600" }}
			>
				Vedify
			</Text>
		</View>
	);
};

export default WhiteOverlay;
