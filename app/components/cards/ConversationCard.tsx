import { getOtherParticipantDetails } from "@/helpers/conversationUtils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AvatarPlaceholder from "../avatar/AvatarPlaceholder";

interface ConversationCardProps {
    item: any;
    theme: any;
    currentUser: any;
    contacts: any;
    allUsers: any;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
    item,
    theme,
    currentUser,
    contacts,
    allUsers,
}) => {
    try {
        if (!item || typeof item !== "object") {
            console.warn("Invalid conversation item:", item);
            return null;
        }

        const lastMessage = item?.lastMessage;
        const isUnread = (item?.unreadCount || 0) > 0;

        console.log("🔍 Rendering conversation:", item);

        const conversationUser = getOtherParticipantDetails(
            item?.participants,
            currentUser?.id,
            contacts,
            allUsers || []
        );

        console.log("✅ Conversation user details:", conversationUser);

        const recipientId = item.participants.filter(
            (participantId: string) => participantId !== currentUser?.id
        );

        return (
            <TouchableOpacity
                style={[
                    styles.conversationItem,
                    { backgroundColor: theme.background, borderColor: theme.border },
                ]}
                onPress={() => {
                    if (item?.id) {
                        router.push(`/(authenticated)/conversation/${recipientId}`);
                    }
                }}
                activeOpacity={0.85}
            >
                <View style={styles.avatarContainer}>
                    {conversationUser.profile ? (
                        <View style={styles.avatar}>
                            <Image
                                source={{ uri: conversationUser.profile }}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                            {isUnread && (
                                <View
                                    style={[
                                        styles.unreadBadge,
                                        {
                                            backgroundColor: theme.tint,
                                            borderWidth: 2,
                                            borderColor: theme.border,
                                        },
                                    ]}
                                >
                                    <Text style={styles.unreadCount}>
                                        {(item?.unreadCount || 0) > 99
                                            ? "99+"
                                            : item?.unreadCount || 0}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                            <AvatarPlaceholder size={60} style={{borderRadius: 50}} />
                            {isUnread && (
                                <View
                                    style={[
                                        styles.unreadBadge,
                                        {
                                            backgroundColor: theme.tint,
                                            borderWidth: 2,
                                            borderColor: theme.background,
                                        },
                                    ]}
                                >
                                    <Text style={styles.unreadCount}>
                                        {(item?.unreadCount || 0) > 99
                                            ? "99+"
                                            : item?.unreadCount || 0}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeader}>
                        <Text
                            style={[styles.conversationName, { color: theme.text }]}
                            numberOfLines={1}
                        >
                            {conversationUser?.name}
                        </Text>
                        {lastMessage && (
                            <Text
                                style={[styles.messageTime, { color: theme.textSecondary }]}
                            >
                                {new Date(
                                    lastMessage?.timestamp || Date.now()
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </Text>
                        )}
                    </View>
                    <View style={styles.conversationFooter}>
                        <Text
                            style={[
                                styles.lastMessage,
                                isUnread
                                    ? [styles.lastMessageUnread, { color: theme.text }]
                                    : [styles.lastMessageRead, { color: theme.textSecondary }],
                            ]}
                            numberOfLines={1}
                        >
                            {lastMessage?.content || "No messages yet"}
                        </Text>
                        {lastMessage && lastMessage.senderId === currentUser?.id && (
                            <Ionicons
                                name={
                                    lastMessage?.status === "queued"
                                        ? "time"
                                        : lastMessage?.status === "sending"
                                        ? "checkmark"
                                        : lastMessage?.status === "sent"
                                        ? "checkmark"
                                        : lastMessage?.status === "delivered"
                                        ? "checkmark-done"
                                        : lastMessage?.status === "read"
                                        ? "checkmark-done"
                                        : "close"
                                }
                                size={14}
                                color={theme.textSecondary}
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    } catch (error) {
        console.error("Error rendering conversation:", error);
        return null;
    }
};

const styles = StyleSheet.create({
    conversationItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
    },
    messageTime: {
        fontSize: 12,
        fontWeight: "500",
    },
    lastMessage: {
        flex: 1,
        fontSize: 14,
        marginRight: 8,
    },
    lastMessageUnread: {
        fontWeight: "600",
    },
    lastMessageRead: {
        fontWeight: "400",
    },
    conversationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        marginRight: 8,
    },
    avatarContainer: {
        marginRight: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 26,
    },
    unreadBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        paddingHorizontal: 4,
    },
    unreadCount: {
        color: "white",
        fontSize: 10,
        fontWeight: "600",
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    conversationInfo: {
        flex: 1,
        justifyContent: "center",
    },
    conversationFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});

export default ConversationCard;