import { useAppTheme } from '@/context/ThemeContext';
import { useUserStore } from '@/store/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
    const theme = useAppTheme();
    const { user, logout } = useUserStore();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/auth/EmailAuthScreen');
                    }
                }
            ]
        );
    };

    return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<View style={[styles.content, { backgroundColor: theme.background }]}>
					<View style={[styles.profileCard, { backgroundColor: theme.card }]}>
						<View style={[styles.avatar, { backgroundColor: theme.tint }]}>
							<Text style={styles.avatarText}>
								{user?.firstName?.charAt(0)?.toUpperCase() || "U"}
							</Text>
						</View>
						<Text style={[styles.name, { color: theme.text }]}>
							{user?.firstName} {user?.lastName}
						</Text>
						<Text style={[styles.email, { color: theme.textSecondary }]}>
							{user?.email}
						</Text>
					</View>

					<View style={[styles.menuSection, { backgroundColor: theme.card }]}>
						<TouchableOpacity style={styles.menuItem}>
							<Ionicons name="person-outline" size={24} color={theme.text} />
							<Text style={[styles.menuText, { color: theme.text }]}>
								Edit Profile
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>

						<TouchableOpacity style={styles.menuItem}>
							<Ionicons
								name="notifications-outline"
								size={24}
								color={theme.text}
							/>
							<Text style={[styles.menuText, { color: theme.text }]}>
								Notifications
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>

						<TouchableOpacity style={styles.menuItem}>
							<Ionicons name="shield-outline" size={24} color={theme.text} />
							<Text style={[styles.menuText, { color: theme.text }]}>
								Privacy & Security
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>

						<TouchableOpacity style={styles.menuItem}>
							<Ionicons
								name="help-circle-outline"
								size={24}
								color={theme.text}
							/>
							<Text style={[styles.menuText, { color: theme.text }]}>
								Help & Support
							</Text>
							<Ionicons
								name="chevron-forward"
								size={20}
								color={theme.textSecondary}
							/>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={[styles.logoutButton, { backgroundColor: theme.accent }]}
						onPress={handleLogout}
					>
						<Ionicons name="log-out-outline" size={24} color="white" />
						<Text style={styles.logoutText}>Logout</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 18,
        paddingTop: 38,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    profileCard: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
    },
    menuSection: {
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 'auto',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
}); 