import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { KeyboardAvoidingView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface MessageInputProps {
    newMessage: string;
    setNewMessage: (message: string) => void;
    onSendMessage: () => void;
    isSending: boolean;
    isConnected: boolean;
    theme: any;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    newMessage,
    setNewMessage,
    onSendMessage,
    isSending,
    isConnected,
    theme
}) => {
    return (
        <KeyboardAvoidingView
        // behavior={Platform.OS === "ios" ? "padding" : undefined}
        // keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        // style={styles.keyboardAvoid}
        >
            <View style={[styles.inputBar, { backgroundColor: theme.card }]}>
                <View style={[
                    styles.inputContainer,
                    { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                ]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Type a message"
                        placeholderTextColor={theme.icon}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        onSubmitEditing={onSendMessage}
                        returnKeyType="send"
                        multiline
                        maxLength={500}
                        textAlignVertical="center"
                    />
                </View>
                <TouchableOpacity
                    onPress={onSendMessage}
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: newMessage.trim() && isConnected ? theme.tint : theme.card,
                            borderColor: theme.border,
                            opacity: isSending ? 0.6 : 1
                        }
                    ]}
                    disabled={!newMessage?.trim() || isSending}
                >
                    <Ionicons
                        name={isSending ? "time" : "send"}
                        size={20}
                        color={newMessage?.trim() ? "white" : theme.icon}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoid: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(150, 150, 150, 0.2)',
    },
    inputContainer: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
    },
    input: {
        fontSize: 16,
        lineHeight: 20,
        minHeight: 20,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
}); 