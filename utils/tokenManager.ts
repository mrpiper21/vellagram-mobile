import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export interface UserData {
  id: string;
  email: string;
  name?: string;
}

export class TokenManager {
  // Store authentication token
  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Get authentication token
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  // Remove authentication token
  static async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Store user data
  static async setUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Get user data
  static async getUserData(): Promise<UserData | null> {
    try {
      const userDataString = await AsyncStorage.getItem(USER_KEY);
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  // Remove user data
  static async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  }

  // Clear all authentication data
  static async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        this.removeToken(),
        this.removeUserData(),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default TokenManager; 