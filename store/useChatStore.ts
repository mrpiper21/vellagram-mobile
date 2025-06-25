import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
    timestamp: number;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
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

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage?: Message;
    lastMessageTime: number;
    unreadCount: number;
    isGroup: boolean;
    groupName?: string;
    groupAvatar?: string;
    createdAt: number;
    updatedAt: number;
}

export interface ChatState {
    // State - Using hash maps for efficient lookups
    conversations: { [conversationId: string]: Conversation };
    messages: { [conversationId: string]: Message[] };
    activeConversationId: string | null;
    isLoading: boolean;
    isSending: boolean;
    
    // Actions
    addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
    addSocketMessage: (socketMessage: { senderId: string; recipientId: string; message: string; type?: string }) => void;
    updateMessageStatus: (messageId: string, status: Message['status']) => void;
    markMessageAsRead: (messageId: string) => void;
    markConversationAsRead: (conversationId: string) => void;
    
    // Conversation actions
    createConversation: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageTime' | 'unreadCount'>) => void;
    updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
    deleteConversation: (conversationId: string) => void;
    setActiveConversation: (conversationId: string | null) => void;
    
    // Message actions
    loadMessages: (conversationId: string, messages: Message[]) => void;
    clearMessages: (conversationId: string) => void;
    deleteMessage: (messageId: string) => void;
    
    // Utility actions
    getConversation: (conversationId: string) => Conversation | undefined;
    getConversationsList: () => Conversation[];
    getMessages: (conversationId: string) => Message[];
    getUnreadCount: (conversationId: string) => number;
    getTotalUnreadCount: () => number;
    getConversationId: (participant1: string, participant2: string) => string;
    
    // Clear all data
    clearAllData: () => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: {},
            messages: {},
            activeConversationId: null,
            isLoading: false,
            isSending: false,

            addMessage: (messageData) => {
                const message: Message = {
                    ...messageData,
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    status: 'sending'
                };

                set((state) => {
                    const conversationId = message.conversationId;
                    const existingMessages = state.messages[conversationId] || [];
                    const updatedMessages = [...existingMessages, message];
                    
                    // Update conversation
                    const conversation = state.conversations[conversationId];
                    const updatedConversation: Conversation = conversation ? {
                        ...conversation,
                        lastMessage: message,
                        lastMessageTime: message.timestamp,
                        unreadCount: conversation.participants.includes(message.senderId) 
                            ? conversation.unreadCount 
                            : conversation.unreadCount + 1,
                        updatedAt: Date.now()
                    } : {
                        id: conversationId,
                        participants: [message.senderId],
                        lastMessage: message,
                        lastMessageTime: message.timestamp,
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

                // Simulate message sending and update status
                setTimeout(() => {
                    get().updateMessageStatus(message.id, 'sent');
                }, 1000);
            },

            addSocketMessage: (socketMessage) => {
                const { senderId, recipientId, message: content, type = 'text' } = socketMessage;
                
                // Get current user ID from user store
                const currentUserId = useUserStore.getState().user?.id;
                
                // Don't add our own messages from socket
                if (senderId === currentUserId) return;

                const conversationId = get().getConversationId(senderId, recipientId);
                
                const message: Message = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    conversationId,
                    senderId,
                    content,
                    type: type as Message['type'],
                    timestamp: Date.now(),
                    status: 'delivered'
                };

                set((state) => {
                    const existingMessages = state.messages[conversationId] || [];
                    const updatedMessages = [...existingMessages, message];
                    
                    // Update or create conversation
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
                    
                    Object.keys(updatedMessages).forEach(conversationId => {
                        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
                            msg.id === messageId ? { ...msg, status } : msg
                        );
                    });

                    return { messages: updatedMessages };
                });
            },

            markMessageAsRead: (messageId) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    
                    Object.keys(updatedMessages).forEach(conversationId => {
                        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
                            msg.id === messageId ? { ...msg, status: 'read' } : msg
                        );
                    });

