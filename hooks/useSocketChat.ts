import { useGroupStore } from '@/app/store/useGroupStore';
import { useUserInactivity } from '@/context/UserInactivityContext';
import { ruseSocketContext } from '@/context/useSockectContext';
import { getOtherParticipantDetails } from '@/helpers/conversationUtils';
import { useChatStore } from '@/store/useChatStore';
import { useContactStore } from '@/store/useContactStore';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';
import { useMessageNotifications } from './useMessageNotifications';
import { useNetworkStatus } from './useNetworkStatus';

export const useMarkConversationAsRead = (conversationId: string) => {
    const { messages } = useChatStore();
    const { user } = useUserStore();
    const { socket, isConnected } = ruseSocketContext();
    
    useEffect(() => {
        if (!socket || !user?.id || !isConnected) return;
        const unreadMessages = (messages[conversationId] || []).filter(msg => msg.status !== 'read' && msg.recipientId === user.id);
        if (unreadMessages.length > 0) {
            unreadMessages.forEach(msg => {
                socket.emit('message_read', { messageId: msg.id, acknowledgmentId: `${msg.id}-${Date.now()}` });
            });
        }
    }, [conversationId, messages, user?.id, socket, isConnected]);
};

export const useSocketChat = () => {
    const { socket, isConnected } = ruseSocketContext();
    const { addSocketMessage, addToQueue, removeFromQueue, queuedMessages, updateMessageStatus, updateMessageStatusByContent } = useChatStore();
    const { user } = useUserStore();
    const { sendMessageNotification } = useMessageNotifications();
    const { allUsers } = useUserInactivity();
    const {contacts} = useContactStore()
    const isDeviceOnline = useNetworkStatus();

    const sendQueuedMessages = () => {
        if (!socket || !user?.id || !isConnected) return;

        queuedMessages.forEach(queuedMsg => {
            const messageData = {
                recipientId: queuedMsg.recipientId,
                message: queuedMsg.content,
                type: queuedMsg.type
            };

            console.log('📤 Sending queued message:', messageData);
            socket.emit('message', messageData);
            console.log('🔄 Updating queued message status to sent for:', { recipientId: queuedMsg.recipientId, content: queuedMsg.content });
            updateMessageStatusByContent(queuedMsg.recipientId, queuedMsg.content, 'delivered');
            removeFromQueue(queuedMsg.localId);
        });
    };

    useEffect(() => {
        if (isConnected && socket && user?.id) {
            sendQueuedMessages();
        }
    }, [isConnected, socket, user?.id]);

    useEffect(() => {
        if (isDeviceOnline && isConnected && socket && user?.id) {
            sendQueuedMessages();
        }
    }, [isDeviceOnline, isConnected, socket, user?.id]);

    useEffect(() => {
        if (!socket || !user?.id) return;


        socket.emit('register', { userId: user.id });

        const handleIncomingMessage = (data: {
            id: string;
            content: string;
            type: string;
            senderName: string;
            senderId: string;
            timestamp: Date;
            sessionId?: string;
            acknowledgmentId?: string;
        }) => {
            console.log('📨 Received socket message:', data);
            
            console.log("All contacts:", useContactStore.getState().contacts);
            console.log("Looking for senderId:", data.senderId);
            const participantDetails = getOtherParticipantDetails(
                data.senderId,
                user.id,
                contacts,
                allUsers || []
            );
           
            if (!user?.id) return;
            const socketMessage = {
                senderId: data.senderId,
                recipientId: user.id,
                message: data.content,
                type: data.type,
                id: data.id
            };
            addSocketMessage(socketMessage);
            sendMessageNotification({
                senderId: data.senderId,
                senderName: participantDetails.name,
                content: data.content,
                messageId: data.id
            })
            // Always emit message_delivered for real-time delivery status
            socket.emit('message_delivered', {
                messageId: data.id,
                acknowledgmentId: data.acknowledgmentId || `${data.id}-${Date.now()}`
            });
        };

        // Handle incoming group messages efficiently
        const handleGroupIncomingMessages = (data: {
            id: string;
            groupId: string;
            content: string;
            type: string;
            sender: {
                id: string;
                firstName: string;
                lastName: string;
                profilePicture?: string;
            };
            timestamp: string;
            acknowledgmentId?: string;
        }) => {
            console.log('📨 [Socket] Received group message:', data);
            // Add the message to the group store
            useGroupStore.getState().addSocketMessage(data.groupId, {
                id: data.id,
                groupId: data.groupId,
                content: data.content,
                type: data.type,
                senderId: data.sender.id,
                sender: data.sender,
                timestamp: data.timestamp,
                read: false,
                deliveryStatus: 'delivered',
            });
            // Optionally, trigger a notification here if needed
        };

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
            const currentUserId = user.id;
            data.messages.forEach(msg => {
                const socketMessage = {
                    senderId: msg.sender.id,
                    recipientId: currentUserId,
                    message: msg.content,
                    type: msg.type,
                    id: msg.id
                };
                addSocketMessage(socketMessage);
                // Emit delivery for each pending message
                socket.emit('message_delivered', {
                    messageId: msg.id,
                    acknowledgmentId: `${msg.id}-${Date.now()}`
                });
            });
        };

        // Listen for delivery status updates from server
        const handleDeliveryStatus = (data: {
            messageId: string;
            status: 'delivered' | 'read' | 'pending';
            timestamp: Date;
        }) => {
            console.log('📨 Delivery status update:', data);
            updateMessageStatus(data.messageId, data.status);
        };

        // Listen for typing indicators
        const handleTypingStart = (data: { conversationId: string; userId: string }) => {
            console.log('⌨️ User started typing:', data);
        };
        const handleTypingStop = (data: { conversationId: string; userId: string }) => {
            console.log('⏹️ User stopped typing:', data);
        };

        // Listen for read receipts
        const handleMessageRead = (data: { conversationId: string; messageIds: string[]; userId: string }) => {
            console.log('👁️ Message(s) read:', data);
            data.messageIds.forEach(messageId => {
                updateMessageStatus(messageId, 'read');
            });
        };

        // Set up event listeners
        socket.on('message', handleIncomingMessage);
        socket.on('group_message', handleGroupIncomingMessages);
        socket.on('pending_messages', handlePendingMessages);
        socket.on('delivery_status', handleDeliveryStatus);
        socket.on('typing-start', handleTypingStart);
        socket.on('typing-stop', handleTypingStop);
        socket.on('message_read', handleMessageRead);

        return () => {
            console.log('🔌 Cleaning up socket chat listeners');
            socket.off('message', handleIncomingMessage);
            socket.off('group_message', handleGroupIncomingMessages);
            socket.off('pending_messages', handlePendingMessages);
            socket.off('delivery_status', handleDeliveryStatus);
            socket.off('typing-start', handleTypingStart);
            socket.off('typing-stop', handleTypingStop);
            socket.off('message_read', handleMessageRead);
        };
    }, [socket, user?.id, addSocketMessage, updateMessageStatus]);

    // Return functions for sending messages
    const sendMessage = (recipientId: string, message: string, type: string = 'text') => {
        if (!user?.id) {
            console.warn('Cannot send message: user not available');
            return;
        }

        const rec = contacts.find((contact)=> contact.id === recipientId)

        const messageData = {
            recipientId,
            senderName: rec?.name,
            message,
            type
        };

        // If socket is connected, send immediately
        if (socket && isConnected) {
            console.log('📤 Sending message immediately:', messageData);
            socket.emit('message', messageData);
            // Update status to 'sent' when sent immediately
            console.log('🔄 Updating message status to sent for:', { recipientId, message });
            updateMessageStatusByContent(recipientId, message, "delivered");
        } else {
            // If socket is not connected, add to queue
            console.log('📬 Socket offline, adding message to queue:', messageData);
            addToQueue({
                recipientId,
                content: message,
                type: type as 'text' | 'image' | 'file' | 'audio' | 'video'
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