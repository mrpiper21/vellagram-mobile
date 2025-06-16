import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { PlusCircleIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import NoMessagesIllustration from "../illustrations/NoMessagesIllustration";

const NoMessages = () => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const appColors = Colors[colorScheme];

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <NoMessagesIllustration />
            <Text style={[styles.title, { color: appColors.text }]}>
                No Messages Yet
            </Text>
            <Text style={[styles.subtitle, { color: appColors.text, opacity: 0.7 }]}>
                Start a conversation by tapping the + button above
            </Text>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: appColors.tint }]}
                onPress={() => router.push("/contacts")}
                activeOpacity={0.8}
            >
                <PlusCircleIcon size={20} color="white" strokeWidth={2.5} />
                <Text style={styles.buttonText}>Start New Conversation</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

export default NoMessages; 