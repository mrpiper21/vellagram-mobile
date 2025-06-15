import ContactSkeleton from "@/components/skeletons/ContactSkeleton";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { checkPhoneNumberRegisteration } from "@/services/contact.service";
import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import * as SMS from 'expo-sms';
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface Contact {
    id: string;
    name?: string;
    phoneNumbers?: Contacts.PhoneNumber[];
    imageAvailable?: boolean;
    image?: Contacts.Image;
    isRegistered?: boolean;
    userData?: any;
}

// Memoized Contact Item Component
const ContactItem = React.memo(({
    contact,
    appColors,
    isVerifying,
    onInvite,
    onChat
}: {
    contact: Contact;
    appColors: any;
    isVerifying: boolean;
    onInvite: (contact: Contact) => void;
    onChat: (userId: string) => void;
}) => {
    const phoneNumber = contact.phoneNumbers?.[0]?.number;

    return (
        <View style={[styles.contactItem, { backgroundColor: appColors.card }]}>
            <View style={styles.contactInfo}>
                {contact.imageAvailable && contact.image ? (
                    <Image
                        source={{ uri: contact.image.uri }}
                        style={styles.avatar}
                        defaultSource={require('@/assets/images/favicon.png')}
                    />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: appColors.tint }]}>
                        <Text style={styles.avatarText}>
                            {contact.name?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <View style={styles.contactDetails}>
                    <Text style={[styles.contactName, { color: appColors.text }]}>
                        {contact.name}
                    </Text>
                    {phoneNumber && (
                        <Text style={[styles.phoneNumber, { color: appColors.text, opacity: 0.7 }]}>
                            {phoneNumber}
                        </Text>
                    )}
                </View>
            </View>
            {phoneNumber && (
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        { 
                            backgroundColor: contact.isRegistered ? appColors.tint : appColors.card,
                            borderColor: appColors.border
                        }
                    ]}
                    onPress={() => {
                        if (contact.isRegistered) {
                            onChat(contact.userData.id);
                        } else {
                            onInvite(contact);
                        }
                    }}
                    disabled={isVerifying}
                >
                    {isVerifying ? (
                        <ActivityIndicator size="small" color={appColors.text} />
                    ) : (
                        <Text style={[
                            styles.buttonText,
                            { color: contact.isRegistered ? 'white' : appColors.text }
                            ]}>
                                {contact.isRegistered ? 'Chat' : 'Invite'}
                            </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
});

export default function ContactsScreen() {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const appColors = Colors[colorScheme];

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [verifyingContacts, setVerifyingContacts] = useState<Set<string>>(new Set());

    const verifyContact = useCallback(async (contact: Contact) => {
        if (!contact.phoneNumbers?.[0]?.number) return;

        const phoneNumber = contact.phoneNumbers[0].number.replace(/\D/g, '');
        setVerifyingContacts(prev => new Set(prev).add(contact.id));

        try {
            const result = await checkPhoneNumberRegisteration(phoneNumber);
            setContacts(prev => prev.map(c =>
                c.id === contact.id
                    ? { ...c, isRegistered: result.isResgistered, userData: result.data }
                    : c
            ));
        } catch (error) {
            console.error('Error verifying contact:', error);
        } finally {
            setVerifyingContacts(prev => {
                const next = new Set(prev);
                next.delete(contact.id);
                return next;
            });
        }
    }, []);

    const handleInvite = useCallback(async (contact: Contact) => {
        if (!contact.phoneNumbers?.[0]?.number) return;

        const phoneNumber = contact.phoneNumbers[0].number.replace(/\D/g, '');
        const message = `Hey! Join me on Vellagram - the new way to connect and share moments. Download the app now!`;

        try {
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                await SMS.sendSMSAsync(
                    [phoneNumber],
                    message
                );
            } else {
                console.log('SMS is not available on this device');
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
        }
    }, []);

    const handleChat = useCallback((userId: string) => {
        router.push(`/conversation/${userId}`);
    }, []);

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
                    const formattedContacts: Contact[] = data.map(contact => ({
                        id: contact.id || Math.random().toString(),
                        name: contact.name,
                        phoneNumbers: contact.phoneNumbers,
                        imageAvailable: contact.imageAvailable,
                        image: contact.image,
                    }));
                    setContacts(formattedContacts);
                    setFilteredContacts(formattedContacts);
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

    const handleEndReached = useCallback(() => {
        filteredContacts.forEach(contact => {
            if (!contact.isRegistered && !verifyingContacts.has(contact.id)) {
                verifyContact(contact);
            }
        });
    }, [filteredContacts, verifyingContacts, verifyContact]);

    const renderItem = useCallback(({ item }: { item: Contact }) => (
        <ContactItem
            contact={item}
            appColors={appColors}
            isVerifying={verifyingContacts.has(item.id)}
            onInvite={handleInvite}
            onChat={handleChat}
        />
    ), [appColors, verifyingContacts, handleInvite, handleChat]);

    const keyExtractor = useCallback((item: Contact) => item.id, []);

    const getItemLayout = useCallback((data: ArrayLike<Contact> | null | undefined, index: number) => ({
        length: 82,
        offset: 82 * index,
        index,
    }), []);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: appColors.background }]}>
                <View style={[styles.searchContainer, { backgroundColor: appColors.card }]}>
                    <Ionicons name="search" size={20} color={appColors.icon} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: appColors.text }]}
                        placeholder="Search contacts"
                        placeholderTextColor={appColors.icon}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <FlatList
                    data={[1, 2, 3, 4, 5]}
                    renderItem={() => <ContactSkeleton />}
                    keyExtractor={(item) => item.toString()}
                />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: appColors.background }]}>
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
                    placeholder="Search contacts"
                    placeholderTextColor={appColors.icon}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={filteredContacts}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                getItemLayout={getItemLayout}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        margin: 16,
        borderRadius: 12,
        borderWidth: 0.5,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        height: 82,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    contactDetails: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    phoneNumber: {
        fontSize: 14,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: StyleSheet.hairlineWidth,
        minWidth: 80,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 20,
    },
});