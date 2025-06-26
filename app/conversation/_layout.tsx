import { SocketProvider } from '@/context/useSockectContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function ConversationLayout() {
  return (
    <SocketProvider>
      <Stack screenOptions={{headerShown: false}} />
    </SocketProvider>
  );
}