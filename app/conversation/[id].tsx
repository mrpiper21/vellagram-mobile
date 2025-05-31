import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Dummy messages for demonstration
const dummyMessages = [
    { id: "1", text: "Welcome to the group!", sender: "other", time: "09:00" },
    { id: "2", text: "Hi everyone 👋", sender: "me", time: "09:01" },
    { id: "3", text: "Next contribution is due tomorrow.", sender: "other", time: "09:02" },
    { id: "4", text: "Thanks for the reminder!", sender: "me", time: "09:03" },
];

export default function ConversationDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];

    const [messages, setMessages] = useState(dummyMessages);
    const [input, setInput] = useState("");
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (input.trim()) {
            setMessages([
                ...messages,
                { id: Date.now().toString(), text: input, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]);
            setInput("");
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    // Simulate group info (you can fetch real data)
    const group = {
        name: "Group " + id,
        avatar: "G",
    };

    const renderMessage = ({ item }: { item: typeof dummyMessages[0] }) => (
        <View
            style={[
                styles.messageRow,
                { justifyContent: item.sender === "me" ? "flex-end" : "flex-start" }
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    {
                        backgroundColor: item.sender === "me" ? appColors.tint : appColors.card,
                        alignSelf: item.sender === "me" ? "flex-end" : "flex-start",
                    }
                ]}
            >
                <Text style={{
                    color: item.sender === "me" ? "#fff" : appColors.text,
                    fontSize: 15,
                }}>
                    {item.text}
                </Text>
                <Text style={styles.timeText}>{item.time}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: appColors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={appColors.text} />
                </TouchableOpacity>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{group.avatar}</Text>
                </View>
                <Text style={[styles.groupName, { color: appColors.text }]} numberOfLines={1}>
                    {group.name}
                </Text>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={80}
            >
                <View style={[styles.inputBar, { backgroundColor: appColors.card }]}>
                    <TextInput
                        style={[styles.input, { color: appColors.text }]}
                        placeholder="Type a message"
                        placeholderTextColor={appColors.icon}
                        value={input}
                        onChangeText={setInput}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <Ionicons name="send" size={22} color={appColors.tint} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
    },
    backButton: {
        marginRight: 8,
        padding: 4,
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
    messagesList: {
        flexGrow: 1,
        padding: 12,
        paddingBottom: 4,
    },
    messageRow: {
        flexDirection: "row",
        marginBottom: 10,
    },
    bubble: {
        maxWidth: "80%",
        borderRadius: 18,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginHorizontal: 4,
    },
    timeText: {
        fontSize: 11,
        color: "#bbb",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderTopWidth: 0.5,
        borderTopColor: "#ddd",
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        marginRight: 8,
    },
    sendButton: {
        padding: 6,
    },
});