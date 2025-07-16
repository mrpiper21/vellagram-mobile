import { LoadingScreen } from "@/components/LoadingScreen";
import { useAppTheme } from "@/context/ThemeContext";
import { useUserInactivity } from "@/context/UserInactivityContext";
import { getOtherParticipantDetails } from "@/helpers/conversationUtils";
import { useConversationLogic } from '@/hooks/useConversationLogic';
import { useChatStore } from '@/store/useChatStore';
import { useContactById, useContactStore } from '@/store/useContactStore';
import { useUserStore } from '@/store/useUserStore';
import { User } from '@/types/conversation';
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { BackgroundPattern } from "./components/BackgroundPattern";
import { GroupDetailsSheet } from "./components/GroupDetailsSheet";
import { Header } from "./components/Header";
import { MenuDropdown } from "./components/MenuDropdown";
import { MessageInput } from "./components/MessageInput";
import { MessagesList } from "./components/MessagesList";

export default function ConversationScreen() {
    const { id: recipientId } = useLocalSearchParams<{ id: string }>();
    const theme = useAppTheme();
    const { user } = useUserStore((state) => state);
    const getConversationId = useChatStore(state => state.getConversationId);

    const conversationId = useMemo(
        () => (user?.id ? getConversationId(user.id, recipientId) : null),
        [user?.id, recipientId]
    );

    if (!conversationId) {
        return <LoadingScreen theme={theme} />;
    }

    return (
        <ConversationView
            theme={theme}
            conversationId={conversationId}
            recipientId={recipientId}
            user={user as User | null}
        />
    );
}

interface ConversationViewProps {
    theme: any;
    conversationId: string;
    recipientId: string;
    user: User | null;
}

const ConversationView = ({ theme, conversationId, recipientId, user }: ConversationViewProps) => {
    const { contacts } = useContactStore();
    const { allUsers } = useUserInactivity();
    const recipientContact = useContactById(recipientId);

    const {
        messages,
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
    } = useConversationLogic({ conversationId, recipientId, user });

    const conversationUser = getOtherParticipantDetails(
        recipientId,
        user?.id,
        contacts,
        allUsers || []
    );
console.log("direct chat ------ ")
    return (
        <View style={{ flex: 1 }}>
            <BackgroundPattern theme={theme} />
            <Header
                groupName={conversationUser.name}
                groupAvatar={conversationUser.name?.charAt(0)?.toUpperCase() || 'U'}
                onMenuPress={toggleMenu}
                profileUrl={participantDetails.profile || undefined}
                recipientInfo={{
                    name: conversationUser.name,
                    id: recipientId,
                    profile: conversationUser.profile,
                    phoneNumber: recipientContact?.phoneNumber || '',
                }}
            />
            <MenuDropdown
                visible={showMenu}
                onClose={toggleMenu}
                onOptionPress={handleMenuOption}
                animation={menuAnimation}
            />
            <GroupDetailsSheet
                visible={showDetails}
                onClose={toggleDetails}
                groupName={participantDetails.name}
                groupAvatar={participantDetails.name?.charAt(0)?.toUpperCase() || 'U'}
                animation={detailsAnimation}
                onChatPress={handleChatPress}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
            >
                {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> */}
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <MessagesList
                            messages={messages || []}
                            flatListRef={flatListRef}
                            theme={theme}
                            user={user}
                        />
                    </View>
                    <View style={{ backgroundColor: theme.background }}>
                        <MessageInput
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            onSendMessage={handleSendMessage}
                            isSending={isSending}
                            isConnected={isConnected}
                            theme={theme}
                        />
                    </View>
                </View>
                {/* </TouchableWithoutFeedback> */}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
});