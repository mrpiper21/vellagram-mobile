import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Member {
    id: string;
    name: string;
    avatar: string;
    role: string;
    contributions: string;
    lastActive?: string;
}

const dummyMembers: Member[] = [
    {
        id: '1',
        name: 'John Doe',
        avatar: 'JD',
        role: 'Admin',
        contributions: "300",
        lastActive: "2 hours ago"
    },
    {
        id: '2',
        name: 'Jane Smith',
        avatar: 'JS',
        role: 'Member',
        contributions: "250",
        lastActive: "5 minutes ago"
    },
    {
        id: '3',
        name: 'Mike Johnson',
        avatar: 'MJ',
        role: 'Member',
        contributions: "180",
        lastActive: "1 day ago"
    },
    {
        id: '4',
        name: 'Sarah Williams',
        avatar: 'SW',
        role: 'Member',
        contributions: "150",
        lastActive: "3 hours ago"
    },
    {
        id: '5',
        name: 'David Brown',
        avatar: 'DB',
        role: 'Member',
        contributions: "120",
        lastActive: "Just now"
    },
];

interface MembersSheetProps {
    bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
}

const MembersSheet = ({ bottomSheetModalRef }: MembersSheetProps) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
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
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={["75%"]}
            backgroundStyle={{ backgroundColor: appColors.background }}
            handleIndicatorStyle={{ backgroundColor: appColors.icon }}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: appColors.text }]}>Members</Text>
                    <TouchableOpacity>
                        <Ionicons name="search-outline" size={24} color={appColors.text} />
                    </TouchableOpacity>
                </View>

                <BottomSheetScrollView style={styles.membersList}>
                    {dummyMembers.map((member, index) => (
                        <View
                            key={member.id}
                            style={[
                                styles.memberItem,
                                index !== dummyMembers.length - 1 && {
                                    borderBottomWidth: 0.5,
                                    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
                                },
                            ]}
                        >
                            <View style={styles.memberInfo}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{member.avatar}</Text>
                                </View>
                                <View style={styles.memberDetails}>
                                    <Text style={[styles.memberName, { color: appColors.text }]}>
                                        {member.name}
                                    </Text>
                                    <View style={styles.memberMeta}>
                                        <Text style={[styles.memberRole, { color: appColors.icon }]}>
                                            {member.role}
                                        </Text>
                                        <Text style={[styles.lastActive, { color: appColors.icon }]}>
                                            • {member.lastActive}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.contributionInfo}>
                                <Text style={[styles.contributionLabel, { color: appColors.text }]}>
                                    Contribution
                                </Text>
                                <Text style={[styles.contributionAmount, { color: appColors.tint }]}>
                                    GHS {member.contributions}
                                </Text>
                            </View>
                        </View>
                    ))}
                </BottomSheetScrollView>

                <View style={[styles.footer, { backgroundColor: appColors.card }]}>
                    <TouchableOpacity style={[styles.inviteButton, { backgroundColor: appColors.tint }]}>
                        <Ionicons name="person-add-outline" size={20} color="#fff" />
                        <Text style={styles.inviteButtonText}>Invite Member</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    membersList: {
        flex: 1,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#25D366",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    memberMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberRole: {
        fontSize: 14,
    },
    lastActive: {
        fontSize: 14,
        marginLeft: 4,
    },
    contributionInfo: {
        alignItems: 'flex-end',
    },
    contributionLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    contributionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 16,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(150, 150, 150, 0.2)',
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    inviteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MembersSheet; 