import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SettingsScreen = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      <Text style={[styles.header, { color: theme.text }]}>Settings</Text>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => {}}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.text} style={styles.icon} />
        <Text style={[styles.label, { color: theme.text }]}>Chat Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, { borderBottomColor: theme.border }]} onPress={() => router.push('../../../account/notification-settings')}>
        <Ionicons name="notifications-outline" size={22} color={theme.text} style={styles.icon} />
        <Text style={[styles.label, { color: theme.text }]}>Notification Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 16,
  },
});

export default SettingsScreen; 