import { useUserInactivity } from "@/context/UserInactivityContext";
import { ruseSocketContext } from '@/context/useSockectContext';
import { getOtherParticipantDetails } from '@/helpers/conversationUtils';
import { useSocketChat } from '@/hooks/useSocketChat';
import { useChatStore, useConversation, useConversationMessages } from '@/store/useChatStore';
import { useContactStore } from '@/store/useContactStore';
import { User } from '@/types/conversation';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, FlatList } from "react-native";

interface UseConversationLogicProps {
    conversationId: string;
    recipientId: string;
    user: User | null;
}

export const useConversationLogic = ({ conversationId, recipientId, user }: UseConversationLogicProps) => {
    const messages = useConversationMessages(conversationId);
    const conversation = useConversation(conversationId);
    const { contacts } = useContactStore();
    const { allUsers } = useUserInactivity();
    const { socket } = ruseSocketContext();

    const { addMessage, markConversationAsRead, setActiveConversation, createConversation } = useChatStore((state) => state);
    const { sendMessage: sendSocketMessage, isConnected } = useSocketChat();

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const menuAnimation = useRef(new Animated.Value(0)).current;
    const detailsAnimation = useRef(new Animated.Value(0)).current;

    const participantDetails = useMemo(() => {
        if (conversation?.isGroup) {
            return {
                name: conversation.groupName || 'Group',
                profile: conversation.groupAvatar || 'G',
                id: conversation.id
            };
        }

        const details = getOtherParticipantDetails(
            recipientId,
            user?.id,
            contacts,
            allUsers as any,
        );

        return details;
    }, [conversation, recipientId, user?.id, contacts, allUsers]);

    // Effects
    useEffect(() => {
        if (!conversationId) return;
        setActiveConversation(conversationId);
        markConversationAsRead(conversationId);
        // Emit read receipt to server
        if (socket && user?.id) {
            socket.emit('message_read', { conversationId, userId: user.id });
        }
        return () => setActiveConversation(null);
    }, [conversationId, setActiveConversation, markConversationAsRead, socket, user?.id]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const toggleMenu = () => {
        const toValue = showMenu ? 0 : 1;
        const newShowMenu = !showMenu;
        setShowMenu(newShowMenu);
        Animated.spring(menuAnimation, {
            toValue,
            useNativeDriver: true,
            tension: 65,
            friction: 11
        }).start();
    };

    const toggleDetails = () => {
        const toValue = showDetails ? 0 : 1;
        setShowDetails(!showDetails);
        Animated.spring(detailsAnimation, {
            toValue,
            useNativeDriver: true,
            tension: 65,
            friction: 11
        }).start();
    };

    const handleMenuOption = (optionId: string) => {
        toggleMenu();
        switch (optionId) {
            case 'details':
                toggleDetails();
                break;
            case 'payment':
                break;
            case 'leave':
                // Handle leave group
                break;
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user?.id || !recipientId || !conversationId) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setIsSending(true);
        try {
            if (!conversation) {
                createConversation({
                    participants: [user.id, recipientId],
                    isGroup: false,
                });
            }

            const messageStatus = isConnected ? 'sending' : 'queued';
            addMessage({
                recipientId,
                senderId: user.id,
                content: newMessage.trim(),
                type: 'text'
            }, messageStatus);

            sendSocketMessage(recipientId, newMessage.trim(), 'text');

            setNewMessage('');

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
        } catch (error) {
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleChatPress = (memberId: string) => {
        // Handle chat press for group members
    };

    return {
        messages,
        conversation,
        participantDetails,
        newMessage,
        setNewMessage,
        isSending,
        isConnected,
        flatListRef,
        showMenu,
        showDetails,
        menuAnimation,
        detailsAnimation,
        toggleMenu,
        toggleDetails,
        handleMenuOption,
        handleSendMessage,
        handleChatPress,
    };
}; 