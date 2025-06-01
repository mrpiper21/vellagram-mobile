import { useTheme } from "@/hooks/useTheme";
import { useUserStore } from "@/store/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
	Alert,
	SafeAreaView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	Vibration,
	View,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming
} from "react-native-reanimated";

interface NumberButtonProps {
	number: number;
	letters?: string;
	onPress: (number: string) => void;
	disabled?: boolean;
}

const NumberButton: React.FC<NumberButtonProps> = ({
	number,
	letters,
	onPress,
	disabled = false,
}) => {
	const { theme } = useTheme();

	return (
		<TouchableOpacity
			style={[
				styles.numberButton,
				{ backgroundColor: theme.card, borderColor: theme.border },
				disabled && styles.disabledButton
			]}
			onPress={() => onPress(number.toString())}
			disabled={disabled}
			activeOpacity={0.7}
		>
			<Text style={[styles.numberText, { color: theme.text }]}>{number}</Text>
			{letters && <Text style={[styles.lettersText, { color: theme.icon }]}>{letters}</Text>}
		</TouchableOpacity>
	);
};

interface PasscodeDotProps {
	filled: boolean;
}

const PasscodeDot: React.FC<PasscodeDotProps> = ({ filled }) => {
	const { theme } = useTheme();

	return (
		<View
			style={[
				styles.passcodeDot,
				filled
					? [styles.passcodeDotFilled, { backgroundColor: theme.tint }]
					: [styles.passcodeDotEmpty, { borderColor: theme.border }],
			]}
		/>
	);
};

