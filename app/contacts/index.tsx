import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from 'expo-contacts';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Contact = Contacts.Contact;

const EmptyState = () => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const appColors = Colors[colorScheme];

    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const strokeDashoffset = useSharedValue(1000);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 1000 });
        scale.value = withRepeat(
            withTiming(1.05, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease)
            }),
            -1,
            true
        );
        strokeDashoffset.value = withDelay(
            500,
            withTiming(0, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease)
            })
        );
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: strokeDashoffset.value,
    }));

    return (
        <View style={styles.emptyContainer}>
            <Animated.View style={[
                styles.illustrationContainer,
                {
                    opacity,
                    transform: [{ scale }]
                }
            ]}>
                <Svg width={200} height={200} viewBox="0 0 200 200">
                    <G>
                        {/* Main circle */}
                        <AnimatedCircle
                            cx={100}
                            cy={100}
                            r={80}
                            stroke={appColors.text}
                            strokeWidth={2}
                            fill="none"
                            strokeDasharray={1000}
                            animatedProps={animatedProps}
                        />

                        {/* Contact icon */}
                        <Path
                            d="M100 60C83.4315 60 70 73.4315 70 90C70 106.569 83.4315 120 100 120C116.569 120 130 106.569 130 90C130 73.4315 116.569 60 100 60Z"
                            stroke={appColors.text}
                            strokeWidth={2}
                            fill="none"
                        />
                        <Path
                            d="M60 140C60 117.909 77.9086 100 100 100C122.091 100 140 117.909 140 140"
                            stroke={appColors.text}
                            strokeWidth={2}
                            fill="none"
                        />

                        {/* Plus icon */}
                        <Circle
                            cx={150}
                            cy={150}
                            r={15}
                            fill={appColors.tint}
                            opacity={0.8}
                        />
                        <Path
                            d="M150 142V158M142 150H158"
                            stroke="white"
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                    </G>
                </Svg>
            </Animated.View>
            <Text style={[styles.emptyTitle, { color: appColors.text }]}>
                No Contacts Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: appColors.text, opacity: 0.7 }]}>
                Your contacts will appear here
            </Text>
        </View>
    );
};

const ContactScreen = () => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const appColors = Colors[colorScheme];

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Contacts.requestPermissionsAsync();
                if (status === 'granted') {
                    const { data } = await Contacts.getContactsAsync({
                        fields: [
                            Contacts.Fields.Name,
                            Contacts.Fields.PhoneNumbers,
                            Contacts.Fields.Image,
                        ],
                    });
                    setContacts(data);
                    setFilteredContacts(data);
                } else {
                    setError('Permission to access contacts was denied');
                }
            } catch (err) {
                setError('Failed to load contacts');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(contact =>
                contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredContacts(filtered);
        }
    }, [searchQuery, contacts]);

    const renderContactItem = ({ item }: { item: Contact }) => (
        <TouchableOpacity
            style={[styles.contactItem, { backgroundColor: appColors.card }]}
            onPress={() => {/* Handle contact selection */ }}
        >
            <View style={styles.contactAvatar}>
                {item.imageAvailable && item.image ? (
                    <Image source={{ uri: item.image.uri }} style={styles.avatarImage} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: appColors.tint }]}>
                        <Text style={styles.avatarText}>
                            {item.name?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: appColors.text }]}>
                    {item.name || 'Unnamed Contact'}
                </Text>
                {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                    <Text style={[styles.contactPhone, { color: appColors.text }]}>
                        {item.phoneNumbers[0].number}
                    </Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={appColors.icon} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: appColors.background }]}>
                <ActivityIndicator size="large" color={appColors.tint} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: appColors.background }]}>
                <Text style={[styles.errorText, { color: appColors.text }]}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <View style={[styles.searchContainer, { backgroundColor: appColors.card }]}>
                <Ionicons name="search" size={20} color={appColors.icon} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: appColors.text }]}
                    placeholder="Search contacts..."
                    placeholderTextColor={appColors.text}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={appColors.icon} />
                    </TouchableOpacity>
                )}
            </View>

            {filteredContacts.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={filteredContacts}
                    renderItem={renderContactItem}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default ContactScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        margin: 12,
        borderRadius: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    listContainer: {
        padding: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 12,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    contactPhone: {
        fontSize: 13,
        opacity: 0.7,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 15,
        margin: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    illustrationContainer: {
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
    },
});