import { API_BASE_URL } from "@/config/api";
import TokenManager from "@/utils/tokenManager";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

// Socket server configuration
const SOCKET_CONFIG = {
	// Try different URLs based on environment
	URLS: [
		"http://172.20.10.8:2000",
	],
	DEFAULT_URL: "http://172.20.10.8:2000",
	RECONNECT_ATTEMPTS: 3,
	RECONNECT_DELAY: 2000,
	CONNECTION_TIMEOUT: 10000,
};

class SocketService {
	private socket: Socket | null = null;
	private isConnected = false;
	private reconnectAttempts = 0;
	private currentUrlIndex = 0;
	private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
	private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

	async connect(): Promise<void> {
		try {
			const token = await TokenManager.getToken();
			if (!token) {
				console.warn("⚠️ No token available for socket connection");
				return;
			}

			this.disconnect();

			this.socket = io(API_BASE_URL, {
				auth: {
					token
				},
				transports: ["websocket", "polling"],
				timeout: SOCKET_CONFIG.CONNECTION_TIMEOUT,
				forceNew: true,
				reconnection: false,
			});

			this.setupEventListeners();
			this.setupConnectionTimeout();

		} catch (error) {
			console.error("❌ Failed to initialize socket connection:", error);
			this.handleConnectionFailure();
		}
	}

	private setupEventListeners(): void {
		if (!this.socket) return;

		this.socket.on("connect", () => {
			console.log("✅ Connected to socket server successfully");
			this.isConnected = true;
			this.reconnectAttempts = 0;
			this.clearConnectionTimeout();
		});

		this.socket.on("disconnect", (reason) => {
			console.log("❌ Disconnected from socket server:", reason);
			this.isConnected = false;
			
			if (reason === "io server disconnect") {
				// Server disconnected, try to reconnect
				this.handleConnectionFailure();
			}
		});

		this.socket.on("connect_error", (error) => {
			console.error("❌ Socket connection error:", error.message);
			this.handleConnectionFailure();
		});

		// Handle incoming direct messages
		this.socket.on("message", (message: any) => {
			// Validate message structure
			if (!message || !message.id || !message.senderId || !message.recipientId || !message.content) {
				console.warn("⚠️ Received malformed direct message:", message);
				return;
			}
			console.log("📨 Received direct message:", message);
			const { addSocketMessage } = useChatStore.getState();
			addSocketMessage({
				senderId: message.senderId,
				recipientId: message.recipientId,
				message: message.content,
				type: message.type,
				id: message.id
			});
		});

		// Handle incoming group messages
		this.socket.on("group_message", (message: any) => {
			console.log("📨 Received group message:", message);
			const { addMessage } = useGroupStore.getState();
			addMessage(message.groupId, message);
		});

		// Handle user joined group
		this.socket.on("user_joined_group", (data: any) => {
			console.log("👤 User joined group:", data);
		});

		// Handle user left group
		this.socket.on("user_left_group", (data: any) => {
			console.log("👤 User left group:", data);
		});

		// Handle authentication errors
		this.socket.on("auth_error", (error: any) => {
			console.error("❌ Socket authentication error:", error);
		});
	}

	private setupConnectionTimeout(): void {
		this.clearConnectionTimeout();
		this.connectionTimeout = setTimeout(() => {
			console.warn("⏰ Socket connection timeout");
			this.handleConnectionFailure();
		}, SOCKET_CONFIG.CONNECTION_TIMEOUT);
	}

	private clearConnectionTimeout(): void {
		if (this.connectionTimeout) {
			clearTimeout(this.connectionTimeout);
			this.connectionTimeout = null;
		}
	}

	private handleConnectionFailure(): void {
		this.clearConnectionTimeout();
		
		if (this.reconnectAttempts >= SOCKET_CONFIG.RECONNECT_ATTEMPTS) {
			console.error("❌ Max reconnection attempts reached");
			this.tryNextUrl();
			return;
		}

		this.reconnectAttempts++;
		console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${SOCKET_CONFIG.RECONNECT_ATTEMPTS})`);

		this.clearReconnectTimeout();
		this.reconnectTimeout = setTimeout(() => {
			this.connect();
		}, SOCKET_CONFIG.RECONNECT_DELAY * this.reconnectAttempts);
	}

	private tryNextUrl(): void {
		this.currentUrlIndex++;
		if (this.currentUrlIndex >= SOCKET_CONFIG.URLS.length) {
			console.error("❌ All socket server URLs failed");
			this.currentUrlIndex = 0; // Reset for next attempt
			return;
		}

		console.log(`🔄 Trying next socket server URL: ${SOCKET_CONFIG.URLS[this.currentUrlIndex]}`);
		this.reconnectAttempts = 0;
		this.connect();
	}

	private clearReconnectTimeout(): void {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
	}

	joinGroup(groupId: string): void {
		if (!this.socket || !this.isConnected) {
			console.warn("⚠️ Socket not connected, cannot join group");
			return;
		}

		this.socket.emit("join_group", { groupId });
		console.log(`👥 Joined group: ${groupId}`);
	}

	leaveGroup(groupId: string): void {
		if (!this.socket || !this.isConnected) {
			console.warn("⚠️ Socket not connected, cannot leave group");
			return;
		}

		this.socket.emit("leave_group", { groupId });
		console.log(`👥 Left group: ${groupId}`);
	}

	sendGroupMessage(groupId: string, content: string, type = "text"): void {
		if (!this.socket ) {
			console.warn("⚠️ Socket not connected, cannot send message");
			return;
		}

		this.socket.emit("group_message", {
			groupId,
			content,
			type
		});
		console.log(`📤 Sent group message to ${groupId}:`, content);
	}

	disconnect(): void {
		this.clearConnectionTimeout();
		this.clearReconnectTimeout();
		
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
		this.isConnected = false;
	}

	getConnectionStatus(): boolean {
		return this.isConnected && this.socket?.connected === true;
	}

	getSocket(): Socket | null {
		return this.socket;
	}

	// Force reconnect (useful for testing)
	forceReconnect(): void {
		console.log("🔄 Force reconnecting socket...");
		this.reconnectAttempts = 0;
		this.currentUrlIndex = 0;
		this.connect();
	}
}

const socketService = new SocketService();
export default socketService; 