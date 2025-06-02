import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterDropdownProps {
    visible: boolean;
    onClose: () => void;
    onSelectFilter: (type: 'date' | 'amount') => void;
    colorScheme: 'light' | 'dark';
}

const FilterOption = ({
    label,
    onPress,
    colorScheme
}: {
    label: string;
    onPress: () => void;
    colorScheme: 'light' | 'dark';
}) => {
    const appColors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[styles.filterOption, { borderBottomColor: appColors.border }]}
            onPress={onPress}
        >
            <Text style={[styles.filterOptionText, { color: appColors.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={appColors.icon} />
        </TouchableOpacity>
    );
};

export const FilterDropdown = ({ visible, onClose, onSelectFilter, colorScheme }: FilterDropdownProps) => {
    const appColors = Colors[colorScheme];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={onClose}
            >
                <View
                    style={[
                        styles.filterDropdown,
                        {
                            backgroundColor: appColors.card,
                            borderColor: appColors.border
                        }
                    ]}
                >
                    <FilterOption
                        label="Start Date"
                        onPress={() => onSelectFilter('date')}
                        colorScheme={colorScheme}
                    />
                    <FilterOption
                        label="Amount"
                        onPress={() => onSelectFilter('amount')}
                        colorScheme={colorScheme}
                    />
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 120,
        paddingRight: 16,
    },
    filterDropdown: {
        width: 200,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    filterOptionText: {
        fontSize: 16,
    },
}); 