export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    profilePicture?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export interface Contact {
    id: string;
    name: string;
    phoneNumbers?: Array<{ number: string; type?: string }>;
    emails?: Array<{ email: string; type?: string }>;
    userData?: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
}

export interface Message {
	id?: string;
	content: string;
	timestamp: number;
	isEncrypted?: boolean;
	encryptionKey?: "string";
	senderId: string;
	recipientId: string;
	type: "text" | "image" | "file" | "audio" | "video";
	status?: "queued" | "sending" | "sent" | "delivered" | "read" | "failed";
}

export interface Conversation {
    id: string;
    participants: string[];
    isGroup: boolean;
    groupName?: string;
    groupAvatar?: string;
    lastMessage?: Message;
    unreadCount?: number;
    createdAt: number;
    updatedAt: number;
}

export interface ParticipantDetails {
    name: string;
    id: string | null;
    profile: string | null;
}

export interface RecipientInfo {
    name: string;
    id: string | null;
    profile: string | null;
    phoneNumber?: string;
    email?: string;
    lastSeen?: string;
    isOnline?: boolean;
}

export interface Theme {
    background: string;
    card: string;
    text: string;
    border: string;
    tint: string;
    icon: string;
    isDark: boolean;
} 