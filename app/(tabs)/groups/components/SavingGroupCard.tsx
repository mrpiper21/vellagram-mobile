import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SavingGroupCardProps {
    id: string;
    name: string;
    targetAmount: number;
    startDate: string;
    nextRepaymentDate?: string;
    status: 'active' | 'pending';
    memberCount: number;
    colorScheme: 'light' | 'dark';
    onPress: () => void;
}

export const SavingGroupCard = ({
    id,
    name,
    targetAmount,
    startDate,
    nextRepaymentDate,
    status,
    memberCount,
    colorScheme,
    onPress
}: SavingGroupCardProps) => {
    const appColors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: appColors.background,
                    borderBottomColor: appColors.border
                }
            ]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: appColors.tint }]}>
                    <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                </View>
                <View style={[styles.memberCountBadge, { backgroundColor: appColors.tint }]}>
                    <Text style={styles.memberCountText}>{memberCount}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.nameContainer}>
                        <Text style={[styles.groupName, { color: appColors.text }]}>
                            {name}
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: status === 'active' ? appColors.tint : appColors.tabIconDefault }
                        ]}>
                            <Text style={styles.statusText}>
                                {status === 'active' ? 'Active' : 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.amountContainer}>
                        <Text style={[styles.infoLabel, { color: appColors.icon }]}>
                            Target Amount
                        </Text>
                        <View style={[styles.amountBadge, { backgroundColor: appColors.tint }]}>
                            <Text style={styles.amountText}>GHS {targetAmount.toLocaleString()}</Text>
                        </View>
                    </View>
                    <View style={styles.dateContainer}>
                        <Text style={[styles.infoLabel, { color: appColors.icon }]}>
                            {status === 'active' ? 'Next Payment' : 'Start Date'}
                        </Text>
                        <Text style={[styles.dateText, { color: appColors.text }]}>
                            {status === 'active' ? nextRepaymentDate : startDate}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        marginRight: 12,
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    memberCountBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
    },
    memberCountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nameContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    amountContainer: {
        flex: 1,
        gap: 4,
    },
    dateContainer: {
        alignItems: 'flex-end',
        gap: 4,
    },
    infoLabel: {
        fontSize: 12,
    },
    amountBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    amountText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
}); 