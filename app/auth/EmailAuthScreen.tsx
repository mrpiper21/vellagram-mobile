import VellagramLogo from "@/assets/images/Logo101";
import { API_ENDPOINTS } from "@/config/api";
import { useTheme } from "@/hooks/useTheme";
import axios from 'axios';
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { TextInput } from "react-native-gesture-handler";

const EmailAuthScreen = () => {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
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

    const handleEmailChange = (text: string) => {
        setEmail(text.trim());
        setError(""); // Clear error when user types
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();
        setIsLoading(true);

        if (!email) {
            setError("Please enter your email address");
            setIsLoading(false);
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(API_ENDPOINTS.OTP.GENERATE, {
                email: email,
                type: "numeric",
                organization: "Vellagram",
                subject: "OTP Verification"
            });

            if (response.data.success) {
                router.push({
                    pathname: "/auth/OtpAuthScreen",
                    params: { email }
                });
            } else {
                setError(response.data.message || "Failed to send verification code");
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with a status code outside 2xx
                    errorMessage = error.response.data.message || error.response.statusText;
                } else if (error.request) {
                    // Request was made but no response received
                    errorMessage = "Network error - please check your connection";
                }
            }

            setError(errorMessage);
            console.error("OTP Generation Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect(() => {
    //     router.replace("/(tabs)");

    // }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                        <VellagramLogo showText={false} animated size={120} />
                    </Animated.View>

                    <Animated.View style={[styles.content, {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }]}>
                        <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: theme.icon }]}>Enter your email to continue</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: theme.card,
                                        borderColor: error ? theme.accent : theme.border,
                                        color: theme.text
                                    }
                                ]}
                                placeholder="Email address"
                                placeholderTextColor={theme.icon}
                                value={email}
                                onChangeText={handleEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="emailAddress"
                                editable={!isLoading}
                            />
                            {error ? (
                                <Text style={[styles.errorText, { color: theme.accent }]}>{error}</Text>
                            ) : null}
                        </View>

                        <Text style={[styles.disclaimer, { color: theme.icon }]}>
                            We'll send a verification code to this email address.
                        </Text>
                    </Animated.View>
                </ScrollView>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: theme.tint },
                            (!email || isLoading || error) && styles.disabledButton
                        ]}
                        onPress={handleSubmit}
                        disabled={!email || isLoading || !!error}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLoading ? "Sending Verification..." : "Continue"}
                        </Text>
                    </TouchableOpacity>
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
    logoContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        borderRadius: 14,
        borderWidth: 1,
        height: 60,
        paddingHorizontal: 16,
        fontSize: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    errorText: {
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
    },
    disclaimer: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    submitButton: {
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EmailAuthScreen;