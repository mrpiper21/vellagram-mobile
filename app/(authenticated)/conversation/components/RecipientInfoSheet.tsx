import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { RecipientInfo } from "@/types/conversation";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RecipientInfoSheetProps {
    recipientInfo: RecipientInfo;
}

export interface RecipientInfoSheetRef {
    present: () => void;
    dismiss: () => void;
}

const RecipientInfoSheet = forwardRef<RecipientInfoSheetRef, RecipientInfoSheetProps>(
    ({ recipientInfo }, ref) => {
        const { theme } = useTheme();
        const colorScheme = theme.isDark ? "dark" : "light";
        const appColors = Colors[colorScheme];
        const bottomSheetRef = useRef<BottomSheetModal>(null);

        useImperativeHandle(ref, () => ({
            present: () => bottomSheetRef.current?.present(),
            dismiss: () => bottomSheetRef.current?.dismiss(),
        }));

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                />
            ),
            []
        );

        const getInitials = (name: string) => {
            return name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2);
        };

        return (
            <BottomSheetModal
                ref={bottomSheetRef}
                snapPoints={["95%"]}
                backgroundStyle={{ backgroundColor: appColors.background }}
                handleIndicatorStyle={{ backgroundColor: appColors.icon }}
                backdropComponent={renderBackdrop}
                enablePanDownToClose
            >
                <BottomSheetScrollView style={styles.container}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            {recipientInfo.profile ? (
                                <Image
                                    source={{ uri: recipientInfo.profile }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={[styles.profileImagePlaceholder, { backgroundColor: appColors.tint }]}>
                                    <Text style={styles.profileImageText}>
                                        {getInitials(recipientInfo.name)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={[styles.recipientName, { color: appColors.text }]}>
                            {recipientInfo.name}
                        </Text>

                        <View style={styles.statusContainer}>
                            <View style={[
                                styles.statusIndicator,
                                { backgroundColor: recipientInfo.isOnline ? '#25D366' : appColors.icon }
                            ]} />
                            <Text style={[styles.statusText, { color: appColors.icon }]}>
                                {recipientInfo.isOnline ? 'Online' : recipientInfo.lastSeen || 'Offline'}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: appColors.card }]}>
                            <Ionicons name="call-outline" size={24} color={appColors.text} />
                            <Text style={[styles.actionButtonText, { color: appColors.text }]}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: appColors.card }]}>
                            <Ionicons name="videocam-outline" size={24} color={appColors.text} />
                            <Text style={[styles.actionButtonText, { color: appColors.text }]}>Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: appColors.card }]}>
                            <Ionicons name="search-outline" size={24} color={appColors.text} />
                            <Text style={[styles.actionButtonText, { color: appColors.text }]}>Search</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info Details */}
                    <View style={styles.infoSection}>
                        <Text style={[styles.sectionTitle, { color: appColors.text }]}>Contact Info</Text>

                        {recipientInfo.phoneNumber && (
                            <View style={styles.infoItem}>
                                <View style={[styles.infoIcon, { backgroundColor: appColors.card }]}>
                                    <Ionicons name="call-outline" size={20} color={appColors.text} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: appColors.icon }]}>Phone</Text>
                                    <Text style={[styles.infoValue, { color: appColors.text }]}>
                                        {recipientInfo.phoneNumber}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {recipientInfo.email && (
                            <View style={styles.infoItem}>
                                <View style={[styles.infoIcon, { backgroundColor: appColors.card }]}>
                                    <Ionicons name="mail-outline" size={20} color={appColors.text} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: appColors.icon }]}>Email</Text>
                                    <Text style={[styles.infoValue, { color: appColors.text }]}>
                                        {recipientInfo.email}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: appColors.card }]}>
                                <Ionicons name="person-outline" size={20} color={appColors.text} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: appColors.icon }]}>User ID</Text>
                                <Text style={[styles.infoValue, { color: appColors.text }]}>
                                    {recipientInfo.id || 'Not available'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Additional Actions */}
                    <View style={styles.additionalActions}>
                        <TouchableOpacity style={[styles.additionalAction, { backgroundColor: appColors.card }]}>
                            <Ionicons name="share-outline" size={20} color={appColors.text} />
                            <Text style={[styles.additionalActionText, { color: appColors.text }]}>
                                Share Contact
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.additionalAction, { backgroundColor: appColors.card }]}>
                            <Ionicons name="star-outline" size={20} color={appColors.text} />
                            <Text style={[styles.additionalActionText, { color: appColors.text }]}>
                                Add to Favorites
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.additionalAction, { backgroundColor: appColors.card }]}>
                            <Ionicons name="notifications-outline" size={20} color={appColors.text} />
                            <Text style={[styles.additionalActionText, { color: appColors.text }]}>
                                Mute Notifications
                            </Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    }
);

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
        marginBottom: 20,
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    recipientName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    actionButton: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        minWidth: 80,
    },
    actionButtonText: {
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
    infoSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(150, 150, 150, 0.1)',
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    additionalActions: {
        gap: 12,
        marginBottom: 30,
    },
    additionalAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 12,
    },
    additionalActionText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

RecipientInfoSheet.displayName = 'RecipientInfoSheet';

export default RecipientInfoSheet; 