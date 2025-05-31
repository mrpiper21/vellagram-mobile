import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";

const LoginScreen = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? "light"];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Enter Verification Code</Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>
                We've sent a 6-digit code to your phone number
            </Text>

            <OtpInput
                numberOfDigits={6}
                focusColor={theme.success}
                autoFocus={false}
                hideStick={true}
                placeholder="******"
                blurOnFilled={true}
                disabled={false}
                type="numeric"
                secureTextEntry={false}
                focusStickBlinkingDuration={500}
                onFocus={() => console.log("Focused")}
                onBlur={() => console.log("Blurred")}
                onTextChange={(text) => console.log(text)}
                onFilled={(text) => console.log(`OTP is ${text}`)}
                textInputProps={{
                    accessibilityLabel: "One-Time Password",
                }}
                textProps={{
                    accessibilityRole: "text",
                    accessibilityLabel: "OTP digit",
                    allowFontScaling: false,
                }}
                theme={{
                    containerStyle: styles.otpContainer,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    // pinCodeTextStyle: [styles.pinCodeText, { color: theme.text }],
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: {
                        borderColor: theme.tint,
                    },
                    placeholderTextStyle: { color: theme.border },
                    filledPinCodeContainerStyle: {
                        backgroundColor: theme.highlight,
                        borderColor: theme.success,
                    },
                    disabledPinCodeContainerStyle: {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                    },
                }}
            />

            <TouchableOpacity style={styles.resendContainer} onPress={() => console.log("Resend OTP")}>
                <Text style={[styles.resendText, { color: theme.accent }]}>Resend Code</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
    },
    otpContainer: {
        marginVertical: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    pinCodeContainer: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginHorizontal: 6,
        width: 45,
        height: 55,
        alignItems: "center",
        justifyContent: "center",
    },
    activePinCodeContainer: {
        borderColor: "#06B6D4",
    },
    pinCodeText: {
        fontSize: 20,
        fontWeight: "600",
    },
    focusStick: {
        height: 2,
        backgroundColor: "#06B6D4",
        marginTop: 4,
    },
    resendContainer: {
        marginTop: 20,
    },
    resendText: {
        fontSize: 16,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
