import { IUserRegistrationData } from "@/@types/user-auth-types";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
    formData: IUserRegistrationData;
    updateFormData: (field: string, value: string) => void;
}

interface NumberButtonProps {
    number: number;
    letters?: string;
    onPress: (number: number) => void;
    disabled?: boolean;
}

const NumberButton: React.FC<NumberButtonProps> = ({ number, letters, onPress, disabled }) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[styles.numberButton, { backgroundColor: appColors.card }]}
            onPress={() => onPress(number)}
            disabled={disabled}
        >
            <Text style={[styles.number, { color: appColors.text }]}>{number}</Text>
            {letters && <Text style={[styles.letters, { color: appColors.icon }]}>{letters}</Text>}
        </TouchableOpacity>
    );
};

const PinSetUp: React.FC<Props> = ({ formData, updateFormData }) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];
    const [isConfirming, setIsConfirming] = useState(false);

    const handleNumberPress = (number: number) => {
        const currentField = isConfirming ? 'confirmPin' : 'pin';
        const currentValue = formData[currentField];

        if (currentValue.length < 4) {
            updateFormData(currentField, currentValue + number.toString());
        }
    };

    const handleDelete = () => {
        const currentField = isConfirming ? 'confirmPin' : 'pin';
        const currentValue = formData[currentField];

        if (currentValue.length > 0) {
            updateFormData(currentField, currentValue.slice(0, -1));
        }
    };

    const handleClear = () => {
        const currentField = isConfirming ? 'confirmPin' : 'pin';
        updateFormData(currentField, '');
    };

    const renderPinDots = (pin: string) => {
        return (
            <View style={styles.pinDotsContainer}>
                {[0, 1, 2, 3].map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.pinDot,
                            {
                                backgroundColor: index < pin.length ? appColors.tint : appColors.card,
                                borderColor: appColors.border
                            }
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: appColors.text }]}>Set Up PIN</Text>
                <Text style={[styles.subtitle, { color: appColors.icon }]}>
                    {isConfirming ? 'Confirm your 4-digit PIN' : 'Create a 4-digit PIN'}
                </Text>
            </View>

            <View style={styles.pinContainer}>
                {renderPinDots(isConfirming ? formData.confirmPin : formData.pin)}
                {isConfirming && formData.pin !== formData.confirmPin && formData.confirmPin.length === 4 && (
                    <Text style={[styles.errorText, { color: appColors.accent }]}>
                        PINs do not match
                    </Text>
                )}
            </View>

            <View style={styles.numberPad}>
                <View style={styles.numberRow}>
                    <NumberButton number={1} onPress={handleNumberPress} />
                    <NumberButton number={2} letters="ABC" onPress={handleNumberPress} />
                    <NumberButton number={3} letters="DEF" onPress={handleNumberPress} />
                </View>

                <View style={styles.numberRow}>
                    <NumberButton number={4} letters="GHI" onPress={handleNumberPress} />
                    <NumberButton number={5} letters="JKL" onPress={handleNumberPress} />
                    <NumberButton number={6} letters="MNO" onPress={handleNumberPress} />
                </View>

                <View style={styles.numberRow}>
                    <NumberButton number={7} letters="PQRS" onPress={handleNumberPress} />
                    <NumberButton number={8} letters="TUV" onPress={handleNumberPress} />
                    <NumberButton number={9} letters="WXYZ" onPress={handleNumberPress} />
                </View>

                <View style={styles.numberRow}>
                    <TouchableOpacity
                        style={[styles.numberButton, { backgroundColor: appColors.card }]}
                        onPress={handleClear}
                    >
                        <Ionicons name="backspace-outline" size={24} color={appColors.text} />
                    </TouchableOpacity>
                    <NumberButton number={0} onPress={handleNumberPress} />
                    <TouchableOpacity
                        style={[styles.numberButton, { backgroundColor: appColors.card }]}
                        onPress={handleDelete}
                    >
                        <Ionicons name="backspace" size={24} color={appColors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {formData.pin.length === 4 && !isConfirming && (
                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: appColors.tint }]}
                    onPress={() => setIsConfirming(true)}
                >
                    <Text style={[styles.nextButtonText, { color: appColors.background }]}>
                        Continue
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    pinContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    pinDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginHorizontal: 8,
        borderWidth: 1,
    },
    errorText: {
        fontSize: 14,
        marginTop: 8,
    },
    numberPad: {
        marginTop: 'auto',
    },
    numberRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    numberButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    number: {
        fontSize: 24,
        fontWeight: '500',
    },
    letters: {
        fontSize: 12,
        marginTop: 4,
    },
    nextButton: {
        marginTop: 24,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PinSetUp;