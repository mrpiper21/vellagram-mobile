import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

const NotificationSettingsScreen = () => {
    const { settings, isLoading, toggleSetting, resetToDefaults } = useNotificationSettings();
    const { theme } = useTheme();

    const handleToggle = async (key: keyof typeof settings) => {
        try {
            await toggleSetting(key);
        } catch (error) {
            Alert.alert('Error', 'Failed to update notification settings');
        }
    };

    const handleReset = async () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all notification settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resetToDefaults();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset notification settings');
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Loading settings...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View>
                <View style={styles.header}>
                    <Ionicons name="notifications" size={24} color={theme.text} />
                    <ThemedText style={styles.title}>Notification Settings</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>General</ThemedText>

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <ThemedText style={styles.settingTitle}>Enable Notifications</ThemedText>
                            <ThemedText style={styles.settingDescription}>
                                Receive notifications for new messages
                            </ThemedText>
                        </View>
                        <Switch
                            value={settings.enabled}
                            onValueChange={() => handleToggle('enabled')}
                            trackColor={{ false: theme.border, true: theme.tint }}
                            thumbColor={settings.enabled ? theme.background : theme.text}
                        />
                    </View>
                </View>

                {settings.enabled && (
                    <>
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Sound & Vibration</ThemedText>

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <ThemedText style={styles.settingTitle}>Sound</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Play sound for notifications
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={settings.sound}
                                    onValueChange={() => handleToggle('sound')}
                                    trackColor={{ false: theme.border, true: theme.tint }}
                                    thumbColor={settings.sound ? theme.background : theme.text}
                                />
                            </View>

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <ThemedText style={styles.settingTitle}>Vibration</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Vibrate for notifications
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={settings.vibration}
                                    onValueChange={() => handleToggle('vibration')}
                                    trackColor={{ false: theme.border, true: theme.tint }}
                                    thumbColor={settings.vibration ? theme.background : theme.text}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Display</ThemedText>

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <ThemedText style={styles.settingTitle}>Badge Count</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Show unread message count on app icon
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={settings.badge}
                                    onValueChange={() => handleToggle('badge')}
                                    trackColor={{ false: theme.border, true: theme.tint }}
                                    thumbColor={settings.badge ? theme.background : theme.text}
                                />
                            </View>

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <ThemedText style={styles.settingTitle}>Message Preview</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Show message content in notifications
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={settings.messagePreview}
                                    onValueChange={() => handleToggle('messagePreview')}
                                    trackColor={{ false: theme.border, true: theme.tint }}
                                    thumbColor={settings.messagePreview ? theme.background : theme.text}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>Groups</ThemedText>

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <ThemedText style={styles.settingTitle}>Group Messages</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Receive notifications for group messages
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={settings.groupMessages}
                                    onValueChange={() => handleToggle('groupMessages')}
                                    trackColor={{ false: theme.border, true: theme.tint }}
                                    thumbColor={settings.groupMessages ? theme.background : theme.text}
                                />
                            </View>
                        </View>
                    </>
                )}

                <View style={styles.resetSection}>
                    <ThemedText
                        style={[styles.resetButton, { color: theme.accent }]}
                        onPress={handleReset}
                    >
                        Reset to Defaults
                    </ThemedText>
                </View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        marginTop: 30
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        opacity: 0.7,
        lineHeight: 20,
    },
    resetSection: {
        marginTop: 32,
        alignItems: 'center',
    },
    resetButton: {
        fontSize: 16,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});

export default NotificationSettingsScreen; 