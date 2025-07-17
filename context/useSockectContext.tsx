import { API_BASE_URL } from '@/config/api';
import { useChatStore } from '@/store/useChatStore';
import { useUserStore } from '@/store/useUserStore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import io, { Socket } from 'socket.io-client';


interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(
	undefined
);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const { user } = useUserStore((state) => state);
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const drainQueue = useChatStore((state) => state.drainQueue);

    useEffect(() => {
      if (!user?.id) {
        console.log("🔌 No user ID available, skipping socket connection");
        return;
      }

		console.log("🔌 Connecting socket for user:", user.id);

      socketRef.current = io(API_BASE_URL, {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
      });

      socketRef.current.on("connect", () => {
        console.log("🔌 Socket connected, user will be registered via useSocketChat hook");
        setIsConnected(true);
        // Removed drainQueue() call from here
      });
  
      socketRef.current.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on('user_registered', (data) => {
        console.log("✅ User successfully registered with socket:", data);
      });

      // Listen for app state changes
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App has come to the foreground, reconnect socket if needed
          if (user?.id && (!socketRef.current || !socketRef.current.connected)) {
            console.log("🔄 App became active, reconnecting socket...");
            socketRef.current = io(API_BASE_URL, {
              path: "/socket.io/",
              transports: ["websocket", "polling"],
              autoConnect: true,
              reconnection: true,
            });
          }
          // Removed drainQueue() call from here
        }
        appState.current = nextAppState;
      };
      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        subscription.remove();
      };
    }, [user?.id, drainQueue]);

	return (
		<SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
};

export const ruseSocketContext = () => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocketContext! must be used within a SocketProvider");
	}
	return context;
};
