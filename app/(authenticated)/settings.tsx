import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SettingsScreen = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <TouchableOpacity style={styles.item} onPress={() => {}}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#222" style={styles.icon} />
        <Text style={styles.label}>Chat Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => router.push("/(authenticated)/notification-settings")}>
        <Ionicons name="notifications-outline" size={22} color="#222" style={styles.icon} />
        <Text style={styles.label}>Notification Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#222',
    marginTop: 30
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: '#222',
  },
});

export default SettingsScreen; 