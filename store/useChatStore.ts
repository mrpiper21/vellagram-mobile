import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
// import { useUserStore } from './useUserStore'; // Uncomment and adjust path as needed

export interface Message {
    id: string;
    conversationId?: string;
    senderId: string;
    recipientId: string; // For direct messages
    content: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
    timestamp: number;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'queued';
    acknowledgmentId?: string;
    metadata?: {
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        imageUrl?: string;
        audioUrl?: string;
        videoUrl?: string;
        duration?: number;
        thumbnail?: string;
    };
}

export interface QueuedMessage {
    id: string;
    recipientId: string;
    content: string;
    type: string;
    timestamp: number;
}

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage?: Message;
    lastMessageTime: number;
    unreadCount: number;
    isGroup: boolean;
    groupName?: string;
    groupAvatar?: string;
    groupAdminId?: string; // For group admin (backend: Group.admin)
    createdAt: number;
    updatedAt: number;
}

export interface ChatState {
    conversations: { [conversationId: string]: Conversation };
    messages: { [conversationId: string]: Message[] };
    queuedMessages: QueuedMessage[];
    activeConversationId: string | null;
    isLoading: boolean;
    isSending: boolean;
    addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>, status?: Message['status']) => void;
    addSocketMessage: (socketMessage: { senderId: string; recipientId: string; message: string; type?: string; id?: string }) => void;
    updateMessageStatus: (messageId: string, status: Message['status']) => void;
    updateMessageStatusByContent: (recipientId: string, content: string, status: Message['status']) => void;
    markMessageAsRead: (messageId: string) => void;
    markConversationAsRead: (recipientId: string) => void;
    createConversation: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageTime' | 'unreadCount'>) => void;
    updateConversation: (recipientId: string, updates: Partial<Conversation>) => void;
    deleteConversation: (recipientId: string) => void;
    setActiveConversation: (conversationId: string | null) => void;
    loadMessages: (recipientId: string, messages: Message[]) => void;
    clearMessages: (recipientId: string) => void;
    deleteMessage: (messageId: string) => void;
    getConversation: (recipientId: string) => Conversation | undefined;
    getConversationsList: () => Conversation[];
    getMessages: (recipientId: string) => Message[];
    getUnreadCount: (recipientId: string) => number;
    getTotalUnreadCount: () => number;
    getConversationId: (participant1: string, participant2: string) => string;
    clearAllData: () => void;
    // Queue management functions
    addToQueue: (message: Omit<QueuedMessage, 'id' | 'timestamp'>) => void;
    removeFromQueue: (messageId: string) => void;
    getQueuedMessages: () => QueuedMessage[];
    clearQueue: () => void;
    // Clear all data and reset to initial state
    resetChatStore: () => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: {},
            messages: {},
            queuedMessages: [],
            activeConversationId: null,
            isLoading: false,
            isSending: false,

            addMessage: (message, status = 'sending') => {
                const { recipientId, senderId, content, type = 'text' } = message;
                const conversationId = get().getConversationId(senderId, recipientId);
                const newMessage: Message = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    conversationId,
                    senderId,
                    recipientId,
                    content,
                    type: type as Message['type'],
                    timestamp: Date.now(),
                    status
                };

                set((state) => {
                    const existingMessagesAdd = state.messages[conversationId] || [];
                    const updatedMessages = [...existingMessagesAdd, newMessage];
                    const conversation = state.conversations[conversationId];
                    const updatedConversation: Conversation = conversation ? {
                        ...conversation,
                        lastMessage: newMessage,
                        lastMessageTime: newMessage.timestamp,
                        unreadCount: conversation.participants.includes(message.senderId)
                            ? conversation.unreadCount
                            : conversation.unreadCount + 1,
                        updatedAt: Date.now()
                    } : {
                        id: conversationId,
                        participants: message.recipientId ? [message.senderId, message.recipientId] : [message.senderId],
                        lastMessage: newMessage,
                        lastMessageTime: newMessage.timestamp,
                        unreadCount: 0,
                        isGroup: false,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    return {
                        messages: {
                            ...state.messages,
                            [conversationId]: updatedMessages
                        },
                        conversations: {
                            ...state.conversations,
                            [conversationId]: updatedConversation
                        }
                    };
                });
                setTimeout(() => {
                    get().updateMessageStatus(newMessage.id, 'sent');
                }, 1000);
            },

            addSocketMessage: (socketMessage) => {
                const { senderId, recipientId, message: content, type = 'text', id } = socketMessage;
                const conversationId = get().getConversationId(senderId, recipientId);
                const message: Message = {
                    id: id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    conversationId,
                    senderId,
                    recipientId,
                    content,
                    type: type as Message['type'],
                    timestamp: Date.now(),
                    status: 'delivered'
                };
                set((state) => {
                    const existingMessagesSocket = state.messages[conversationId] || [];
                    if (existingMessagesSocket.some(msg => msg.id === message.id)) {
                        return state;
                    }
                    const updatedMessages = [...existingMessagesSocket, message];
                    const conversation = state.conversations[conversationId];
                    const updatedConversation: Conversation = conversation ? {
                        ...conversation,
                        lastMessage: message,
                        lastMessageTime: message.timestamp,
                        unreadCount: conversation.unreadCount + 1,
                        updatedAt: Date.now()
                    } : {
                        id: conversationId,
                        participants: [senderId, recipientId],
                        lastMessage: message,
                        lastMessageTime: message.timestamp,
                        unreadCount: 1,
                        isGroup: false,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    return {
                        messages: {
                            ...state.messages,
                            [conversationId]: updatedMessages
                        },
                        conversations: {
                            ...state.conversations,
                            [conversationId]: updatedConversation
                        }
                    };
                });
            },

            updateMessageStatus: (messageId, status) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    let messageUpdated = false;

                    Object.keys(updatedMessages).forEach(conversationId => {
                        const messages = updatedMessages[conversationId];
                        const messageIndex = messages.findIndex(msg => msg.id === messageId);
                        if (messageIndex !== -1) {
                            messages[messageIndex] = { ...messages[messageIndex], status };
                            messageUpdated = true;
                        }
                    });

                    if (messageUpdated) {
                        return { messages: updatedMessages };
                    }
                    return state;
                });
            },

            updateMessageStatusByContent: (recipientId, content, status) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    let messageUpdated = false;

                    Object.keys(updatedMessages).forEach(conversationId => {
                        const messages = updatedMessages[conversationId];
                        const messageIndex = messages.findIndex(msg => 
                            msg.recipientId === recipientId && msg.content === content
                        );
                        if (messageIndex !== -1) {
                            messages[messageIndex] = { ...messages[messageIndex], status };
                            messageUpdated = true;
                        }
                    });

                    if (messageUpdated) {
                        return { messages: updatedMessages };
                    }
                    return state;
                });
            },

            markMessageAsRead: (messageId) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    let messageUpdated = false;

                    Object.keys(updatedMessages).forEach(conversationId => {
                        const messages = updatedMessages[conversationId];
                        const messageIndex = messages.findIndex(msg => msg.id === messageId);
                        if (messageIndex !== -1) {
                            messages[messageIndex] = { ...messages[messageIndex], status: 'read' };
                            messageUpdated = true;
                        }
                    });

                    if (messageUpdated) {
                        return { messages: updatedMessages };
                    }
                    return state;
                });
            },

            markConversationAsRead: (recipientId) => {
                set((state) => {
                    const conversation = state.conversations[recipientId];
                    if (!conversation) return state;

                    const updatedConversation = { ...conversation, unreadCount: 0 };
                    const updatedMessages = { ...state.messages };
                    const messages = updatedMessages[recipientId] || [];

                    // Mark all unread messages as read
                    const updatedMessagesList = messages.map(msg => 
                        msg.status !== 'read' ? { ...msg, status: 'read' as const } : msg
                    );

                    return {
                        conversations: {
                            ...state.conversations,
                            [recipientId]: updatedConversation
                        },
                        messages: {
                            ...updatedMessages,
                            [recipientId]: updatedMessagesList
                        }
                    };
                });
            },

            createConversation: (conversation) => {
                const conversationId = get().getConversationId(conversation.participants[0], conversation.participants[1]);
                const newConversation: Conversation = {
                    id: conversationId,
                    participants: conversation.participants,
                    isGroup: conversation.isGroup,
                    groupName: conversation.groupName,
                    groupAvatar: conversation.groupAvatar,
                    lastMessage: undefined,
                    lastMessageTime: 0,
                    unreadCount: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                set((state) => ({
                    conversations: {
                        ...state.conversations,
                        [conversationId]: newConversation
                    }
                }));
            },

            updateConversation: (recipientId, updates) => {
                set((state) => {
                    const conversation = state.conversations[recipientId];
                    if (!conversation) return state;

                    return {
                        conversations: {
                            ...state.conversations,
                            [recipientId]: { ...conversation, ...updates, updatedAt: Date.now() }
                        }
                    };
                });
            },

            deleteConversation: (recipientId) => {
                set((state) => {
                    const { [recipientId]: deletedConversation, ...remainingConversations } = state.conversations;
                    const { [recipientId]: deletedMessages, ...remainingMessages } = state.messages;

                    return {
                        conversations: remainingConversations,
                        messages: remainingMessages
                    };
                });
            },

            setActiveConversation: (conversationId) => {
                set({ activeConversationId: conversationId });
            },

            loadMessages: (recipientId, messages) => {
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [recipientId]: messages
                    }
                }));
            },

            clearMessages: (recipientId) => {
                set((state) => {
                    const { [recipientId]: deletedMessages, ...remainingMessages } = state.messages;
                    return { messages: remainingMessages };
                });
            },

            deleteMessage: (messageId) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    let messageDeleted = false;

                    Object.keys(updatedMessages).forEach(conversationId => {
                        const messages = updatedMessages[conversationId];
                        const messageIndex = messages.findIndex(msg => msg.id === messageId);
                        if (messageIndex !== -1) {
                            messages.splice(messageIndex, 1);
                            messageDeleted = true;
                        }
                    });

                    if (messageDeleted) {
                        return { messages: updatedMessages };
                    }
                    return state;
                });
            },

            getConversation: (recipientId) => {
                return get().conversations[recipientId];
            },

            getConversationsList: () => {
                const conversations = get().conversations;
                return Object.values(conversations).sort((a, b) => 
                    (b.lastMessageTime || b.createdAt) - (a.lastMessageTime || a.createdAt)
                );
            },

            getMessages: (recipientId) => {
                return get().messages[recipientId] || [];
            },

            getUnreadCount: (recipientId) => {
                const conversation = get().conversations[recipientId];
                return conversation ? conversation.unreadCount : 0;
            },

            getTotalUnreadCount: () => {
                const conversations = get().conversations;
                return Object.values(conversations).reduce((total, conversation) => 
                    total + conversation.unreadCount, 0
                );
            },

            getConversationId: (participant1, participant2) => {
                const sortedParticipants = [participant1, participant2].sort();
                return sortedParticipants.join('-');
            },

            clearAllData: () => {
                set({
                    conversations: {},
                    messages: {},
                    queuedMessages: [],
                    activeConversationId: null,
                    isLoading: false,
                    isSending: false
                });
            },

            // Clear all data and reset to initial state
            resetChatStore: () => {
                set({
                    conversations: {},
                    messages: {},
                    queuedMessages: [],
                    activeConversationId: null,
                    isLoading: false,
                    isSending: false
                });
                console.log('🔄 Chat store reset - all conversations and messages cleared');
            },

            // Queue management functions
            addToQueue: (message) => {
                const queuedMessage: QueuedMessage = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    recipientId: message.recipientId,
                    content: message.content,
                    type: message.type,
                    timestamp: Date.now()
                };

                set((state) => ({
                    queuedMessages: [...state.queuedMessages, queuedMessage]
                }));
            },

            removeFromQueue: (messageId) => {
                set((state) => ({
                    queuedMessages: state.queuedMessages.filter(msg => msg.id !== messageId)
                }));
            },

            getQueuedMessages: () => {
                return get().queuedMessages;
            },

            clearQueue: () => {
                set({ queuedMessages: [] });
            },
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                conversations: state.conversations,
                messages: state.messages,
                queuedMessages: state.queuedMessages,
            })
        }
    )
);

