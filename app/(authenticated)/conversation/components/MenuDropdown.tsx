import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MenuOption {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

interface MenuDropdownProps {
    visible: boolean;
    onClose: () => void;
    onOptionPress: (optionId: string) => void;
    animation: Animated.Value;
}

const menuOptions: MenuOption[] = [
    { id: 'details', label: 'Group Details', icon: 'information-circle-outline' },
    { id: 'payment', label: 'Payment History', icon: 'wallet-outline' },
    { id: 'leave', label: 'Leave Group', icon: 'log-out-outline' },
];

export const MenuDropdown: React.FC<MenuDropdownProps> = ({
    visible,
    onClose,
    onOptionPress,
    animation
}) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];

    console.log('🔍 MenuDropdown render - visible:', visible);

    if (!visible) {
        return null;
    }

    return (
        <View style={styles.overlay}>
            <TouchableOpacity
                style={styles.menuOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.menuContainer,
                        {
                            backgroundColor: appColors.card,
                            transform: [{
                                translateY: animation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0]
                                })
                            }],
                            opacity: animation
                        }
                    ]}
                >
                    {menuOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.menuOption}
                            onPress={() => onOptionPress(option.id)}
                        >
                            <Ionicons name={option.icon} size={20} color={appColors.text} />
                            <Text style={[styles.menuOptionText, { color: appColors.text }]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 100, // Adjust this to position below the header
    },
    menuContainer: {
        borderRadius: 12,
        padding: 8,
        minWidth: 200,
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    menuOptionText: {
        fontSize: 16,
        fontWeight: '500',
    },
}); 