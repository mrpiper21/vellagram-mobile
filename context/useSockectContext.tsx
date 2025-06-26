import { useUser } from '@/store/useUserStore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';


// const socket = io("http://192.168.86.184:3000");

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const user = useUser();
  
    useEffect(() => {
      socketRef.current = io("http://192.168.86.184:2000", {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true
      });
  
      socketRef.current.on("connect", () => {
        socketRef.current?.emit("register", user?.id);
        setIsConnected(true);
      });
  
      socketRef.current.on("disconnect", () => {
        setIsConnected(false);
      });

      socketRef.current.on('message', (messageData) => {
        console.log('Message received:', messageData.content);
        
        socketRef.current?.emit('message_delivered', {
          messageId: messageData.id,
          acknowledgmentId: messageData.acknowledgmentId
        });
      });
  
      return () => {
        socketRef.current?.disconnect();
      };
    }, [user?.id]);

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
