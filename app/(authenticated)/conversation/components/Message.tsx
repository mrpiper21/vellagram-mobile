import { Message as MessageType } from "@/types/conversation";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MessageProps {
    message: MessageType;
    isOwnMessage: boolean;
    theme: any;
}

export const Message: React.FC<MessageProps> = ({ message, isOwnMessage, theme }) => {
    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'queued':
                return 'time';
            case 'sending':
                return 'time';
            case 'sent':
                return 'checkmark';
            case 'delivered':
                return 'checkmark-done';
            case 'read':
                return 'checkmark-done';
            case 'failed':
                return 'close';
            default:
                return 'close';
        }
    };

    return (
        <View style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}>
            <View style={[
                styles.messageBubble,
                {
                    backgroundColor: isOwnMessage ? theme?.border : theme?.card,
                }
            ]}>
                <Text style={[
                    styles.messageText,
                    { color: theme.text }
                ]}>
                    {message.content}
                </Text>
                <View style={styles.messageFooter}>
                    <Text style={[
                        styles.messageTime,
                        { color: theme.text }
                    ]}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                    {isOwnMessage && (
                        <Ionicons
                            name={getStatusIcon(message.status)}
                            size={14}
                            color={theme.text}
                            style={styles.statusIcon}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 4,
        paddingHorizontal: 16,
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
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        marginBottom: 4,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    messageTime: {
        fontSize: 12,
        opacity: 0.7,
    },
    statusIcon: {
        marginLeft: 2,
    },
}); 