import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";

interface AccountInfoProps {
    formData: {
        email: string;
        password: string;
        confirmPassword: string;
    };
    updateFormData: (field: string, value: string) => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ formData, updateFormData }) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: appColors.text }]}>Account Information</Text>
                <Text style={[styles.subtitle, { color: appColors.icon }]}>
                    Set up your account credentials
                </Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: appColors.text }]}>Email Address</Text>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: appColors.card,
                        color: appColors.text,
                        borderColor: appColors.border
                    }]}
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    placeholder="john.doe@example.com"
                    placeholderTextColor={appColors.icon}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: appColors.text }]}>Password</Text>
                <View style={[styles.passwordContainer, {
                    backgroundColor: appColors.card,
                    borderColor: appColors.border
                }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: appColors.text }]}
                        value={formData.password}
                        onChangeText={(text) => updateFormData('password', text)}
                        placeholder="Enter your password"
                        placeholderTextColor={appColors.icon}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={24}
                            color={appColors.icon}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: appColors.text }]}>Confirm Password</Text>
                <View style={[styles.passwordContainer, {
                    backgroundColor: appColors.card,
                    borderColor: appColors.border
                }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: appColors.text }]}
                        value={formData.confirmPassword}
                        onChangeText={(text) => updateFormData('confirmPassword', text)}
                        placeholder="Confirm your password"
                        placeholderTextColor={appColors.icon}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={24}
                            color={appColors.icon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
});

export default AccountInfo; 