import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/store/useChatStore';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export const ChatStoreReset: React.FC = () => {
    const resetChatStore = useChatStore(state => state.resetChatStore);
    const { theme } = useTheme();

    const handleReset = () => {
        Alert.alert(
            'Reset Chat Store',
            'This will clear all conversations and messages. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        resetChatStore();
                        Alert.alert('Success', 'Chat store has been reset successfully.');
                    }
                }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>Chat Store Reset</ThemedText>
            <ThemedText style={styles.description}>
                Use this to clear all conversations and messages if you're experiencing duplication issues.
            </ThemedText>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.accent }]}
                onPress={handleReset}
            >
                <ThemedText style={[styles.buttonText, { color: theme.background }]}>
                    Reset Chat Store
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        opacity: 0.7,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
}); 