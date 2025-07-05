import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Notification configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage keys
const PUSH_TOKEN_KEY = 'push_token';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// Notification settings interface
export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  messagePreview: boolean;
  groupMessages: boolean;
}

// Default notification settings
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  vibration: true,
  badge: true,
  messagePreview: true,
  groupMessages: false,
};

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationSettings: NotificationSettings = DEFAULT_SETTINGS;
  private isInitialized = false;
  private notificationListeners: {
    notificationListener: Notifications.Subscription;
    responseListener: Notifications.Subscription;
  } | null = null;

  // Initialize notification service
  async initialize(): Promise<string | null> {
    if (this.isInitialized) {
      return this.expoPushToken;
    }

    try {
      // Load saved settings
      await this.loadNotificationSettings();
      
      // Register for push notifications
      const token = await this.registerForPushNotificationsAsync();
      
      if (token) {
        this.expoPushToken = token;
        await this.savePushToken(token);
        console.log('📱 Push notification token:', token);
      }

      // Set up notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      return token;
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      return null;
    }
  }

  // Register for push notifications
  private async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('❌ Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (error) {
        console.error('❌ Error getting push token:', error);
        return null;
      }
    } else {
      console.warn('⚠️ Must use physical device for Push Notifications');
    }

    return token;
  }

  // Setup Android notification channels
  private async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    // Main notification channel
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Silent channel for background updates
    await Notifications.setNotificationChannelAsync('silent', {
      name: 'Silent Updates',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0],
      lightColor: '#FF231F7C',
      sound: null,
      enableVibrate: false,
      showBadge: false,
    });
  }

  // Setup notification listeners
  private setupNotificationListeners(): void {
    // Handle received notifications (when app is in foreground)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification response:', response);
      this.handleNotificationResponse(response);
    });

    // Store listeners for cleanup
    this.notificationListeners = { notificationListener, responseListener };
  }

  // Handle received notification
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { data } = notification.request.content;
    
    // Handle different notification types
    switch (data?.type as string) {
      case 'message':
        this.handleMessageNotification(data);
        break;
      case 'conversation_update':
        this.handleConversationUpdate(data);
        break;
      default:
        console.log('📨 Unknown notification type:', data?.type);
    }
  }

  // Handle notification response (user tap)
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    switch (data?.type as string) {
      case 'message':
        this.navigateToConversation(data.conversationId as string, data.senderId as string);
        break;
      case 'conversation_update':
        this.navigateToConversation(data.conversationId as string);
        break;
      default:
        console.log('👆 Unknown notification response type:', data?.type);
    }
  }

  // Handle message notification
  private handleMessageNotification(data: any): void {
    // Update badge count
    if (this.notificationSettings.badge) {
      this.updateBadgeCount();
    }

    // Play sound if enabled
    if (this.notificationSettings.sound) {
      // Sound is handled by the notification itself
    }

    // Trigger haptic feedback
    if (this.notificationSettings.vibration) {
      this.triggerHapticFeedback();
    }
  }

  // Handle conversation update notification
  private handleConversationUpdate(data: any): void {
    // Handle conversation updates (new participants, name changes, etc.)
    console.log('📨 Conversation update:', data);
  }

  // Navigate to conversation
  private navigateToConversation(conversationId: string, senderId?: string): void {
    try {
      if (conversationId) {
        router.push(`/conversation/${conversationId}`);
      } else if (senderId) {
        // Create conversation ID from sender ID
        const conversationId = this.createConversationId(senderId);
        router.push(`/conversation/${conversationId}`);
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }

  // Create conversation ID from participant IDs
  private createConversationId(participantId: string): string {
    // This should match your existing conversation ID generation logic
    return participantId;
  }

  // Update badge count
  private async updateBadgeCount(): Promise<void> {
    try {
      // Get current badge count from your chat store
      // This is a placeholder - implement based on your store structure
      const currentBadge = await Notifications.getBadgeCountAsync();
      await Notifications.setBadgeCountAsync(currentBadge + 1);
    } catch (error) {
      console.error('❌ Error updating badge count:', error);
    }
  }

  // Trigger haptic feedback
  private triggerHapticFeedback(): void {
    // Import expo-haptics dynamically to avoid issues
    import('expo-haptics').then((Haptics) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }).catch(() => {
      // Haptics not available
    });
  }

  // Send local notification for testing
  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.notificationSettings.enabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'message', ...data },
        sound: this.notificationSettings.sound ? 'default' : undefined,
      },
      trigger: null, // Send immediately
    });
  }

  // Schedule notification
  async scheduleNotification(
    title: string, 
    body: string, 
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string> {
    if (!this.notificationSettings.enabled) return '';

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'message', ...data },
        sound: this.notificationSettings.sound ? 'default' : undefined,
      },
      trigger,
    });
  }

  // Cancel notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.notificationSettings;
  }

  // Update notification settings
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    await this.saveNotificationSettings();
  }

  // Load notification settings from storage
  private async loadNotificationSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (saved) {
        this.notificationSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('❌ Error loading notification settings:', error);
    }
  }

  // Save notification settings to storage
  private async saveNotificationSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.notificationSettings));
    } catch (error) {
      console.error('❌ Error saving notification settings:', error);
    }
  }

  // Save push token to storage
  private async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error('❌ Error saving push token:', error);
    }
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Cleanup
  cleanup(): void {
    if (this.notificationListeners) {
      this.notificationListeners.notificationListener.remove();
      this.notificationListeners.responseListener.remove();
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
