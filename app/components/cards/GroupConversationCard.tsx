import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GroupConversationCardProps {
    item: any;
    theme: any;
    currentUser: any;
    participants: any[];
}

const GroupConversationCard: React.FC<GroupConversationCardProps> = ({
    item,
    theme,
    currentUser,
    participants,
}) => {
    try {
        if (!item || typeof item !== "object") {
            console.warn("Invalid group conversation item:", item);
            return null;
        }

        const lastMessage = item?.lastMessage;
        const isUnread = (item?.unreadCount || 0) > 0;
        const groupName = item?.name || "Group Chat";
        const memberCount = participants?.length || 0;

        // Get first 3 participants for avatar display
        const displayParticipants = participants?.slice(0, 3) || [];

        const renderAvatarGrid = () => {
            if (displayParticipants.length === 0) {
                return (
                    <View style={[styles.defaultGroupAvatar, { backgroundColor: theme.tint }]}>
                        <MaterialIcons name="group" color={theme.background} size={24} />
                    </View>
                );
            }

            if (displayParticipants.length === 1) {
                const participant = displayParticipants[0];
                return (
                    <View style={[styles.singleAvatarLarge, { backgroundColor: theme.tint }]}>
                        {participant.profile ? (
                            <Image
                                source={{ uri: participant.profile }}
                                style={styles.avatarImageLarge}
                                resizeMode="cover"
                            />
                        ) : (
                            <AntDesign 
                                name="user" 
                                color={theme.background} 
                                size={28} 
                            />
                        )}
                    </View>
                );
            }

            if (displayParticipants.length === 2) {
                return (
                    <View style={styles.avatarGridTwo}>
                        {displayParticipants.map((participant, index) => (
                            <View
                                key={participant.id || index}
                                style={[
                                    styles.singleAvatarMedium,
                                    {
                                        backgroundColor: theme.tint,
                                        borderColor: theme.background,
                                        top: index === 0 ? 0 : 8,
                                        left: index === 0 ? 0 : 8,
                                    },
                                ]}
                            >
                                {participant.profile ? (
                                    <Image
                                        source={{ uri: participant.profile }}
                                        style={styles.avatarImageMedium}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <AntDesign 
                                        name="user" 
                                        color={theme.background} 
                                        size={20} 
                                    />
                                )}
                            </View>
                        ))}
                    </View>
                );
            }

            return (
                <View style={styles.avatarGridThree}>
                    {displayParticipants.map((participant, index) => (
                        <View
                            key={participant.id || index}
                            style={[
                                styles.singleAvatarSmall,
                                {
                                    backgroundColor: theme.tint,
                                    borderColor: theme.background,
                                    top: index === 0 ? 0 : index === 1 ? 4 : 8,
                                    left: index === 0 ? 0 : index === 1 ? 4 : 8,
                                },
                            ]}
                        >
                            {participant.profile ? (
                                <Image
                                    source={{ uri: participant.profile }}
                                    style={styles.avatarImageSmall}
                                    resizeMode="cover"
                                />
                            ) : (
                                <AntDesign 
                                    name="user" 
                                    color={theme.background} 
                                    size={16} 
                                />
                            )}
                        </View>
                    ))}
                    {/* {memberCount > 3 && (
                        <View
                            style={[
                                styles.moreMembers,
                                { backgroundColor: theme.textSecondary },
                            ]}
                        >
                            <Text style={[styles.moreMembersText, { color: theme.background }]}>
                                +{memberCount - 3}
                            </Text>
                        </View>
                    )} */}
                </View>
            );
        };

        return (
            <TouchableOpacity
                style={[
                    styles.conversationItem,
                    { backgroundColor: theme.background, borderColor: theme.border },
                ]}
                onPress={() => {
                    if (item?.id) {
                        router.push(`/(authenticated)/conversation/${item.id}`);
                    }
                }}
                activeOpacity={0.85}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.groupAvatar}>
                        {renderAvatarGrid()}
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
                </View>
                <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeader}>
                        <View style={styles.nameContainer}>
                            <Text
                                style={[styles.conversationName, { color: theme.text }]}
                                numberOfLines={1}
                            >
                                {groupName}
                            </Text>
                            <View style={styles.groupIndicator}>
                                <MaterialIcons 
                                    name="group" 
                                    size={12} 
                                    color={theme.textSecondary} 
                                />
                                <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
                                    {memberCount} members
                                </Text>
                            </View>
                        </View>
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
                            {lastMessage?.senderName && (
                                <Text style={[styles.senderName, { color: theme.textSecondary }]}>
                                    {lastMessage.senderName}:{" "}
                                </Text>
                            )}
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
        console.error("Error rendering group conversation:", error);
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
    senderName: {
        fontWeight: "500",
    },
    conversationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    nameContainer: {
        flex: 1,
        marginRight: 8,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    groupIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    memberCount: {
        fontSize: 11,
        fontWeight: "400",
    },
    avatarContainer: {
        marginRight: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    groupAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    // Single avatar (1 participant)
    singleAvatarLarge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "white",
    },
    avatarImageLarge: {
        width: "100%",
        height: "100%",
        borderRadius: 24,
    },
    // Two avatars (2 participants)
    avatarGridTwo: {
        width: 52,
        height: 52,
        borderRadius: 26,
        position: "relative",
    },
    singleAvatarMedium: {
        position: "absolute",
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
    },
    avatarImageMedium: {
        width: "100%",
        height: "100%",
        borderRadius: 14,
    },
    // Three or more avatars (3+ participants)
    avatarGridThree: {
        width: 52,
        height: 52,
        borderRadius: 26,
        position: "relative",
    },
    singleAvatarSmall: {
        position: "absolute",
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
    },
    avatarImageSmall: {
        width: "100%",
        height: "100%",
        borderRadius: 10.5,
    },
    moreMembers: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "white",
    },
    moreMembersText: {
        fontSize: 9,
        fontWeight: "700",
    },
    defaultGroupAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "white",
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

export default GroupConversationCard; 