import VellagramLogo from "@/assets/images/Logo101";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import PhoneInput, { ICountry } from 'react-native-international-phone-number';

const PhoneAuthScreen = () => {
    const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(undefined);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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

    const handlePhoneChange = (phoneNumber: string) => {
        setPhoneNumber(phoneNumber);
    };

    const handleCountryChange = (country: ICountry) => {
        setSelectedCountry(country);
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();

        if (!phoneNumber) {
            Alert.alert("Error", "Please enter your phone number");
            return;
        }

        setIsLoading(true);
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

        try {
            const response = await fetch("https://textbelt.com/text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: phoneNumber,
                    message: `Your Vellagram verification code is ${otp}`,
                    key: "bf5ad74c099d89982d50d2e26553ec0f02004f4bulqs8Wd3VCS4fqwbLRHTjJ4g6"
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Save OTP securely (for demo purpose only, don’t use this method in production)
                global.generatedOtp = otp;
                router.push("/auth/OtpAuthScreen");
            } else {
                Alert.alert("Error", data.error || "Failed to send verification code");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
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
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Enter your phone number to continue</Text>

                        <View style={styles.phoneInputContainer}>
                            <PhoneInput
                                value={phoneNumber}
                                onChangePhoneNumber={handlePhoneChange}
                                selectedCountry={selectedCountry}
                                onChangeSelectedCountry={handleCountryChange}
                                defaultCountry="US"
                                placeholder="Phone Number"
                                placeholderTextColor={Colors.light.icon}
                                phoneInputStyles={{
                                    container: styles.phoneInput,
                                    flagContainer: styles.flagContainer,
                                    callingCode: styles.callingCode,
                                    input: styles.input,
                                }}
                                modalStyles={{
                                    countryButton: styles.countryButton,
                                    countryName: styles.countryName,
                                    callingCode: styles.modalCallingCode,
                                    searchInput: styles.searchInput,
                                }}
                                modalSearchInputPlaceholder="Search countries..."
                            />
                        </View>

                        <Text style={styles.disclaimer}>
                            We'll send a verification code to this number. Standard messaging rates may apply.
                        </Text>
                    </Animated.View>
                </ScrollView>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={[styles.submitButton, (!phoneNumber || isLoading) && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={!phoneNumber || isLoading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLoading ? "Sending Verification..." : "Continue"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
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
        color: Colors.light.text,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.icon,
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 24,
    },
    phoneInputContainer: {
        marginBottom: 24,
    },
    phoneInput: {
        backgroundColor: Colors.light.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
        height: 60,
        shadowColor: Colors.light.tint,
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
    },
    flagContainer: {
        backgroundColor: Colors.light.highlight,
        borderRadius: 8,
        marginLeft: 12,
        paddingHorizontal: 8,
    },
    callingCode: {
        color: Colors.light.text,
        fontWeight: '500',
    },
    input: {
        color: Colors.light.text,
        fontSize: 17,
        flex: 1,
        paddingHorizontal: 12,
        fontWeight: '500',
    },
    disclaimer: {
        fontSize: 13,
        color: Colors.light.icon,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    submitButton: {
        backgroundColor: Colors.light.tint,
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: Colors.light.tabIconDefault,
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal styles
    searchInput: {
        backgroundColor: Colors.light.card,
        borderColor: Colors.light.border,
        color: Colors.light.text,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    countryButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.highlight,
    },
    countryName: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: '500',
    },
    modalCallingCode: {
        color: Colors.light.icon,
        fontSize: 14,
    },
});

export default PhoneAuthScreen;