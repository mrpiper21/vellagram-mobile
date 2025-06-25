import { useAppTheme } from "@/context/ThemeContext";
import { useSocketContext } from "@/context/useSockectContext";
import { useSocketChat } from '@/hooks/useSocketChat';
import { useActiveConversation, useChatActions, useConversation, useConversationMessages } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

export default function ConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useAppTheme();
    const {user} = useUserStore((state) => state);

    // Chat store hooks
    const messages = useConversationMessages(id);
    const conversation = useConversation(id);
    const activeConversationId = useActiveConversation();
    const { addMessage, markConversationAsRead, setActiveConversation } = useChatActions();

    // Socket integration
    const { sendMessage: sendSocketMessage, isConnected } = useSocketChat();

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const menuAnimation = useRef(new Animated.Value(0)).current;
    const detailsAnimation = useRef(new Animated.Value(0)).current;
    const socket = useSocketContext()

    // Memoize random elements to prevent infinite re-renders
    const randomElements = useMemo(() => {
        return [...Array(12)].map((_, index) => ({
            id: index,
            width: 20 + (index * 2) % 40,
            height: 20 + (index * 3) % 40,
            borderRadius: 10 + (index * 2) % 20,
            top: (index * 7) % 100,
            left: (index * 11) % 100,
            rotate: (index * 30) % 360,
        }));
    }, []);

    // Set active conversation when component mounts
    useEffect(() => {
        if (id) {
            setActiveConversation(id);
            markConversationAsRead(id);
        }
    }, [id, setActiveConversation, markConversationAsRead]);

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

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user?.id || !id) return;

        setIsSending(true);
        
        try {
            const otherParticipant = conversation?.participants?.find(p => p !== user.id);
            if (!otherParticipant) {
                Alert.alert('Error', 'Cannot determine recipient');
                return;
            }

            // Add message to local store first (optimistic update)
            addMessage({
                conversationId: id,
                senderId: user.id,
                content: newMessage.trim(),
                type: 'text'
            });

            // Send via socket
            sendSocketMessage(otherParticipant, newMessage.trim(), 'text');
            
            setNewMessage('');
        } catch (error) {
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setIsSending(false);
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

    const renderMessage = ({ item }: { item: any }) => {
        const isOwnMessage = item?.senderId === user?.id;
        
        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessage : styles.otherMessage
            ]}>
                <View style={[
                    styles.messageBubble,
                    {
                        backgroundColor: isOwnMessage ? theme?.tint : theme?.card,
                        borderColor: theme.border
                    }
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isOwnMessage ? 'white' : theme.text }
                    ]}>
                        {item?.content}
                    </Text>
                    <View style={styles.messageFooter}>
                        <Text style={[
                            styles.messageTime,
                            { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : theme.icon }
                        ]}>
                            {new Date(item?.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </Text>
                        {isOwnMessage && (
                            <Ionicons 
                                name={
                                    item?.status === 'sending' ? 'time' :
                                    item?.status === 'sent' ? 'checkmark' :
                                    item?.status === 'delivered' ? 'checkmark-done' :
                                    item?.status === 'read' ? 'checkmark-done' :
                                    'close'
                                } 
                                size={14} 
                                color={isOwnMessage ? 'rgba(255,255,255,0.7)' : theme.icon} 
                                style={styles.statusIcon}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (!conversation) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>
                    Conversation not found
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Header
                groupName={group?.name}
                groupAvatar={group?.avatar}
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
                groupName={group?.name}
                groupAvatar={group?.avatar}
                animation={detailsAnimation}
                onChatPress={handleChatPress}
            />

            {/* Messages */}
            <View style={[styles.messagesContainer, { backgroundColor: theme.background }]}>
                <View style={[styles.backgroundPattern, { backgroundColor: theme.background }]}>
                    <View style={styles.patternGrid}>
                        {[...Array(6)].map((_, rowIndex) => (
                            <View key={rowIndex} style={styles.patternRow}>
                                {[...Array(8)].map((_, colIndex) => (
                                    <View key={colIndex} style={[
                                        styles.patternDot,
                                        {
                                            opacity: 0.1,
                                            backgroundColor: theme.tint,
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
                        {randomElements.map((element) => (
                            <View
                                key={element.id}
                                style={[
                                    styles.randomElement,
                                    {
                                        backgroundColor: theme.tint,
                                        opacity: 0.03,
                                        width: element.width,
                                        height: element.height,
                                        borderRadius: element.borderRadius,
                                        top: `${element.top}%`,
                                        left: `${element.left}%`,
                                        transform: [
                                            { rotate: `${element.rotate}deg` }
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
                    keyExtractor={(item) => item?.id || `msg-${item?.timestamp || Date.now()}`}
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
                <View style={[styles.inputBar, { backgroundColor: theme.card }]}>
                    <View style={[styles.inputContainer, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Type a message"
                            placeholderTextColor={theme.icon}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            onSubmitEditing={handleSendMessage}
                            returnKeyType="send"
                            multiline
                            maxLength={500}
                            textAlignVertical="center"
                        />
                    </View>
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor: newMessage.trim() && isConnected ? theme.tint : theme.card,
                                borderColor: theme.border,
                                opacity: isSending ? 0.6 : 1
                            }
                        ]}
                        disabled={!newMessage.trim() || isSending || !isConnected}
                    >
                        <Ionicons
                            name={isSending ? "time" : "send"}
                            size={20}
                            color={newMessage.trim() ? "white" : theme.icon}
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
    messageContainer: {
        marginVertical: 4,
    },
    ownMessage: {
        alignItems: 'flex-end',
    },
    otherMessage: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 12,
    },
    statusIcon: {
        marginLeft: 4,
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
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});