export const useConversations = () => useChatStore((state) => state.conversations);
export const useActiveConversation = () => useChatStore((state) => state.activeConversationId);
export const useChatActions = () => useChatStore((state) => ({
    addMessage: state.addMessage,
    addSocketMessage: state.addSocketMessage,
    updateMessageStatus: state.updateMessageStatus,
    updateMessageStatusByContent: state.updateMessageStatusByContent,
    markMessageAsRead: state.markMessageAsRead,
    markConversationAsRead: state.markConversationAsRead,
    createConversation: state.createConversation,
    updateConversation: state.updateConversation,
    deleteConversation: state.deleteConversation,
    setActiveConversation: state.setActiveConversation,
    loadMessages: state.loadMessages,
    clearMessages: state.clearMessages,
    deleteMessage: state.deleteMessage,
    clearAllData: state.clearAllData,
}));
export const useConversationMessages = (conversationId: string) =>
    useChatStore(useShallow(state => state.messages[conversationId] || []));
export const useConversation = (conversationId: string) =>
    useChatStore(useShallow(state => (conversationId ? state.conversations[conversationId] : null)));
export const useUnreadCount = (recipientId: string) =>
    useChatStore(state => (recipientId ? state.conversations[recipientId]?.unreadCount || 0 : 0));
export const useTotalUnreadCount = () =>
    useChatStore(state => state.getTotalUnreadCount()); 