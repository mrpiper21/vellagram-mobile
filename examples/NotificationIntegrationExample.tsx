import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import { useSocketChat } from '@/hooks/useSocketChat';
import React from 'react';

// Example of how to integrate notifications back into the messaging flow
export const NotificationIntegrationExample: React.FC = () => {
    const { sendMessageNotification, sendPendingMessagesNotification } = useMessageNotifications();
    const { sendMessage, isConnected } = useSocketChat();

    // Example: Send notification when a new message is received
    const handleNewMessage = (messageData: any) => {
        // Your existing message handling logic here
        console.log('New message received:', messageData);

        // Send notification for the new message
        sendMessageNotification({
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            content: messageData.content,
            messageId: messageData.id,
        });
    };

    // Example: Send notification for pending messages
    const handlePendingMessages = (pendingData: any) => {
        // Your existing pending messages handling logic here
        console.log('Pending messages received:', pendingData);

        // Send notification for pending messages
        sendPendingMessagesNotification({
            sessionId: pendingData.sessionId,
            otherParticipant: pendingData.otherParticipant,
            messages: pendingData.messages,
        });
    };

    // Example: Send a message with notification
    const sendMessageWithNotification = async (recipientId: string, message: string) => {
        // Send the message normally
        sendMessage(recipientId, message, 'text');

        // You could also send a notification here if needed
        // (though typically notifications are sent when receiving messages, not sending them)
    };

    return (
        <div>
            {/* Your UI components here */}
            <p>Notification integration example</p>
            <p>Socket connected: {isConnected ? 'Yes' : 'No'}</p>
        </div>
    );
};

// Example of how to integrate with the socket hook
export const useSocketWithNotifications = () => {
    const { sendMessageNotification, sendPendingMessagesNotification } = useMessageNotifications();
    const { sendMessage, isConnected } = useSocketChat();

    // Enhanced socket hook with notifications
    const enhancedSendMessage = (recipientId: string, message: string, type: string = 'text') => {
        // Send message normally
        sendMessage(recipientId, message, type);
    };

    const handleIncomingMessage = (data: any) => {
        // Your existing message handling logic here

        // Send notification for incoming message
        sendMessageNotification({
            senderId: data.senderId,
            senderName: data.senderName,
            content: data.content,
            messageId: data.id,
        });
    };

    const handlePendingMessages = (data: any) => {
        // Your existing pending messages handling logic here

        // Send notification for pending messages
        sendPendingMessagesNotification({
            sessionId: data.sessionId,
            otherParticipant: data.otherParticipant,
            messages: data.messages,
        });
    };

    return {
        sendMessage: enhancedSendMessage,
        handleIncomingMessage,
        handlePendingMessages,
        isConnected,
    };
}; 