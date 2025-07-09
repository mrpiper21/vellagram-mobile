import { useUserStore } from '@/store/useUserStore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';


// const socket = io("http://192.168.86.184:3000");

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
  
    useEffect(() => {
      // Only connect if user exists and has an ID
      if (!user?.id) {
        console.log("🔌 No user ID available, skipping socket connection");
        return;
      }

      console.log("🔌 Connecting socket for user:", user.id);

      socketRef.current = io("http://192.168.86.36:2000", {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
      });

      socketRef.current.on("connect", () => {
        console.log("🔌 Socket connected, user will be registered via useSocketChat hook");
        setIsConnected(true);
      });
  
      socketRef.current.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
        setIsConnected(false);
      });

      socketRef.current.on('user_registered', (data) => {
        console.log("✅ User successfully registered with socket:", data);
      });
  
      return () => {
        console.log("🔌 Cleaning up socket connection");
        socketRef.current?.disconnect();
        socketRef.current = null;
      };
    }, [user?.id]); // Only re-run when user ID changes

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const ruseSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext! must be used within a SocketProvider');
  }
  return context;
};
