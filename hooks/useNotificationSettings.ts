import { notificationService, NotificationSettings } from '@/services/notification.service';
import { useEffect, useState } from 'react';

export const useNotificationSettings = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        enabled: true,
        sound: true,
        vibration: true,
        badge: true,
        messagePreview: true,
        groupMessages: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const currentSettings = await notificationService.getNotificationSettings();
            setSettings(currentSettings);
        } catch (error) {
            console.error('❌ Error loading notification settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        try {
            await notificationService.updateNotificationSettings(newSettings);
            setSettings(prev => ({ ...prev, ...newSettings }));
            console.log('✅ Notification settings updated:', newSettings);
        } catch (error) {
            console.error('❌ Error updating notification settings:', error);
            throw error;
        }
    };

    const toggleSetting = async (key: keyof NotificationSettings) => {
        const newValue = !settings[key];
        await updateSettings({ [key]: newValue });
    };

    const resetToDefaults = async () => {
        const defaultSettings: NotificationSettings = {
            enabled: true,
            sound: true,
            vibration: true,
            badge: true,
            messagePreview: true,
            groupMessages: false,
        };
        await updateSettings(defaultSettings);
    };

    return {
        settings,
        isLoading,
        updateSettings,
        toggleSetting,
        resetToDefaults,
        refreshSettings: loadSettings,
    };
}; 