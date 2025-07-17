import { notificationService } from '@/services/notification.service';
import { useEffect } from 'react';

export const useMessageNotifications = () => {
    // Initialize notification service
    useEffect(() => {
        notificationService.initialize();
        
        return () => {
            notificationService.cleanup();
        };
    }, []);


    const sendMessageNotification = async (data: {
        senderId: string;
        senderName: string;
        content: string;
        messageId: string;
    }) => {
        try {
            const settings = await notificationService.getNotificationSettings();
            if (!settings.enabled) return;

            const senderName = data.senderName
            const messagePreview = settings.messagePreview ? data.content : 'New message';

            const conversationId = data.senderId;

            await notificationService.sendLocalNotification(
                senderName,
                messagePreview,
                {
                    conversationId,
                    senderId: data.senderId,
                    messageId: data.messageId,
                    type: 'message'
                }
            );
        } catch (error) {
            console.error('❌ Error sending message notification:', error);
        }
    };

    // Function to send notification for pending messages
    const sendPendingMessagesNotification = async (data: {
        sessionId: string;
        otherParticipant: {
            id: string;
            firstName?: string;
        };
        messages: any[];
    }) => {
        try {
            const settings = await notificationService.getNotificationSettings();
            if (!settings.enabled) return;

            const participantName = data.otherParticipant?.firstName || 'Someone';
            const messageCount = data.messages.length;
            
            await notificationService.sendLocalNotification(
                participantName,
                `You have ${messageCount} unread message${messageCount > 1 ? 's' : ''}`,
                {
                    conversationId: data.sessionId,
                    senderId: data.otherParticipant?.id,
                    type: 'pending_messages'
                }
            );
        } catch (error) {
            console.error('❌ Error sending pending messages notification:', error);
        }
    };

    return {
        sendMessageNotification,
        sendPendingMessagesNotification,
    };
}; 