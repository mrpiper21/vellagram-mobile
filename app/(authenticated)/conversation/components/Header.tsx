import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
    groupName: string;
    groupAvatar: string;
    profileUrl?: string
    onMenuPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ groupName, groupAvatar, onMenuPress, profileUrl }) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];

    const handleMenuPress = () => {
        console.log('🔍 Menu button pressed!');
        onMenuPress();
    };

    return (
        <View style={[styles.header, { backgroundColor: appColors.card }]}>
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={appColors.text} />
                </TouchableOpacity>
                <View style={styles.avatarNameContainer}>
                    {profileUrl ? <Image style={{ height: 40, width: 40, borderRadius: 20 }} src={profileUrl} /> : <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{groupAvatar}</Text>
                    </View>}
                    <Text style={[styles.groupName, { color: appColors.text }]} numberOfLines={1}>
                        {groupName}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={handleMenuPress}
                style={styles.menuButton}
                activeOpacity={0.7}
            >
                <Ionicons name="reorder-three" size={24} color={appColors.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
        paddingTop: 40,
        justifyContent: 'space-between'
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    // flex: 1,
    },
    backButton: {
        marginRight: 8,
        padding: 4,
    },
    menuButton: {
        padding: 8,
        borderRadius: 4,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#25D366",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    avatarText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    groupName: {
        fontSize: 18,
        fontWeight: "600",
        flex: 1,
    },
}); 