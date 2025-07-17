import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import TokenManager from '../utils/tokenManager';

// API Configuration
export const API_BASE_URL = "http://192.168.86.248:2000"; // Local development server
const prisma = "http://192.168.86.248:2000";

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add bearer token
apiClient.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		// Get token from storage
		const token = await TokenManager.getToken();

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
			console.log(
				"🔐 Axios Interceptor - Token added to request:",
				token.substring(0, 20) + "..."
			);
		} else {
			console.log("⚠️ Axios Interceptor - No token found in storage");
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error) => {
		// Handle 401/403 errors - token expired or invalid
		if (error.response?.status === 401 || error.response?.status === 403) {
			// Clear token and user data
			await TokenManager.clearAuth();
			// You can also trigger a navigation to login screen here
			// navigation.navigate('Login');
		}

		return Promise.reject(error);
	}
);

export const API_ENDPOINTS = {
	OTP: {
		GENERATE: `${API_BASE_URL}/api/otp/generate`,
		VERIFY: `${API_BASE_URL}/api/otp/validate`,
	},
	AUTH: {
		LOGIN: `${API_BASE_URL}/api/users/login`,
		REGISTER: `${API_BASE_URL}/api/users/signup`,
		ISREGISTERED: `${prisma}/api/users/check-phone`,
		ALLUSERS: `${prisma}/api/users/get-all-user`,
	},
	GROUP: {
		CREATE: `${API_BASE_URL}/api/groups`,
	},
	GROUPS: {
		CREATE: `${API_BASE_URL}/api/groups`,
		GET_USER_GROUPS: `${API_BASE_URL}/api/groups/user-groups`,
		GET_MESSAGES: `${API_BASE_URL}/api/groups/:groupId/chat`,
		SEND_MESSAGE: `${API_BASE_URL}/api/groups/:groupId/chat`,
		MARK_READ: `${API_BASE_URL}/api/groups/:groupId/chat/read`,
	},
};

// API service functions using the configured axios instance
export const apiService = {
  // Auth endpoints
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Store token and user data on successful login
    if (response.data.token) {
      await TokenManager.setToken(response.data.token);
      if (response.data.user) {
        await TokenManager.setUserData(response.data.user);
      }
    }
    
    return response.data;
  },

  register: async (userData: { email: string; password: string; firstName: string,lastName: string, confirmPassword: string, phone: string, confirmPin: string, pin: string  }) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    // Store token and user data on successful registration
    if (response.data.token) {
      await TokenManager.setToken(response.data.token);
      if (response.data.user) {
        await TokenManager.setUserData(response.data.user);
      }
    }
    
    return response.data;
  },

  logout: async () => {
    await TokenManager.clearAuth();
  },

  checkPhoneRegistration: async (phoneNumber: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.ISREGISTERED, { phoneNumber });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ALLUSERS);
    return response.data;
  },

  // OTP endpoints
  generateOTP: async (phoneNumber: string) => {
    const response = await apiClient.post(API_ENDPOINTS.OTP.GENERATE, { phoneNumber });
    return response.data;
  },

  verifyOTP: async (phoneNumber: string, otp: string) => {
    const response = await apiClient.post(API_ENDPOINTS.OTP.VERIFY, { phoneNumber, otp });
    
    // Store token and user data on successful OTP verification
    if (response.data.token) {
      await TokenManager.setToken(response.data.token);
      if (response.data.user) {
        await TokenManager.setUserData(response.data.user);
      }
    }
    
    return response.data;
  },

  // Group endpoints
  createGroup: async (groupData: any) => {
    const response = await apiClient.post(API_ENDPOINTS.GROUP.CREATE, groupData);
    return response.data;
  },
};

// Legacy function for backward compatibility
export async function checkContactsRegistration(phoneNumbers: string[]): Promise<string[]> {
  const response = await apiClient.post('/api/contacts/check-registration', { phoneNumbers });
  return response.data.registered;
}

export default apiClient;