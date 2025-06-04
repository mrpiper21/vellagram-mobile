import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GroupDetailsSheetProps {
    isVisible: boolean;
    onClose: () => void;
    colorScheme: 'light' | 'dark';
    group: {
        id: string;
        name: string;
        targetAmount: number;
        startDate: string;
        nextRepaymentDate?: string;
        status: 'active' | 'pending';
        memberCount: number;
    };
}

export const GroupDetailsSheet = ({
    isVisible,
    onClose,
    colorScheme,
    group
}: GroupDetailsSheetProps) => {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['75%'], []);
    const appColors = Colors[colorScheme];

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

    return (
        <BottomSheet
            ref={sheetRef}
            index={isVisible ? 0 : -1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: appColors.card }}
            handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        >
            <BottomSheetView style={styles.container}>
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: appColors.tint }]}>
                        <Text style={styles.avatarText}>{group.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.headerContent}>
                        <Text style={[styles.groupName, { color: appColors.text }]}>
                            {group.name}
                        </Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: group.status === 'active' ? appColors.tint : appColors.tabIconDefault }
                        ]}>
                            <Text style={styles.statusText}>
                                {group.status === 'active' ? 'Active' : 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: appColors.icon }]}>
                                Target Amount
                            </Text>
                            <Text style={[styles.infoValue, { color: appColors.text }]}>
                                GHS {group.targetAmount.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: appColors.icon }]}>
                                Members
                            </Text>
                            <View style={styles.memberCount}>
                                <Ionicons name="people" size={16} color={appColors.icon} />
                                <Text style={[styles.infoValue, { color: appColors.text }]}>
                                    {group.memberCount}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={[styles.infoLabel, { color: appColors.icon }]}>
                                Start Date
                            </Text>
                            <Text style={[styles.infoValue, { color: appColors.text }]}>
                                {group.startDate}
                            </Text>
                        </View>
                        {group.status === 'active' && (
                            <View style={styles.infoItem}>
                                <Text style={[styles.infoLabel, { color: appColors.icon }]}>
                                    Next Payment
                                </Text>
                                <Text style={[styles.infoValue, { color: appColors.text }]}>
                                    {group.nextRepaymentDate}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.joinButton, { backgroundColor: appColors.tint }]}
                    onPress={() => {
                        // Handle join group
                        onClose();
                    }}
                >
                    <Text style={styles.joinButtonText}>Join Group</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 24,
        fontWeight: '600',
    },
    headerContent: {
        flex: 1,
        gap: 8,
    },
    groupName: {
        fontSize: 24,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    infoSection: {
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    infoItem: {
        flex: 1,
        gap: 4,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    memberCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    joinButton: {
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    joinButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 