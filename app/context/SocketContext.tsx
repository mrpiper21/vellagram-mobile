import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket.service';

interface SocketContextType {
	isConnected: boolean;
	connect: () => Promise<void>;
	disconnect: () => void;
	forceReconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return context;
};

interface SocketProviderProps {
	children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		connect();

		return () => {
			disconnect();
		};
	}, []);

	const connect = async () => {
		try {
			await socketService.connect();
			
			// Set up connection status monitoring
			const checkConnection = () => {
				const status = socketService.getConnectionStatus();
				setIsConnected(status);
			};

			// Check connection status periodically
			const interval = setInterval(checkConnection, 2000);
			
			// Initial check
			checkConnection();
		} catch (error) {
			console.error('Failed to connect socket:', error);
		}
	};

	const disconnect = () => {
		socketService.disconnect();
		setIsConnected(false);
	};

	const forceReconnect = () => {
		socketService.forceReconnect();
	};

	const value: SocketContextType = {
		isConnected,
		connect,
		disconnect,
		forceReconnect,
	};

	return (
		<SocketContext.Provider value={value}>
			{children}
		</SocketContext.Provider>
	);
}; 