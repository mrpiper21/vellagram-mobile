import { SocketProvider } from '@/context/useSockectContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthenticatedLayout() {
    return (
        <SocketProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="conversation/[id]" />
            </Stack>
        </SocketProvider>
    );
} 