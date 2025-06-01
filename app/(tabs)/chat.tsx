import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Dummy chat groups for demonstration
const dummyChats = {
    chats: [
        {
            id: "1",
            name: "Family Susu Circle",
            lastMessage: "Payment reminder: Next contribution due tomorrow!",
            time: "2 min ago",
            type: "group",
            unreadCount: 3,
            avatar: "F",
            members: 12,
            nextPayment: "GHS 200",
            dueDate: "10 June 2024"
        },
        {
            id: "2",
            name: "Office Workers Susu",
            lastMessage: "Welcome Sarah! Please introduce yourself",
            time: "1 hour ago",
            type: "direct",
            unreadCount: 0,
            avatar: "O",
            members: 8,
            nextPayment: "GHS 150",
            dueDate: "15 June 2024"
        },
        {
            id: "3",
            name: "Friends Savings Group",
            lastMessage: "Great job everyone on this month's savings!",
            time: "3 hours ago",
            type: "group",
            unreadCount: 1,
            avatar: "F",
            members: 6,
            nextPayment: "GHS 100",
            dueDate: "20 June 2024"
        },
    ],
    savings: [
        {
            id: "1",
            name: "Family Susu Circle",
            lastMessage: "Payment reminder: Next contribution due tomorrow!",
            time: "2 min ago",
            type: "group",
            unreadCount: 2,
            avatar: "F",
            members: 12,
            nextPayment: "GHS 200",
            dueDate: "10 June 2024"
        },
        {
            id: "3",
            name: "Friends Savings Group",
            lastMessage: "Great job everyone on this month's savings!",
            time: "3 hours ago",
            type: "group",
            unreadCount: 0,
            avatar: "F",
            members: 6,
            nextPayment: "GHS 100",
            dueDate: "20 June 2024"
        },
    ]
};

export default function ChatTab() {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];

    const [activeTab, setActiveTab] = useState<'chats' | 'savings'>('chats');
    const [chats, setChats] = useState(dummyChats);

    const renderChatItem = ({ item }: { item: typeof dummyChats.chats[0] }) => {
        const obg = {
            chats: (
                <TouchableOpacity
                    style={[
                        styles.chatItem,
                        { backgroundColor: appColors.background }
                    ]}
                    onPress={() => router.push(`/conversation/${item.id}`)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.avatar, { backgroundColor: appColors.tint }]}>
                        <Text style={styles.avatarText}>{item.avatar}</Text>
                    </View>

                    <View style={styles.chatContent}>
                        <View style={styles.chatHeader}>
                            <View style={styles.nameContainer}>
                                <Text style={[styles.chatName, { color: appColors.text }]}>
                                    {item.name}
                                </Text>
                                <View style={styles.memberCount}>
                                    <Text style={[styles.memberText, { color: appColors.icon }]}>
                                        {item.members}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.timeStamp, { color: appColors.text }]}>
                                {item.time}
                            </Text>
                        </View>

                        <View style={styles.messageRow}>
                            <Text style={[styles.lastMessage, { color: appColors.text }]} numberOfLines={1}>
                                {item.lastMessage}
                            </Text>

                            {item.unreadCount > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            ),
            savings: (
                <TouchableOpacity
                    style={[
                        styles.chatItem,
                        { backgroundColor: appColors.background }
                    ]}
                    onPress={() => router.push(`/conversation/${item.id}`)}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: appColors.tint }]} />
                        <View style={[styles.avatar, {
                            backgroundColor: appColors.tabIconDefault,
                            position: "absolute",
                            borderWidth: 2,
                            borderColor: 'white',
                            left: 7,
                            top: 0,
                            zIndex: 1
                        }]} />
                        <View style={[styles.memberCountBadge, { backgroundColor: appColors.tint }]}>
                            <Text style={styles.memberCountText}>2+</Text>
                        </View>
                    </View>

                    <View style={styles.chatContent}>
                        <View style={styles.chatHeader}>
                            <View style={styles.nameContainer}>
                                <Text style={[styles.chatName, { color: appColors.text }]}>
                                    {item.name}
                                </Text>
                                <View style={styles.memberCount}>
                                    <Ionicons name="people" size={14} color={appColors.icon} />
                                    <Text style={[styles.memberText, { color: appColors.icon }]}>
                                        {item.members}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.timeStamp, { color: appColors.text }]}>
                                {item.time}
                            </Text>
                        </View>

                        <View style={styles.messageRow}>
                            <View style={styles.paymentInfo}>
                                <View style={styles.paymentRow}>
                                    <Text style={[styles.paymentLabel, { color: appColors.icon }]}>
                                        Next payment:
                                    </Text>
                                    <View style={[styles.amountBadge, { backgroundColor: appColors.tint }]}>
                                        <Text style={styles.amountText}>GHS 200</Text>
                                    </View>
                                </View>
                                <View style={styles.dueDateRow}>
                                    <Text style={[styles.dueDateLabel, { color: appColors.icon }]}>
                                        Due:
                                    </Text>
                                    <Text style={[styles.dueDateText, { color: appColors.text }]}>
                                        10 june, 2025
                                    </Text>
                                </View>
                            </View>

                            {item.unreadCount > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            )
        };

        return obg[activeTab];
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: appColors.card }]}>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>
                    Messages
                </Text>
                <TouchableOpacity style={styles.createButton}>
                    <Ionicons name="add-circle-outline" size={24} color={appColors.tint} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: appColors.card }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'chats' && { borderBottomColor: appColors.tint }
                    ]}
                    onPress={() => setActiveTab('chats')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'chats' ? appColors.tint : appColors.text }
                    ]}>
                        Chats
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'savings' && { borderBottomColor: appColors.tint }
                    ]}
                    onPress={() => setActiveTab('savings')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'savings' ? appColors.tint : appColors.text }
                    ]}>
                        Savings
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Chat List */}
            <FlatList
                data={chats[activeTab]}
                keyExtractor={item => item.id}
                renderItem={renderChatItem}
                contentContainerStyle={styles.chatList}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(150, 150, 150, 0.2)",
        paddingTop: 35
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    createButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(150, 150, 150, 0.2)",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "500",
    },
    chatList: {
        // padding: 12,
    },
    chatItem: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 0,
        marginBottom: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(150, 150, 150, 0.2)",
    },
    avatarContainer: {
        width: 48,
        height: 48,
        marginRight: 12,
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 20,
    },
    chatContent: {
        flex: 1,
        justifyContent: "center",
    },
    chatHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    nameContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    chatName: {
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
    memberCount: {
        flexDirection: "row",
        alignItems: "center",
    },
    memberText: {
        fontSize: 12,
        marginLeft: 2,
    },
    timeStamp: {
        fontSize: 12,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    paymentInfo: {
        flex: 1,
        marginRight: 8,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    paymentLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    amountBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    amountText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    dueDateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dueDateLabel: {
        fontSize: 12,
        marginRight: 4,
    },
    dueDateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#25D366",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    memberCountBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        zIndex: 3,
    },
    memberCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
}); 