                    return { messages: updatedMessages };
                });
            },

            markConversationAsRead: (conversationId) => {
                set((state) => {
                    const conversation = state.conversations[conversationId];
                    if (!conversation) return state;

                    const updatedConversations = {
                        ...state.conversations,
                        [conversationId]: {
                            ...conversation,
                            unreadCount: 0
                        }
                    };

                    const updatedMessages = { ...state.messages };
                    if (updatedMessages[conversationId]) {
                        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg => ({
                            ...msg,
                            status: 'read'
                        }));
                    }

                    return {
                        conversations: updatedConversations,
                        messages: updatedMessages
                    };
                });
            },

            createConversation: (conversationData) => {
                const conversation: Conversation = {
                    ...conversationData,
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    lastMessageTime: Date.now(),
                    unreadCount: 0,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                set((state) => ({
                    conversations: {
                        ...state.conversations,
                        [conversation.id]: conversation
                    },
                    messages: {
                        ...state.messages,
                        [conversation.id]: []
                    }
                }));
            },

            updateConversation: (conversationId, updates) => {
                set((state) => {
                    const conversation = state.conversations[conversationId];
                    if (!conversation) return state;

                    return {
                        conversations: {
                            ...state.conversations,
                            [conversationId]: {
                                ...conversation,
                                ...updates,
                                updatedAt: Date.now()
                            }
                        }
                    };
                });
            },

            deleteConversation: (conversationId) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    delete updatedMessages[conversationId];

                    const updatedConversations = { ...state.conversations };
                    delete updatedConversations[conversationId];

                    return {
                        conversations: updatedConversations,
                        messages: updatedMessages,
                        activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
                    };
                });
            },

            setActiveConversation: (conversationId) => {
                set({ activeConversationId: conversationId });
            },

            loadMessages: (conversationId, messages) => {
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [conversationId]: messages
                    }
                }));
            },

            clearMessages: (conversationId) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    delete updatedMessages[conversationId];

                    return { messages: updatedMessages };
                });
            },

            deleteMessage: (messageId) => {
                set((state) => {
                    const updatedMessages = { ...state.messages };
                    
                    Object.keys(updatedMessages).forEach(conversationId => {
                        updatedMessages[conversationId] = updatedMessages[conversationId].filter(
                            msg => msg.id !== messageId
                        );
                    });

                    return { messages: updatedMessages };
                });
            },

            getConversation: (conversationId) => {
                if (!conversationId) return undefined;
                const conversation = get().conversations[conversationId];
                return conversation && typeof conversation === 'object' ? conversation : undefined;
            },

            getConversationsList: () => {
                const conversations = get().conversations;
                return Object.values(conversations)
                    .filter(conv => conv && typeof conv === 'object') // Filter out invalid conversations
                    .sort((a, b) => {
                        // Handle cases where lastMessageTime might be undefined
                        const timeA = a?.lastMessageTime || a?.createdAt || 0;
                        const timeB = b?.lastMessageTime || b?.createdAt || 0;
                        return timeB - timeA; // Sort by most recent first
                    });
            },

            getMessages: (conversationId) => {
                if (!conversationId) return [];
                const messages = get().messages[conversationId];
                return Array.isArray(messages) ? messages : [];
            },

            getUnreadCount: (conversationId) => {
                if (!conversationId) return 0;
                const conversation = get().conversations[conversationId];
                return conversation?.unreadCount || 0;
            },

            getTotalUnreadCount: () => {
                const conversations = get().conversations;
                return Object.values(conversations)
                    .filter(conv => conv && typeof conv === 'object')
                    .reduce((total, conv) => total + (conv?.unreadCount || 0), 0);
            },

            getConversationId: (participant1: string, participant2: string) => {
                // Create a consistent conversation ID regardless of sender/recipient order
                const sortedParticipants = [participant1, participant2].sort();
                return `conv-${sortedParticipants[0]}-${sortedParticipants[1]}`;
            },

            clearAllData: () => {
                set({
                    conversations: {},
                    messages: {},
                    activeConversationId: null,
                    isLoading: false,
                    isSending: false
                });
            }
        }),
        {
            name: 'chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                conversations: state.conversations,
                messages: state.messages,
                activeConversationId: state.activeConversationId,
            }),
        }
    )
);

export const useConversations = () => useChatStore((state) => {
    const conversations = state.conversations;
    // Return the conversations object directly, let the component handle the transformation
    return conversations;
});

export const useActiveConversation = () => useChatStore((state) => state.activeConversationId);

export const useChatActions = () => useChatStore((state) => ({
    addMessage: state.addMessage,
    addSocketMessage: state.addSocketMessage,
    updateMessageStatus: state.updateMessageStatus,
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
    useChatStore((state) => {
        if (!conversationId) return [];
        const messages = state.messages[conversationId];
        return Array.isArray(messages) ? messages : [];
    });

export const useConversation = (conversationId: string) => 
    useChatStore((state) => {
        if (!conversationId) return undefined;
        const conversation = state.conversations[conversationId];
        return conversation && typeof conversation === 'object' ? conversation : undefined;
    });

export const useUnreadCount = (conversationId: string) => 
    useChatStore((state) => {
        if (!conversationId) return 0;
        const conversation = state.conversations[conversationId];
        return conversation?.unreadCount || 0;
    });

export const useTotalUnreadCount = () => 
    useChatStore((state) => state.getTotalUnreadCount()); 