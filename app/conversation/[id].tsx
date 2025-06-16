import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Animated, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AnnouncementBanner } from "./components/AnnouncementBanner";
import { GroupDetailsSheet } from "./components/GroupDetailsSheet";
import { Header } from "./components/Header";
import { MenuDropdown } from "./components/MenuDropdown";

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
    const [showMenu, setShowMenu] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const menuAnimation = useRef(new Animated.Value(0)).current;
    const detailsAnimation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = showMenu ? 0 : 1;
        setShowMenu(!showMenu);
        Animated.spring(menuAnimation, {
            toValue,
            useNativeDriver: true,
            tension: 65,
            friction: 11
        }).start();
    };

    const toggleDetails = () => {
        const toValue = showDetails ? 0 : 1;
        setShowDetails(!showDetails);
        Animated.spring(detailsAnimation, {
            toValue,
            useNativeDriver: true,
            tension: 65,
            friction: 11
        }).start();
    };

    const handleMenuOption = (optionId: string) => {
        toggleMenu();
        switch (optionId) {
            case 'details':
                toggleDetails();
                break;
            case 'payment':
                // Handle payment history
                break;
            case 'leave':
                // Handle leave group
                break;
        }
    };

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

    const handleChatPress = (memberId: string) => {
        // Navigate to individual chat
        // router.push(`/chat/${memberId}`);
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
            <Header
                groupName={group.name}
                groupAvatar={group.avatar}
                onMenuPress={toggleMenu}
            />

            <AnnouncementBanner
                title="Announcement"
                message="Next Repayment of GHS 200 due on 10th June"
            />

            <MenuDropdown
                visible={showMenu}
                onClose={toggleMenu}
                onOptionPress={handleMenuOption}
                animation={menuAnimation}
            />

            <GroupDetailsSheet
                visible={showDetails}
                onClose={toggleDetails}
                groupName={group.name}
                groupAvatar={group.avatar}
                animation={detailsAnimation}
                onChatPress={handleChatPress}
            />

            {/* Messages */}
            <View style={[styles.messagesContainer, { backgroundColor: appColors.background }]}>
                <View style={[styles.backgroundPattern, { backgroundColor: appColors.background }]}>
                    <View style={styles.patternGrid}>
                        {[...Array(6)].map((_, rowIndex) => (
                            <View key={rowIndex} style={styles.patternRow}>
                                {[...Array(8)].map((_, colIndex) => (
                                    <View key={colIndex} style={[
                                        styles.patternDot,
                                        {
                                            opacity: 0.1,
                                            backgroundColor: appColors.tint,
                                            transform: [
                                                { scale: (rowIndex + colIndex) % 2 === 0 ? 1 : 0.8 }
                                            ]
                                        }
                                    ]} />
                                ))}
                            </View>
                        ))}
                    </View>
                    <View style={styles.randomElements}>
                        {[...Array(12)].map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.randomElement,
                                    {
                                        backgroundColor: appColors.tint,
                                        opacity: 0.03,
                                        width: Math.random() * 40 + 20,
                                        height: Math.random() * 40 + 20,
                                        borderRadius: Math.random() * 20,
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        transform: [
                                            { rotate: `${Math.random() * 360}deg` }
                                        ]
                                    }
                                ]}
                            />
                        ))}
                    </View>
                </View>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            </View>

            {/* Input Bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={styles.keyboardAvoid}
            >
                <View style={[styles.inputBar, { backgroundColor: appColors.card }]}>
                    <View style={[styles.inputContainer, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                        <TextInput
                            style={[styles.input, { color: appColors.text }]}
                            placeholder="Type a message"
                            placeholderTextColor={appColors.icon}
                            value={input}
                            onChangeText={setInput}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                            multiline
                            maxLength={500}
                            textAlignVertical="center"
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor: input.trim() ? appColors.tint : appColors.card,
                                borderColor: appColors.border
                            }
                        ]}
                        disabled={!input.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={input.trim() ? "white" : appColors.icon}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    messagesContainer: {
        flex: 1,
        position: 'relative',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    patternGrid: {
        flex: 1,
        justifyContent: 'space-around',
        paddingVertical: 20,
    },
    patternRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
    },
    patternDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    randomElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    randomElement: {
        position: 'absolute',
    },
    messagesList: {
        padding: 16,
    },
    messageRow: {
        flexDirection: "row",
        marginBottom: 10,
    },
    bubble: {
        maxWidth: "80%",
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        marginVertical: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    timeText: {
        fontSize: 11,
        color: "#8E8E93",
        marginTop: 4,
        alignSelf: "flex-end",
    },
    keyboardAvoid: {
        width: '100%',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    inputContainer: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 40,
        maxHeight: 100,
    },
    input: {
        fontSize: 16,
        padding: 0,
        maxHeight: 80,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
});