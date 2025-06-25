import { useSocketContext } from '@/context/useSockectContext';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { useEffect, useRef } from 'react';

export const useSocketChat = () => {
    const { socket } = useSocketContext();
    const { addSocketMessage } = useChatStore();
    const { user } = useUserStore();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!socket || !user?.id || isInitialized.current) return;

        console.log('🔌 Initializing socket chat listeners for user:', user.id);
        isInitialized.current = true;

        // Listen for incoming messages
        const handleIncomingMessage = (data: {
            senderId: string;
            recipientId: string;
            message: string;
            type?: string;
        }) => {
            console.log('📨 Received socket message:', data);
            addSocketMessage(data);
        };

        // Listen for message delivery acknowledgments
        const handleMessageDelivered = (data: { messageId: string; conversationId: string }) => {
            console.log('✅ Message delivered:', data);
            useChatStore.getState().updateMessageStatus(data.messageId, 'delivered');
        };

        // Listen for message read acknowledgments
        const handleMessageRead = (data: { messageId: string; conversationId: string }) => {
            console.log('👁️ Message read:', data);
            useChatStore.getState().updateMessageStatus(data.messageId, 'read');
        };

        // Listen for typing indicators
        const handleTypingStart = (data: { conversationId: string; userId: string }) => {
            console.log('⌨️ User started typing:', data);
            // You can implement typing indicators here
        };

        const handleTypingStop = (data: { conversationId: string; userId: string }) => {
            console.log('⏹️ User stopped typing:', data);
            // You can implement typing indicators here
        };

        // Join user's personal room for receiving messages
        socket.emit('join-room', { userId: user.id });

        // Set up event listeners
        socket.on('message', handleIncomingMessage);
        socket.on('message-delivered', handleMessageDelivered);
        socket.on('message-read', handleMessageRead);
        socket.on('typing-start', handleTypingStart);
        socket.on('typing-stop', handleTypingStop);

        return () => {
            console.log('🔌 Cleaning up socket chat listeners');
            socket.off('message', handleIncomingMessage);
            socket.off('message-delivered', handleMessageDelivered);
            socket.off('message-read', handleMessageRead);
            socket.off('typing-start', handleTypingStart);
            socket.off('typing-stop', handleTypingStop);
            socket.emit('leave-room', { userId: user.id });
            isInitialized.current = false;
        };
    }, [socket, user?.id, addSocketMessage]);

    // Return functions for sending messages
    const sendMessage = (recipientId: string, message: string, type: string = 'text') => {
        if (!socket || !user?.id) {
            console.warn('Cannot send message: socket or user not available');
            return;
        }

        const messageData = {
            senderId: user.id,
            recipientId,
            message,
            type
        };

        console.log('📤 Sending message:', messageData);
        socket.emit('send-message', messageData);
    };

    const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
        if (!socket || !user?.id) return;

        const event = isTyping ? 'typing-start' : 'typing-stop';
        socket.emit(event, { conversationId, userId: user.id });
    };

    const markMessageAsRead = (messageId: string, conversationId: string) => {
        if (!socket || !user?.id) return;

        console.log('👁️ Marking message as read:', messageId);
        socket.emit('mark-message-read', { messageId, conversationId, userId: user.id });
    };

    return {
        sendMessage,
        sendTypingIndicator,
        markMessageAsRead,
        isConnected: !!socket?.connected
    };
}; 