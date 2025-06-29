import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useCallback, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MembersSheet from "./MembersSheet";

interface GroupDetailsSheetProps {
    visible: boolean;
    onClose: () => void;
    groupName: string;
    groupAvatar: string;
    animation: Animated.Value;
    onChatPress: (memberId: string) => void;
}

export const GroupDetailsSheet: React.FC<GroupDetailsSheetProps> = ({
    visible,
    onClose,
    groupName,
    groupAvatar,
    animation,
    onChatPress
}) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];
    const membersSheetRef = useRef<BottomSheetModal>(null);
    const isAnimating = useRef(false);

    const handleMembersPress = useCallback(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        // First close the details sheet
        Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11
        }).start(() => {
            onClose();
            // Then open the members sheet after a short delay
            setTimeout(() => {
                membersSheetRef.current?.present();
                isAnimating.current = false;
            }, 300);
        });
    }, [animation, onClose]);

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={onClose}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                backgroundColor: appColors.card,
                                transform: [{
                                    translateY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [300, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        <View style={styles.header}>
                            <View style={styles.handle} />
                            <Text style={[styles.title, { color: appColors.text }]}>Group Details</Text>
                        </View>

                        <View style={styles.content}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{groupAvatar}</Text>
                                </View>
                                <Text style={[styles.groupName, { color: appColors.text }]}>{groupName}</Text>
                            </View>

                            <View style={styles.detailsList}>
                                <TouchableOpacity
                                    style={styles.detailItem}
                                    onPress={handleMembersPress}
                                >
                                    <Ionicons name="people-outline" size={24} color={appColors.text} />
                                    <View style={styles.detailText}>
                                        <Text style={[styles.detailLabel, { color: appColors.text }]}>Members</Text>
                                        <Text style={[styles.detailValue, { color: appColors.text }]}>12 members</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={appColors.text} />
                                </TouchableOpacity>

                                <View style={styles.detailItem}>
                                    <Ionicons name="calendar-outline" size={24} color={appColors.text} />
                                    <View style={styles.detailText}>
                                        <Text style={[styles.detailLabel, { color: appColors.text }]}>Created</Text>
                                        <Text style={[styles.detailValue, { color: appColors.text }]}>June 10, 2024</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <Ionicons name="flag-outline" size={24} color={appColors.text} />
                                    <View style={styles.detailText}>
                                        <Text style={[styles.detailLabel, { color: appColors.text }]}>Saving Goal</Text>
                                        <Text style={[styles.detailValue, { color: appColors.text }]}>GHS 24,000</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <Ionicons name="cash-outline" size={24} color={appColors.text} />
                                    <View style={styles.detailText}>
                                        <Text style={[styles.detailLabel, { color: appColors.text }]}>Total Savings</Text>
                                        <Text style={[styles.detailValue, { color: appColors.text }]}>GHS 2,000</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <Ionicons name="trending-up-outline" size={24} color={appColors.text} />
                                    <View style={styles.detailText}>
                                        <Text style={[styles.detailLabel, { color: appColors.text }]}>Progress</Text>
                                        <Text style={[styles.detailValue, { color: appColors.text }]}>8.3% of goal</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            <MembersSheet
                bottomSheetModalRef={membersSheetRef}
            />
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 400,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        borderRadius: 2,
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#25D366",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 32,
    },
    groupName: {
        fontSize: 24,
        fontWeight: '600',
    },
    detailsList: {
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    detailText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        marginTop: 2,
    },
}); 