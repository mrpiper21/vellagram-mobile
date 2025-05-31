import { API_ENDPOINTS } from "@/config/api";
import { useTheme } from "@/hooks/useTheme";
import { useUserStore } from "@/store/useUserStore";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { OtpInput } from "react-native-otp-entry";

const OtpAuthScreen = () => {
    const { theme } = useTheme();
    const { email } = useLocalSearchParams<{ email: string }>();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const setUser = useUserStore((state) => state.setUser);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleOtpVerify = useCallback(async (otpCode: string) => {
        if (!otpCode || otpCode.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post(API_ENDPOINTS.OTP.VERIFY, {
                email,
                otp: otpCode
            });

            if (response.data.success) {
                setUser({
                    email,
                    firstName: response.data.user?.firstName || "",
                    lastName: response.data.user?.lastName || "",
                    phone: response.data.user?.phone || "",
                    profilePicture: response.data.user?.profilePicture || null,
                    walletAddress: response.data.user?.walletAddress || null,
                    groups: response.data.user?.groups || []
                });

                router.replace("/(tabs)");
            } else {
                setError(response.data.message || "Invalid verification code");
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = error.response.data.message || error.response.statusText;
                } else if (error.request) {
                    errorMessage = "Network error - please check your connection";
                }
            }

            setError(errorMessage);
            console.error("OTP Verification Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [email, setUser]);

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post(API_ENDPOINTS.OTP.GENERATE, {
                email,
                type: "numeric",
                organization: "Vellagram",
                subject: "OTP Verification"
            });

            if (response.data.success) {
                Alert.alert("Success", "A new verification code has been sent to your email");
            } else {
                setError(response.data.message || "Failed to resend verification code");
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = error.response.data.message || error.response.statusText;
                } else if (error.request) {
                    errorMessage = "Network error - please check your connection";
                }
            }

            setError(errorMessage);
            console.error("OTP Resend Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={[styles.content, {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }]}>
                        <Text style={[styles.title, { color: theme.text }]}>Enter Verification Code</Text>
                        <Text style={[styles.subtitle, { color: theme.icon }]}>
                            We've sent a 6-digit code to {email}
                        </Text>

                        <View style={styles.otpWrapper}>
                            <OtpInput
                                numberOfDigits={6}
                                focusColor={theme.success}
                                autoFocus={true}
                                hideStick={true}
                                placeholder="******"
                                blurOnFilled={true}
                                disabled={isLoading}
                                type="numeric"
                                secureTextEntry={false}
                                focusStickBlinkingDuration={500}
                                onTextChange={(text) => {
                                    setOtp(text);
                                    setError("");
                                }}
                                onFilled={handleOtpVerify}
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
                                    pinCodeContainerStyle: {
                                        ...styles.pinCodeContainer,
                                        backgroundColor: theme.card,
                                        borderColor: error ? theme.accent : theme.border
                                    },
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

                            {error ? (
                                <Text style={[styles.errorText, { color: theme.accent }]}>{error}</Text>
                            ) : null}
                        </View>

                        <Text style={[styles.disclaimer, { color: theme.icon }]}>
                            Didn't receive the code? You can request a new one.
                        </Text>
                    </Animated.View>
                </ScrollView>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={theme.tint} />
                    ) : (
                        <TouchableOpacity
                            style={[styles.resendButton, { backgroundColor: theme.tint }]}
                            onPress={handleResendOtp}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.resendButtonText}>Resend Code</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 24,
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 24,
    },
    otpWrapper: {
        marginBottom: 24,
    },
    otpContainer: {
        marginVertical: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    pinCodeContainer: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 10,
        marginHorizontal: 6,
        width: 45,
        height: 55,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    focusStick: {
        height: 2,
        marginTop: 4,
    },
    errorText: {
        fontSize: 14,
        marginTop: 12,
        textAlign: "center",
    },
    disclaimer: {
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
        paddingHorizontal: 20,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    resendButton: {
        borderRadius: 14,
        padding: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    resendButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default OtpAuthScreen;
