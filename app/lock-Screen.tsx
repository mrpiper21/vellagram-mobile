import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { JSX, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

interface ColorTheme {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
    accent: string;
    success: string;
    secondary: string;
    card: string;
    border: string;
}

interface Colors {
    light: ColorTheme;
}

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
}) => (
    <TouchableOpacity
        style={[styles.numberButton, disabled && styles.disabledButton]}
        onPress={() => onPress(number.toString())}
        disabled={disabled}
        activeOpacity={0.7}
    >
        <Text style={styles.numberText}>{number}</Text>
        {letters && <Text style={styles.lettersText}>{letters}</Text>}
    </TouchableOpacity>
);

interface PasscodeDotProps {
    filled: boolean;
    showValue: boolean;
    value?: string;
}

const PasscodeDot: React.FC<PasscodeDotProps> = ({
    filled,
    showValue,
    value,
}) => (
    <View
        style={[
            styles.passcodeDot,
            filled
                ? showValue
                    ? styles.passcodeDotFilledVisible
                    : styles.passcodeDotFilled
                : styles.passcodeDotEmpty,
        ]}
    >
        {showValue && filled && value && (
            <Text style={styles.passcodeValue}>{value}</Text>
        )}
    </View>
);

export default function PasscodeScreen(): JSX.Element {
    const [passcode, setPasscode] = useState<string>("");
    const [showPasscode, setShowPasscode] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleNumberPress = (number: string): void => {
        if (passcode.length < 6) {
            setPasscode((prev) => prev + number);
            setError("");
            Vibration.vibrate(50); // Haptic feedback
        }
    };

    const handleDelete = (): void => {
        setPasscode((prev) => prev.slice(0, -1));
        setError("");
        Vibration.vibrate(50);
    };

    const handleSubmit = async (): Promise<void> => {
        if (passcode.length === 6) {
            setIsLoading(true);

            // Simulate authentication
            setTimeout(() => {
                if (passcode === "123456") {
                    setError("");
                    Alert.alert("Success", "Access granted!");
                } else {
                    setError("Incorrect passcode. Try again.");
                    Vibration.vibrate([0, 500, 200, 500]); // Error vibration pattern
                }
                setIsLoading(false);
                setPasscode("");
            }, 1500);
        }
    };

    const handleBiometricAuth = (): void => {
        Alert.alert(
            "Biometric Authentication",
            "This feature would integrate with device biometrics (Face ID, Touch ID)",
            [{ text: "OK" }]
        );
    };

    const handleForgotPasscode = (): void => {
        Alert.alert(
            "Forgot Passcode",
            "Contact support or use account recovery options",
            [{ text: "OK" }]
        );
    };

    const renderPasscodeDots = (): JSX.Element => (
        <View style={styles.passcodeContainer}>
            {[...Array(6)].map((_, index) => (
                <PasscodeDot
                    key={index}
                    filled={index < passcode.length}
                    showValue={showPasscode}
                    value={passcode[index]}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: Colors.light.background }]}
        >
            <StatusBar
                barStyle="dark-content"
                backgroundColor={Colors.light.background}
            />

            {/* Header */}
            <View style={styles.header}>
                <View
                    style={[styles.iconContainer, { backgroundColor: Colors.light.tint }]}
                >
                    <Ionicons name="shield-checkmark" size={40} color="white" />
                </View>
                <Text style={[styles.title, { color: Colors.light.text }]}>
                    Enter Passcode
                </Text>
                <Text style={styles.subtitle}>
                    Secure your susu savings with your 6-digit passcode
                </Text>
            </View>

            {/* Passcode Dots */}
            <View style={styles.passcodeSection}>{renderPasscodeDots()}</View>

            {/* Error Message */}
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {/* Number Pad */}
            <View style={styles.numberPad}>
                <View style={styles.numberRow}>
                    <NumberButton
                        number={1}
                        letters="ABC"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                    <NumberButton
                        number={2}
                        letters="DEF"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                    <NumberButton
                        number={3}
                        letters="GHI"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.numberRow}>
                    <NumberButton
                        number={4}
                        letters="JKL"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                    <NumberButton
                        number={5}
                        letters="MNO"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                    <NumberButton
                        number={6}
                        letters="PQR"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.numberRow}>
                    <NumberButton
                        number={7}
                        letters="STU"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                    <NumberButton
                        number={8}
                        letters="VWX"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                    <NumberButton
                        number={9}
                        letters="YZ"
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />
                </View>

                <View style={styles.numberRow}>
                    {/* Show/Hide Toggle */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowPasscode(!showPasscode)}
                        disabled={isLoading}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={showPasscode ? "eye-off" : "eye"}
                            size={24}
                            color={Colors.light.icon}
                        />
                    </TouchableOpacity>

                    <NumberButton
                        number={0}
                        onPress={handleNumberPress}
                        disabled={isLoading}
                    />

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            (!passcode.length || isLoading) && styles.disabledButton,
                        ]}
                        onPress={handleDelete}
                        disabled={!passcode.length || isLoading}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="backspace" size={24} color={Colors.light.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    {
                        backgroundColor:
                            passcode.length === 6 && !isLoading
                                ? Colors.light.tint
                                : "#D1D5DB",
                    },
                    (passcode.length !== 6 || isLoading) && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={passcode.length !== 6 || isLoading}
                activeOpacity={0.8}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.submitButtonText}>Verifying...</Text>
                    </View>
                ) : (
                    <Text style={styles.submitButtonText}>Unlock</Text>
                )}
            </TouchableOpacity>

            {/* Biometric Option */}
            <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
                activeOpacity={0.7}
            >
                <Ionicons name="finger-print" size={20} color={Colors.light.tint} />
                <Text style={[styles.biometricText, { color: Colors.light.tint }]}>
                    Use Biometric Authentication
                </Text>
            </TouchableOpacity>

            {/* Forgot Passcode */}
            <TouchableOpacity
                style={styles.forgotButton}
                onPress={handleForgotPasscode}
                activeOpacity={0.7}
            >
                <Text style={styles.forgotText}>Forgot your passcode?</Text>
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B7280",
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
        alignItems: "center",
        justifyContent: "center",
    },
    passcodeDotEmpty: {
        backgroundColor: "transparent",
        borderColor: "#D1D5DB",
    },
    passcodeDotFilled: {
        backgroundColor: "#0891B2",
        borderColor: "#0891B2",
    },
    passcodeDotFilledVisible: {
        backgroundColor: "transparent",
        borderColor: "#0891B2",
    },
    passcodeValue: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0891B2",
    },
    errorContainer: {
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 24,
        alignSelf: "stretch",
    },
    errorText: {
        color: "#DC2626",
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
    },
    numberButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    numberText: {
        fontSize: 24,
        fontWeight: "600",
        color: "#374151",
    },
    lettersText: {
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 2,
    },
    actionButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    disabledButton: {
        opacity: 0.5,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 32,
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    biometricButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 16,
    },
    biometricText: {
        fontSize: 16,
        marginLeft: 8,
    },
    forgotButton: {
        alignItems: "center",
        paddingVertical: 8,
    },
    forgotText: {
        fontSize: 14,
        color: "#9CA3AF",
    },
});
