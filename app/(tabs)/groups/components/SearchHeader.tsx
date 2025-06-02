import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchHeaderProps {
    colorScheme: 'light' | 'dark';
    onFilterPress: () => void;
}

export const SearchHeader = ({ colorScheme, onFilterPress }: SearchHeaderProps) => {
    const appColors = Colors[colorScheme];

    return (
        <View style={[styles.header, { backgroundColor: appColors.card }]}>
            <View style={styles.searchRow}>
                <View style={[styles.searchContainer, { flex: 1 }]}>
                    <Ionicons name="search" size={20} color={appColors.icon} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search groups..."
                        placeholderTextColor={appColors.icon}
                        style={[styles.searchInput, { color: appColors.text }]}
                    />
                </View>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        {
                            borderColor: appColors.border,
                            backgroundColor: appColors.card
                        }
                    ]}
                    onPress={onFilterPress}
                >
                    <Ionicons name="options-outline" size={20} color={appColors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
}); 