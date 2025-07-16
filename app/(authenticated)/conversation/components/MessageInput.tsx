import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

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
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
            style={styles.keyboardAvoid}
        >
            <View style={[styles.inputBar, { backgroundColor: theme.card }, Platform.OS === 'android' ? styles.inputBarAndroid : {}]}>
                <TouchableOpacity style={{ marginRight: 8, padding: 2 }}>
                    <Ionicons name="add-circle-outline" size={26} color={theme.icon} />
                </TouchableOpacity>
                <View style={[
                    styles.inputContainer,
                    { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' },
                    Platform.OS === 'android' ? styles.inputContainerAndroid : {},
                ]}>
                    <TextInput
                        style={[
                            styles.input,
                            { color: theme.text },
                            Platform.OS === 'android' ? styles.inputAndroid : {},
                        ]}
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
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="key-outline" size={24} color={theme.icon} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={onSendMessage}
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: theme.tint,
                            borderColor: theme.border,
                            opacity: isSending ? 0.6 : 1
                        },
                        Platform.OS === 'android' ? styles.sendButtonAndroid : {},
                    ]}
                    disabled={!newMessage?.trim() || isSending}
                >
                    <Ionicons
                        name={isSending ? "time" : "send"}
                        size={20}
                        color={"white"}
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
        gap: 2,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(150, 150, 150, 0.2)',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
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
        width: '90%'
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    inputBarAndroid: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    inputContainerAndroid: {
        borderRadius: 40,
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    inputAndroid: {
        fontSize: 16,
        lineHeight: 20,
        minHeight: 20,
        paddingVertical: 0,
    },
    sendButtonAndroid: {
        elevation: 2,
        borderRadius: 20,
    },
}); 