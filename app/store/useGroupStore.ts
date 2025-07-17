import { Group } from "@/@types/user-auth-types";
import { create } from "zustand";
import { GetGroupMessages, GetUserGroups, GroupMessage, SendGroupMessage } from "../services/group.service";
import { useUserStore } from "./useUserStore";

interface GroupStore {
  groups: Group[];
  messages: { [groupId: string]: GroupMessage[] };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGroups: () => Promise<void>;
  fetchMessages: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, content: string, type?: string) => Promise<void>;
  addMessage: (groupId: string, message: GroupMessage) => void;
  addGroup: (group: Group) => void;
  clearError: () => void;
  addSocketMessage: (groupId: string, message: GroupMessage) => void;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: [],
  messages: {},
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    const { getToken } = useUserStore.getState();
    const token = await getToken();
    
    if (!token) {
      set({ error: "No authentication token found" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const groups = await GetUserGroups(token);
      set({ groups, isLoading: false });
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      set({ 
        error: error.message || "Failed to fetch groups", 
        isLoading: false 
      });
    }
  },

  fetchMessages: async (groupId: string) => {
    const { getToken } = useUserStore.getState();
    const token = await getToken();
    
    if (!token) {
      set({ error: "No authentication token found" });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const messages = await GetGroupMessages(groupId, token);
      set(state => ({
        messages: {
          ...state.messages,
          [groupId]: messages
        },
        isLoading: false
      }));
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      set({ 
        error: error.message || "Failed to fetch messages", 
        isLoading: false 
      });
    }
  },

  sendMessage: async (groupId: string, content: string, type = "text") => {
    const { getToken } = useUserStore.getState();
    const token = await getToken();
    
    if (!token) {
      set({ error: "No authentication token found" });
      return;
    }

    try {
      const message = await SendGroupMessage(groupId, content, type, token);
      
      set(state => ({
        messages: {
          ...state.messages,
          [groupId]: [...(state.messages[groupId] || []), message]
        }
      }));
    } catch (error: any) {
      console.error("Error sending message:", error);
      set({ error: error.message || "Failed to send message" });
    }
  },

  addMessage: (groupId: string, message: GroupMessage) => {
    set(state => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] || []), message]
      }
    }));
  },

  addGroup: (group: Group) => {
    set(state => ({
      groups: [...state.groups, group]
    }));
  },

  addSocketMessage: (groupId: string, message: GroupMessage) => {
    set(state => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] || []), { ...message, status: 'delivered' }]
      }
    }));
  },

  clearError: () => {
    set({ error: null });
  }
})); 