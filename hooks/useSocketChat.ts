import { ruseSocketContext } from '@/context/useSockectContext';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import { useEffect, useRef } from 'react';

export const useSocketChat = () => {
    const { socket, isConnected } = ruseSocketContext();
    const { addSocketMessage, addToQueue, removeFromQueue, getQueuedMessages, updateMessageStatus, updateMessageStatusByContent } = useChatStore();
    const { user } = useUserStore();
    const isInitialized = useRef(false);

    // Function to send queued messages when coming back online
    const sendQueuedMessages = () => {
        if (!socket || !user?.id || !isConnected) return;

        const queuedMessages = getQueuedMessages();
        console.log('📤 Sending queued messages:', queuedMessages.length);

        queuedMessages.forEach(queuedMsg => {
            const messageData = {
                recipientId: queuedMsg.recipientId,
                message: queuedMsg.content,
                type: queuedMsg.type
            };

            console.log('📤 Sending queued message:', messageData);
            socket.emit('message', messageData);
            
            // Update message status to 'sent' when sent from queue
            console.log('🔄 Updating queued message status to sent for:', { recipientId: queuedMsg.recipientId, content: queuedMsg.content });
            updateMessageStatusByContent(queuedMsg.recipientId, queuedMsg.content, 'sent');
            removeFromQueue(queuedMsg.id);
        });
    };

    // Send queued messages when socket connects
    useEffect(() => {
        if (isConnected && socket && user?.id) {
            console.log('🔌 Socket connected, sending queued messages');
            sendQueuedMessages();
        }
    }, [isConnected, socket, user?.id]);

    useEffect(() => {
        if (!socket || !user?.id || isInitialized.current) return;

        console.log('🔌 Initializing socket chat listeners for user:', user.id);
        isInitialized.current = true;

        // Register user with socket server
        socket.emit('register', { userId: user.id });

        // Listen for incoming messages (server format)
        const handleIncomingMessage = (data: {
            id: string;
            content: string;
            type: string;
            senderId: string;
            timestamp: Date;
            sessionId?: string;
            acknowledgmentId?: string;
        }) => {
            console.log('📨 Received socket message:', data);
            
            if (!user?.id) return;
            
            // Convert server format to our format
            const socketMessage = {
                senderId: data.senderId,
                recipientId: user.id, // Current user is the recipient
                message: data.content,
                type: data.type
            };
            
            addSocketMessage(socketMessage);
            
            // Send delivery confirmation to server
            if (data.acknowledgmentId) {
                socket.emit('message_delivered', {
                    messageId: data.id,
                    acknowledgmentId: data.acknowledgmentId
                });
            }
        };

        // Listen for pending messages when user connects
        const handlePendingMessages = (data: {
            sessionId: string;
            otherParticipant: {
                id: string;
                firstName: string;
                lastName: string;
                profilePicture: string | null;
            };
            messages: Array<{
                id: string;
                content: string;
                type: string;
                timestamp: Date;
                sender: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    profilePicture: string | null;
                };
            }>;
        }) => {
            console.log('📨 Received pending messages:', data);
            
            if (!user?.id) return;
            const currentUserId = user.id; // Ensure it's a string
            
            // Add all pending messages to the store
            data.messages.forEach(msg => {
                const socketMessage = {
                    senderId: msg.sender.id,
                    recipientId: currentUserId,
                    message: msg.content,
                    type: msg.type
                };
                addSocketMessage(socketMessage);
            });
        };

        // Listen for delivery status updates from server
        const handleDeliveryStatus = (data: {
            messageId: string;
            status: 'delivered' | 'read' | 'failed';
            timestamp: Date;
        }) => {
            console.log('📨 Delivery status update:', data);
            updateMessageStatus(data.messageId, data.status);
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

        // Set up event listeners
        socket.on('message', handleIncomingMessage);
        socket.on('pending_messages', handlePendingMessages);
        socket.on('delivery_status', handleDeliveryStatus);
        socket.on('typing-start', handleTypingStart);
        socket.on('typing-stop', handleTypingStop);

        return () => {
            console.log('🔌 Cleaning up socket chat listeners');
            socket.off('message', handleIncomingMessage);
            socket.off('pending_messages', handlePendingMessages);
            socket.off('delivery_status', handleDeliveryStatus);
            socket.off('typing-start', handleTypingStart);
            socket.off('typing-stop', handleTypingStop);
            isInitialized.current = false;
        };
    }, [socket, user?.id, addSocketMessage]);

    // Return functions for sending messages
    const sendMessage = (recipientId: string, message: string, type: string = 'text') => {
        if (!user?.id) {
            console.warn('Cannot send message: user not available');
            return;
        }

        const messageData = {
            recipientId,
            message,
            type
        };

        // If socket is connected, send immediately
        if (socket && isConnected) {
            console.log('📤 Sending message immediately:', messageData);
            socket.emit('message', messageData);
            // Update status to 'sent' when sent immediately
            console.log('🔄 Updating message status to sent for:', { recipientId, message });
            updateMessageStatusByContent(recipientId, message, 'sent');
        } else {
            // If socket is not connected, add to queue
            console.log('📬 Socket offline, adding message to queue:', messageData);
            addToQueue({
                recipientId,
                content: message,
                type
            });
        }
    };

    const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
        if (!socket || !user?.id || !isConnected) return;

        const event = isTyping ? 'typing-start' : 'typing-stop';
        socket.emit(event, { conversationId, userId: user.id });
    };

    const markMessageAsRead = (messageId: string, conversationId: string) => {
        if (!socket || !user?.id || !isConnected) return;

        console.log('👁️ Marking message as read:', messageId);
        socket.emit('message_read', { messageId, acknowledgmentId: `${messageId}-${Date.now()}` });
    };

    return {
        sendMessage,
        sendTypingIndicator,
        markMessageAsRead,
        isConnected: !!socket?.connected && isConnected,
        sendQueuedMessages
    };
}; 