export default function PasscodeScreen() {
	const { theme } = useTheme();
	const { isAuthenticated } = useUserStore();
	const [passcode, setPasscode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// Handle authentication state
	// useEffect(() => {
	// 	if (isAuthenticated === false) {
	// 		router.replace("/auth/EmailAuthScreen");
	// 	}
	// }, [isAuthenticated]);

	const handleNumberPress = (number: string): void => {
		if (passcode.length < 6) {
			const newPasscode = passcode + number;
			setPasscode(newPasscode);
			setError("");

			// Auto-submit when passcode is complete
			if (newPasscode.length === 6) {
				handleSubmit(newPasscode);
			}
		}
	};

	const handleDelete = (): void => {
		if (passcode.length > 0) {
			setPasscode(prev => prev.slice(0, -1));
			setError("");
		}
	};

	const OFFSET = 20;
	const TIME = 80;
	const offset = useSharedValue(0);

	const handleSubmit = useCallback(async (submittedPasscode: string) => {
		setIsLoading(true);
		setError("");

		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500));

			// Replace with actual authentication logic
			if (submittedPasscode === "123456") {
				router.replace("/(tabs)");
			} else {
				// Shake animation for wrong passcode
				offset.value = withSequence(
					withTiming(-OFFSET, { duration: TIME / 2 }),
					withRepeat(withTiming(OFFSET, { duration: TIME }), 4, true),
					withTiming(0, { duration: TIME / 2 })
				);
				Vibration.vibrate([0, 500, 200, 500]);
				setError("Incorrect passcode. Try again.");
			}
		} catch (err) {
			setError("Authentication failed. Please try again.");
		} finally {
			setIsLoading(false);
			setPasscode("");
		}
	}, [offset]);

	const handleBiometricAuth = async () => {
		try {
			const { success } = await LocalAuthentication.authenticateAsync({
				promptMessage: "Authenticate to access your account"
			});

			if (success) {
				router.replace("/(tabs)");
			}
		} catch (error) {
			setError("Biometric authentication failed");
		}
	};

	const handleForgotPasscode = () => {
		Alert.alert(
			"Forgot Passcode?",
			"Please contact support to reset your passcode",
			[{ text: "OK" }]
		);
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: offset.value }]
	}));

	if (isAuthenticated === false) {
		return (
			<View style={{ flex: 1, backgroundColor: theme.background }} />
		);
	}

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
			<StatusBar
				barStyle={theme.isDark ? "light-content" : "dark-content"}
				backgroundColor={theme.background}
			/>

			<View style={styles.header}>
				<View style={[styles.iconContainer, { backgroundColor: theme.tint }]}>
					<Ionicons name="shield-checkmark" size={40} color="white" />
				</View>
				<Text style={[styles.title, { color: theme.text }]}>
					Enter Passcode
				</Text>
				<Text style={[styles.subtitle, { color: theme.icon }]}>
					Secure your account with your 6-digit passcode
				</Text>
			</View>

			<Animated.View style={[styles.passcodeSection, animatedStyle]}>
				<View style={styles.passcodeContainer}>
					{Array.from({ length: 6 }).map((_, index) => (
						<PasscodeDot key={index} filled={index < passcode.length} />
					))}
				</View>
			</Animated.View>

			{error ? (
				<View style={[styles.errorContainer, { backgroundColor: theme.card }]}>
					<Text style={[styles.errorText, { color: theme.accent }]}>{error}</Text>
				</View>
			) : null}

			<View style={styles.numberPad}>
				<View style={styles.numberRow}>
					<NumberButton
						number={1}
						letters=""
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
					<NumberButton
						number={2}
						letters="ABC"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
					<NumberButton
						number={3}
						letters="DEF"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
				</View>

				<View style={styles.numberRow}>
					<NumberButton
						number={4}
						letters="GHI"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
					<NumberButton
						number={5}
						letters="JKL"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
					<NumberButton
						number={6}
						letters="MNO"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
				</View>

				<View style={styles.numberRow}>
					<NumberButton
						number={7}
						letters="PQRS"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
					<NumberButton
						number={8}
						letters="TUV"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
					<NumberButton
						number={9}
						letters="WXYZ"
						onPress={handleNumberPress}
						disabled={isLoading}
					/>
				</View>

				<View style={styles.numberRow}>
					<TouchableOpacity
						style={styles.biometricButton}
						onPress={handleBiometricAuth}
						disabled={isLoading}
						activeOpacity={0.7}
					>
						<Ionicons name="finger-print" size={36} color={theme.tint} />
					</TouchableOpacity>

					<NumberButton
						number={0}
						onPress={handleNumberPress}
						disabled={isLoading}
					/>

					<TouchableOpacity
						style={[
							styles.actionButton,
							(passcode.length === 0 || isLoading) && styles.disabledButton,
						]}
						onPress={handleDelete}
						disabled={passcode.length === 0 || isLoading}
						activeOpacity={0.7}
					>
						<Ionicons name="backspace" size={24} color={theme.icon} />
					</TouchableOpacity>
				</View>
			</View>

			<TouchableOpacity
				style={styles.forgotButton}
				onPress={handleForgotPasscode}
				activeOpacity={0.7}
			>
				<Text style={[styles.forgotText, { color: theme.icon }]}>
					Forgot your passcode?
				</Text>
			</TouchableOpacity>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
	},
	header: {
		alignItems: "center",
		marginTop: 20,
		marginBottom: 40,
	},
	iconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		maxWidth: 280,
		lineHeight: 22,
	},
	passcodeSection: {
		alignItems: "center",
		marginBottom: 32,
	},
	passcodeContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: 200,
	},
	passcodeDot: {
		width: 16,
		height: 16,
		borderRadius: 8,
		borderWidth: 2,
	},
	passcodeDotEmpty: {
		backgroundColor: "transparent",
	},
	passcodeDotFilled: {
		borderColor: "transparent",
	},
	errorContainer: {
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginBottom: 24,
		alignSelf: "stretch",
		alignItems: "center",
	},
	errorText: {
		fontSize: 14,
		textAlign: "center",
	},
	numberPad: {
		alignItems: "center",
		marginBottom: 32,
	},
	numberRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: 280,
		marginBottom: 20,
		alignItems: "center",
	},
	numberButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	numberText: {
		fontSize: 24,
		fontWeight: "600",
	},
	lettersText: {
		fontSize: 12,
		marginTop: 2,
	},
	actionButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	biometricButton: {
		width: 80,
		height: 80,
		alignItems: "center",
		justifyContent: "center",
	},
	disabledButton: {
		opacity: 0.5,
	},
	forgotButton: {
		alignItems: "center",
		paddingVertical: 8,
	},
	forgotText: {
		fontSize: 14,
	},
});