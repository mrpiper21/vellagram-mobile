import { API_ENDPOINTS } from "@/config/api";
import axios from "axios";

export interface CreateGroupRequest {
  name: string;
  userIds: string[];
  token: string;
}

export interface Group {
  id: string;
  name: string;
  admin: string;
  users: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  id: string;
  content: string;
  type: string;
  senderId: string;
  groupId: string;
  timestamp: string;
  read: boolean;
  deliveryStatus: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export interface CreateGroupResponse {
  groupId: string;
  name: string;
  admin: string;
  users: string[];
  initialMessage: {
    id: string;
    content: string;
    type: string;
    timestamp: string;
  };
}

export const CreateGroup = async (data: CreateGroupRequest): Promise<CreateGroupResponse> => {
  try {
    console.log("🔐 Creating group with data:", data);
    
    const response = await axios.post(
      `${API_ENDPOINTS.GROUPS.CREATE}`,
      {
        name: data.name,
        userIds: data.userIds
      },
      {
        headers: {
          Authorization: `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log("✅ Group created successfully:", response.data);
      return response.data.group;
    } else {
      throw new Error(response.data.message || 'Failed to create group');
    }
  } catch (error: any) {
    console.error("❌ Error creating group:", error);
    throw new Error(error.response?.data?.message || 'Failed to create group');
  }
};

export const GetUserGroups = async (token: string): Promise<Group[]> => {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.GROUPS.GET_USER_GROUPS}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return response.data.groups;
    } else {
      throw new Error(response.data.message || 'Failed to fetch groups');
    }
  } catch (error: any) {
    console.error("❌ Error fetching user groups:", error);
    throw new Error(error.response?.data?.message || 'Failed to fetch groups');
  }
};

export const GetGroupMessages = async (groupId: string, token: string): Promise<GroupMessage[]> => {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.GROUPS.GET_MESSAGES.replace(':groupId', groupId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return response.data.messages;
    } else {
      throw new Error(response.data.message || 'Failed to fetch group messages');
    }
  } catch (error: any) {
    console.error("❌ Error fetching group messages:", error);
    throw new Error(error.response?.data?.message || 'Failed to fetch group messages');
  }
};

export const SendGroupMessage = async (
  groupId: string, 
  content: string, 
  type: string, 
  token: string
): Promise<GroupMessage> => {
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.GROUPS.SEND_MESSAGE.replace(':groupId', groupId)}`,
      {
        content,
        type
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      return response.data.message;
    } else {
      throw new Error(response.data.message || 'Failed to send group message');
    }
  } catch (error: any) {
    console.error("❌ Error sending group message:", error);
    throw new Error(error.response?.data?.message || 'Failed to send group message');
  }
};

export const MarkGroupMessagesRead = async (
  groupId: string,
  messageIds: string[],
  token: string
): Promise<void> => {
  try {
    const response = await axios.patch(
      `${API_ENDPOINTS.GROUPS.MARK_READ.replace(':groupId', groupId)}`,
      {
        messageIds
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.updated) {
      throw new Error('Failed to mark messages as read');
    }
  } catch (error: any) {
    console.error("❌ Error marking messages as read:", error);
    throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
  }
}; 