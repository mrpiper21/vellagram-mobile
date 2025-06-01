import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Member {
    id: string;
    name: string;
    avatar: string;
    role: string;
    contributions: string;
}

const dummyMembers: Member[] = [
    { id: '1', name: 'John Doe', avatar: 'JD', role: 'Admin', contributions: "300" },
    { id: '2', name: 'Jane Smith', avatar: 'JS', role: 'Member', contributions: "250" },
    { id: '3', name: 'Mike Johnson', avatar: 'MJ', role: 'Member', contributions: "180" },
    { id: '4', name: 'Sarah Williams', avatar: 'SW', role: 'Member', contributions: "150" },
    { id: '5', name: 'David Brown', avatar: 'DB', role: 'Member', contributions: "120" },
];

const Wallet = () => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState(2500.00);

    const handleConnect = () => {
        setIsConnected(!isConnected);
    };

    const handleWithdraw = () => {
        // Handle withdrawal
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: appColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: appColors.card }]}>
                <Text style={[styles.headerTitle, { color: appColors.text }]}>Wallet</Text>
                <TouchableOpacity
                    style={[
                        styles.connectButton,
                        { backgroundColor: isConnected ? appColors.tint : 'rgba(150, 150, 150, 0.2)' }
                    ]}
                    onPress={handleConnect}
                >
                    <Ionicons
                        name={isConnected ? "link" : "link-outline"}
                        size={20}
                        color={isConnected ? "#fff" : appColors.text}
                    />
                    <Text style={[
                        styles.connectButtonText,
                        { color: isConnected ? "#fff" : appColors.text }
                    ]}>
                        {isConnected ? "Connected" : "Connect"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <View style={[styles.balanceCard, { backgroundColor: appColors.card }]}>
                <View style={styles.balanceHeader}>
                    <Text style={[styles.balanceLabel, { color: appColors.text }]}>Available Balance</Text>
                    <TouchableOpacity>
                        <Ionicons name="eye-outline" size={24} color={appColors.text} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.balanceAmount, { color: appColors.text }]}>
                    GHS {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: appColors.text }]}>Total Contributions</Text>
                        <Text style={[styles.statValue, { color: appColors.tint }]}>
                            GHS 5,000.00
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: appColors.text }]}>Wallet ID</Text>
                        <View style={styles.walletIdContainer}>
                            <Text style={[styles.walletId, { color: appColors.text }]}>
                                VEDY-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                            </Text>
                            <TouchableOpacity style={styles.copyButton}>
                                <Ionicons name="copy-outline" size={16} color={appColors.tint} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.balanceActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: appColors.tint }]}
                        onPress={handleWithdraw}
                    >
                        <Ionicons name="cash-outline" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Withdraw</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: 'rgba(150, 150, 150, 0.2)' }]}
                    >
                        <Ionicons name="swap-horizontal-outline" size={20} color={appColors.text} />
                        <Text style={[styles.actionButtonText, { color: appColors.text }]}>Transfer</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Recent Transactions */}
            <View style={styles.transactionsContainer}>
                <View style={styles.transactionsHeader}>
                    <Text style={[styles.transactionsTitle, { color: appColors.text }]}>Recent Transactions</Text>
                    <TouchableOpacity>
                        <Text style={[styles.viewAllText, { color: appColors.tint }]}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Transaction List */}
                <View style={[styles.transactionList, { backgroundColor: appColors.card }]}>
                    {[1, 2, 3].map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.transactionItem,
                                index !== 2 && { borderBottomWidth: 0.5, borderBottomColor: 'rgba(150, 150, 150, 0.2)' }
                            ]}
                        >
                            <View style={styles.transactionIcon}>
                                <Ionicons
                                    name={index % 2 === 0 ? "arrow-down" : "arrow-up"}
                                    size={20}
                                    color={index % 2 === 0 ? "#4CAF50" : "#FF5252"}
                                />
                            </View>
                            <View style={styles.transactionDetails}>
                                <Text style={[styles.transactionTitle, { color: appColors.text }]}>
                                    {index % 2 === 0 ? "Received" : "Sent"}
                                </Text>
                                <Text style={[styles.transactionDate, { color: appColors.icon }]}>
                                    {index % 2 === 0 ? "From John Doe" : "To Jane Smith"}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.transactionAmount,
                                    { color: index % 2 === 0 ? "#4CAF50" : "#FF5252" }
                                ]}
                            >
                                {index % 2 === 0 ? "+" : "-"}GHS 500.00
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
        paddingTop: 40
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    connectButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    balanceCard: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balanceLabel: {
        fontSize: 16,
        opacity: 0.7,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 12,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: 'rgba(150, 150, 150, 0.2)',
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(150, 150, 150, 0.2)',
        marginHorizontal: 12,
    },
    walletIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    walletId: {
        fontSize: 14,
        fontWeight: '500',
    },
    copyButton: {
        padding: 4,
    },
    balanceActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    transactionsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    transactionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    transactionsTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    transactionList: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 14,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '600',
    },
    membersContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    membersHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    membersTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    membersList: {
        borderRadius: 16,
        overflow: 'hidden',
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
    memberRole: {
        fontSize: 14,
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
});

export default Wallet;