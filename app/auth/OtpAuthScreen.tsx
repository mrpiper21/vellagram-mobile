import { API_ENDPOINTS } from "@/config/api";
import { useTheme } from "@/hooks/useTheme";
import { useUserStore } from "@/store/useUserStore";
import TokenManager from "@/utils/tokenManager";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Keyboard,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import useFormStore from "../store/useFormStore";

const RESEND_TIMER = 60;

const OtpAuthScreen = () => {
    const { theme } = useTheme();
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [resendTimer, setResendTimer] = useState(RESEND_TIMER);
    const [canResend, setCanResend] = useState(false);
    const setUser = useUserStore((state) => state.setUser);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];
    const modalAnim = useState(new Animated.Value(0))[0];
    const { formValues, clearForm } = useFormStore();

    useEffect(() => {
			if (!formValues?.user) {
				router.replace("/auth/EmailAuthScreen");
				return;
			}

			const timer = setInterval(() => {
				setResendTimer((prev) => {
					if (prev <= 1) {
						clearInterval(timer);
						setCanResend(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(timer);
		}, [formValues]);

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

    const showSuccessModalWithAnimation = () => {
        setShowSuccessModal(true);
        Animated.spring(modalAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 65,
            friction: 11
        }).start();
    };

    const handleOtpVerify = useCallback(async (otpCode: string) => {
        if (!otpCode || otpCode.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        if (!formValues?.user?.user) {
            setError("Session expired. Please login again.");
            router.replace("/auth/EmailAuthScreen");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            console.log("🔐 OTP Verification - Using token:", formValues.user.token);
            const response = await axios.post(API_ENDPOINTS.OTP.VERIFY, {
                email: formValues.user.user.email,
                otp: otpCode,
                token: formValues.user.token
            }, {
                headers: {
                    'Authorization': `Bearer ${formValues.user.token}`
                }
            });

            if (response.data.success) {
                // Set user with token included
                setUser({
                    ...formValues.user.user,
                    token: formValues.user.token
                });
                showSuccessModalWithAnimation();
                clearForm();

                setTimeout(() => {
                    TokenManager.setToken(formValues.user.token);
                    console.log("✅ Token set in TokenManager:", formValues.user.token);
                    console.log("✅ User set in store with token");
                    router.replace("/(authenticated)/(tabs)");
                }, 1500);
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
    }, [setUser, formValues, clearForm]);

    const handleResendOtp = async () => {
        if (!canResend || !formValues?.user?.user) return;

        setIsLoading(true);
        setError("");
        setCanResend(false);
        setResendTimer(RESEND_TIMER);

        try {
            const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
                email: formValues.user.user.email,
                password: formValues.user.user.password
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // If no user data, show loading or redirect
    if (!formValues?.user?.user) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

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
                            We've sent a 6-digit code to {formValues.user.user.email}
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
                            Didn't receive the code? {canResend ? "You can request a new one." : `Please wait ${formatTime(resendTimer)}`}
                        </Text>
                    </Animated.View>
                </ScrollView>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={theme.tint} />
                    ) : (
                        <TouchableOpacity
                                style={[
                                    styles.resendButton,
                                    { backgroundColor: canResend ? theme.tint : theme.border }
                                ]}
                            onPress={handleResendOtp}
                                disabled={!canResend || isLoading}
                            activeOpacity={0.8}
                        >
                                <Text style={styles.resendButtonText}>
                                    {canResend ? "Resend Code" : `Resend in ${formatTime(resendTimer)}`}
                                </Text>
                            </TouchableOpacity>
                    )}
                </Animated.View>

                <Modal
                    visible={showSuccessModal}
                    transparent
                    animationType="none"
                    onRequestClose={() => { }}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                {
                                    backgroundColor: theme.card,
                                    transform: [{
                                        scale: modalAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1]
                                        })
                                    }],
                                    opacity: modalAnim
                                }
                            ]}
                        >
                            <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
                                <Ionicons name="checkmark" size={40} color={theme.success} />
                            </View>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Success!</Text>
                            <Text style={[styles.modalText, { color: theme.icon }]}>
                                You have successfully logged in
                            </Text>
                        </Animated.View>
                    </View>
                </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        width: '80%',
        maxWidth: 300,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default OtpAuthScreen;
