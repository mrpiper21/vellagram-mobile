import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ContributionModalProps {
    visible: boolean;
    onClose: () => void;
    onPay: (amount: number) => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
    visible,
    onClose,
    onPay
}) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];
    const [amount, setAmount] = useState("200");
    const slideAnim = useRef(new Animated.Value(300)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 300,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handlePay = () => {
        Keyboard.dismiss();
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
            onPay(numericAmount);
        }
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardAvoid}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                backgroundColor: appColors.card,
                                transform: [{ translateY: slideAnim }],
                                opacity: opacityAnim,
                            },
                        ]}
                    >
                        <View style={styles.header}>
                            <View style={styles.handle} />
                            <Text style={[styles.title, { color: appColors.text }]}>
                                Make Contribution
                            </Text>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.amountContainer}>
                                <Text style={[styles.currency, { color: appColors.text }]}>GHS</Text>
                                <TextInput
                                    style={[
                                        styles.amountInput,
                                        {
                                            color: appColors.text,
                                            backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                                        }
                                    ]}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor={appColors.icon}
                                    autoFocus
                                    selectTextOnFocus
                                />
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={[styles.infoText, { color: appColors.text }]}>
                                    Enter the amount you want to contribute
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.payButton,
                                    {
                                        backgroundColor: appColors.tint,
                                        opacity: parseFloat(amount) > 0 ? 1 : 0.5
                                    }
                                ]}
                                onPress={handlePay}
                                activeOpacity={0.8}
                                disabled={parseFloat(amount) <= 0}
                            >
                                <Ionicons name="wallet-outline" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.payButtonText}>Pay Now</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardAvoid: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 300,
        maxHeight: '80%',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        borderRadius: 2,
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        padding: 24,
        gap: 24,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    currency: {
        fontSize: 24,
        fontWeight: '600',
    },
    amountInput: {
        fontSize: 32,
        fontWeight: '600',
        textAlign: 'center',
        minWidth: 120,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    infoContainer: {
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        opacity: 0.7,
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonIcon: {
        marginRight: 8,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 