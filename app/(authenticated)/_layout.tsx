import { SocketProvider } from '@/context/useSockectContext';
import { Stack } from 'expo-router';
import React from 'react';
import { GroupDetailsProvider } from '../context/GroupDetailsContext';

export default function AuthenticatedLayout() {
    return (
        <SocketProvider>
            <GroupDetailsProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen 
                        name="conversation/[id]" 
                        options={{ headerShown: false }} 
                    />
                    <Stack.Screen name="groupChat/[groupId]" />
                </Stack>
            </GroupDetailsProvider>
        </SocketProvider>
    );
}