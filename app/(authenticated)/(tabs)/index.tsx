import NoMessages from '@/components/empty-states/NoMessages';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAppTheme } from '@/context/ThemeContext';
import { useUserInactivity } from '@/context/UserInactivityContext';
import { getOtherParticipantDetails } from '@/helpers/conversationUtils';
import { useSocketChat } from '@/hooks/useSocketChat';
import { useConversations, useTotalUnreadCount } from '@/store/useChatStore';
import { useContactStore } from '@/store/useContactStore';
import { useUserStore } from '@/store/useUserStore';
import { AntDesign, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function ChatScreenContent() {
    const theme = useAppTheme();
    const conversationsObject = useConversations();
    const totalUnreadCount = useTotalUnreadCount();
    const { allUsers } = useUserInactivity()
    const { contacts } = useContactStore()
    const { user: currentUser } = useUserStore()
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // const { clearAllData, } = useChatActions()

    // Socket integration
    const { isConnected } = useSocketChat();

    // clearAllData()

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // Simulate refresh delay
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    // Memoize and validate conversations to prevent crashes
    const safeConversations = useMemo(() => {
        try {
            if (!conversationsObject || typeof conversationsObject !== 'object') {
                console.warn('Conversations object is invalid:', conversationsObject);
                return [];
            }

            // Transform the conversations object to an array
            const conversationsArray = Object.values(conversationsObject)
                .filter(conv => conv && typeof conv === 'object')
                .sort((a, b) => {
                    // Handle cases where lastMessageTime might be undefined
                    const timeA = a?.lastMessageTime || a?.createdAt || 0;
                    const timeB = b?.lastMessageTime || b?.createdAt || 0;
                    return timeB - timeA; // Sort by most recent first
                });

            return conversationsArray;
        } catch (error) {
            console.error('Error processing conversations:', error);
            return [];
        }
    }, [conversationsObject]);

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) {
            return safeConversations;
        }

        const query = searchQuery.toLowerCase().trim();
        console.log('🔍 Searching for query:', query);

        return safeConversations.filter(conversation => {
            try {
                // Get participant details for this conversation
                const participantDetails = getOtherParticipantDetails(
                    conversation?.participants,
                    currentUser?.id,
                    contacts,
                    allUsers || []
                );

                console.log('🔍 Checking conversation:', {
                    conversationId: conversation?.id,
                    participantName: participantDetails?.name,
                    lastMessage: conversation?.lastMessage?.content,
                    query
                });

                // Check if participant name matches search query
                const nameMatch = participantDetails?.name?.toLowerCase().includes(query);

                // Check if last message content matches search query
                const messageMatch = conversation?.lastMessage?.content?.toLowerCase().includes(query);

                const matches = nameMatch || messageMatch;

                if (matches) {
                    console.log('✅ Conversation matches search:', {
                        conversationId: conversation?.id,
                        nameMatch,
                        messageMatch,
                        participantName: participantDetails?.name
                    });
                }

                return matches;
            } catch (error) {
                console.error('Error filtering conversation:', error);
                return false;
            }
        });
    }, [safeConversations, searchQuery, currentUser?.id, contacts, allUsers]);

    // Safe total unread count
    const safeTotalUnreadCount = useMemo(() => {
        try {
            return typeof totalUnreadCount === 'number' ? totalUnreadCount : 0;
        } catch (error) {
            console.error('Error processing total unread count:', error);
            return 0;
        }
    }, [totalUnreadCount]);

    console.log("🔍 TabOneScreen rendering with theme:", theme);
    console.log("📱 Conversations count:", safeConversations?.length);
    console.log("📱 Filtered conversations count:", filteredConversations?.length);
    console.log("📱 Total unread count:", safeTotalUnreadCount);

    const renderConversation = ({ item }: { item: any }) => {
        try {
            if (!item || typeof item !== 'object') {
                console.warn('Invalid conversation item:', item);
                return null;
            }

            const lastMessage = item?.lastMessage;
            const isUnread = (item?.unreadCount || 0) > 0;

            console.log('🔍 Rendering conversation:', item);

            const conversationUser = getOtherParticipantDetails(
                item?.participants,
                currentUser?.id,
                contacts,
                allUsers || []
            );

            console.log('✅ Conversation user details:', conversationUser);

            const recipientId = item.participants.filter((item: string) => item !== currentUser?.id)

            return (
                <TouchableOpacity
                    style={[styles.conversationItem, { backgroundColor: theme.background, borderColor: theme.border }]}
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
                                    <View style={[styles.unreadBadge, { backgroundColor: theme.tint, borderWidth: 2, borderColor: theme.border }]}>
                                        <Text style={styles.unreadCount}>
                                            {(item?.unreadCount || 0) > 99 ? '99+' : (item?.unreadCount || 0)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                                    {/* <Text style={styles.avatarText}>
                                    {item?.isGroup ? 'G' : conversationUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Text> */}
                                    <AntDesign name='user' color={theme.background} size={34} />
                                {isUnread && (
                                        <View style={[styles.unreadBadge, { backgroundColor: theme.tint, borderWidth: 2, borderColor: theme.background }]}>
                                        <Text style={styles.unreadCount}>
                                            {(item?.unreadCount || 0) > 99 ? '99+' : (item?.unreadCount || 0)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                    <View style={styles.conversationInfo}>
                        <View style={styles.conversationHeader}>
                            <Text style={[styles.conversationName, { color: theme.text }]} numberOfLines={1}>
                                {conversationUser?.name}
                            </Text>
                            {lastMessage && (
                                <Text style={[styles.messageTime, { color: theme.textSecondary }]}>
                                    {new Date(lastMessage?.timestamp || Date.now()).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            )}
                        </View>
                        <View style={styles.conversationFooter}>
                            <Text
                                style={[
                                    styles.lastMessage,
                                    isUnread ?
                                        [styles.lastMessageUnread, { color: theme.text }] :
                                        [styles.lastMessageRead, { color: theme.textSecondary }]
                                ]}
                                numberOfLines={1}
                            >
                                {lastMessage?.content || 'No messages yet'}
                            </Text>
                            {lastMessage && lastMessage.senderId === currentUser?.id && (
                                <Ionicons
                                    name={
                                        lastMessage?.status === 'queued' ? 'time' :
                                            lastMessage?.status === 'sending' ? 'checkmark' :
                                                lastMessage?.status === 'sent' ? 'checkmark' :
                                                    lastMessage?.status === 'delivered' ? 'checkmark-done' :
                                                        lastMessage?.status === 'read' ? 'checkmark-done' :
                                                            'close'
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
            console.error('Error rendering conversation:', error);
            return null;
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            {searchQuery.trim() ? (
                <View style={styles.searchEmptyState}>
                    <Ionicons name="search" size={48} color={theme.textSecondary} />
                    <Text style={[styles.searchEmptyText, { color: theme.textSecondary }]}>
                        No conversations found for "{searchQuery}"
                    </Text>
                    <Text style={[styles.searchEmptySubtext, { color: theme.textSecondary }]}>
                        Try searching for a different name or message
                    </Text>
                </View>
            ) : (
                <NoMessages />
            )}
        </View>
    );

    // Search Bar Component
    const renderSearchBar = () => (
        <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
            <View style={[styles.searchBar, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <Ionicons
                    name="search"
                    size={20}
                    color={theme.textSecondary}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search conversations..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                    // clearButtonMode="while-editing"
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                    blurOnSubmit={false}
                    // enablesReturnKeyAutomatically={true}
                    keyboardType="default"
                    textContentType="none"
                    autoComplete="off"
                    spellCheck={false}
                />
                {/* {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                )} */}
            </View>
            {/* {searchQuery.length > 0 && (
                <Text style={[styles.searchResultsText, { color: theme.textSecondary }]}>
                    {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found
                </Text>
            )} */}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
                translucent={false}
            />

            {/* Professional Header */}
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <View style={[styles.headerContent, { borderBottomColor: theme.border }]}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            Messages
                        </Text>
                        {/* {safeTotalUnreadCount > 0 && (
                            <View style={[styles.unreadIndicator, { backgroundColor: theme.tint }]}>
                                <Text style={styles.unreadIndicatorText}>
                                    {safeTotalUnreadCount > 99 ? '99+' : safeTotalUnreadCount}
                                </Text>
                            </View>
                        )} */}
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={[styles.headerButton, { backgroundColor: theme.card, borderWidth: .5, borderColor: theme.border }]}
                            onPress={() => router.push('/contacts')}
                            activeOpacity={0.8}
                        >
                            <FontAwesome name="users" size={20} color={theme.text} />
                        </TouchableOpacity>
                        <View style={{ position: 'absolute', bottom: 0 }}>
                            <FontAwesome5 name="piggy-bank" size={12} color={theme.text} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Conversations List with Proper Refresh */}
            <FlatList
                data={filteredConversations}
                renderItem={renderConversation}
                keyExtractor={(item) => Math.random().toString()}
                style={styles.conversationsList}
                contentContainerStyle={[
                    filteredConversations?.length === 0 ? styles.emptyList : styles.conversationsContent,
                    { paddingTop: 0 } // Remove extra padding
                ]}
                ListHeaderComponent={renderSearchBar}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
                // Prevent overscroll
                bounces={true}
                overScrollMode="never"
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                onPress={() => router.push('/contacts')}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

export default function TabOneScreen() {
    return (
        <ErrorBoundary>
            <ChatScreenContent />
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        borderBottomWidth: 0,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    unreadIndicator: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 20,
        alignItems: 'center',
    },
    unreadIndicatorText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        width: 410
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 45,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '400',
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    conversationsList: {
        flex: 1,
    },
    conversationsContent: {
        paddingBottom: 100,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    searchEmptyState: {
        alignItems: 'center',
        gap: 16,
    },
    searchEmptyText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    searchEmptySubtext: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.7,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
    },
    avatarContainer: {
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    unreadBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        paddingHorizontal: 4,
    },
    unreadCount: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    conversationInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    messageTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    conversationFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        flex: 1,
        fontSize: 14,
        marginRight: 8,
    },
    lastMessageUnread: {
        fontWeight: '600',
    },
    lastMessageRead: {
        fontWeight: '400',
    },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
    },
    searchResultsText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '400',
        textAlign: 'center',
    },
});
