import { useFilterSheet } from '@/app/context/FilterSheetContext';
import { useGroupDetails } from '@/app/context/GroupDetailsContext';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from "react-native";
import { FilterDropdown } from './components/FilterDropdown';
import { SavingGroupCard } from './components/SavingGroupCard';
import { SearchHeader } from './components/SearchHeader';

// Mock data for demonstration
const MOCK_GROUPS = [
    {
        id: '1',
        name: 'Family Savings',
        targetAmount: 5000,
        startDate: 'June 1, 2024',
        nextRepaymentDate: 'June 15, 2024',
        status: 'active' as const,
        memberCount: 5
    },
    {
        id: '2',
        name: 'Vacation Fund',
        targetAmount: 10000,
        startDate: 'July 15, 2024',
        status: 'pending' as const,
        memberCount: 3
    },
    {
        id: '3',
        name: 'Emergency Fund',
        targetAmount: 20000,
        startDate: 'May 1, 2024',
        nextRepaymentDate: 'May 15, 2024',
        status: 'active' as const,
        memberCount: 8
    }
];

const SavingGroups = () => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const [showFilter, setShowFilter] = useState(false);
    const { showGroupDetails } = useGroupDetails();
    const { showAmountSheet, showDateSheet } = useFilterSheet();

    const handleFilterSelect = (type: 'date' | 'amount') => {
        setShowFilter(false);
        if (type === 'date') {
            showDateSheet();
        } else {
            showAmountSheet();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <SearchHeader
                colorScheme={colorScheme}
                onFilterPress={() => setShowFilter(true)}
            />

            <FilterDropdown
                visible={showFilter}
                onClose={() => setShowFilter(false)}
                onSelectFilter={handleFilterSelect}
                colorScheme={colorScheme}
            />

            <FlatList
                data={MOCK_GROUPS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SavingGroupCard
                        {...item}
                        colorScheme={colorScheme}
                        onPress={() => showGroupDetails(item)}
                    />
                )}
                ItemSeparatorComponent={() => null}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default SavingGroups;