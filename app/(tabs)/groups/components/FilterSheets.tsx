import { useAppTheme } from '@/context/ThemeContext';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AmountFilterSheetProps {
    isAmountSheetVisible: boolean;
    onAmountSheetClose: () => void;
}

interface DateFilterSheetProps {
    isDateSheetVisible: boolean;
    onDateSheetClose: () => void;
}

export const useFilterSheets = () => {
    const amountSheetRef = useRef<BottomSheet>(null);
    const dateSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['80%'], []);

    const handleAmountSheetClose = useCallback(() => {
        amountSheetRef.current?.close();
    }, []);

    const handleDateSheetClose = useCallback(() => {
        dateSheetRef.current?.close();
    }, []);

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

    return {
        amountSheetRef,
        dateSheetRef,
        snapPoints,
        handleAmountSheetClose,
        handleDateSheetClose,
        renderBackdrop,
    };
};

export const AmountFilterSheet = ({
    isAmountSheetVisible,
    onAmountSheetClose
}: AmountFilterSheetProps) => {
    const theme = useAppTheme();
    const { amountSheetRef, snapPoints, renderBackdrop } = useFilterSheets();
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
   

    return (
        <BottomSheet
            ref={amountSheetRef}
            index={isAmountSheetVisible ? 0 : -1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onAmountSheetClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: theme.card }}
            handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        >
            <BottomSheetView style={styles.bottomSheetContent}>
                <Text style={[styles.bottomSheetTitle, { color: theme.text }]}>Filter by Amount</Text>
                <View style={styles.amountInputs}>
                    <View style={styles.amountInputContainer}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Minimum Amount</Text>
                        <TextInput
                            style={[styles.amountInput, {
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border
                            }]}
                            placeholder="0"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={minAmount}
                            onChangeText={setMinAmount}
                        />
                    </View>
                    <View style={styles.amountInputContainer}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>Maximum Amount</Text>
                        <TextInput
                            style={[styles.amountInput, {
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border
                            }]}
                            placeholder="0"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={maxAmount}
                            onChangeText={setMaxAmount}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: theme.tint }]}
                    onPress={onAmountSheetClose}
                >
                    <Text style={styles.applyButtonText}>Apply Filter</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheet>
    );
};

export const DateFilterSheet = ({
    isDateSheetVisible,
    onDateSheetClose
}: DateFilterSheetProps) => {
    const theme = useAppTheme();
    const { dateSheetRef, snapPoints, renderBackdrop } = useFilterSheets();
    const [startDate, setStartDate] = useState(new Date());

    return (
        <BottomSheet
            ref={dateSheetRef}
            index={isDateSheetVisible ? 0 : -1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={onDateSheetClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{ backgroundColor: theme.card }}
            handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        >
            <BottomSheetView style={styles.bottomSheetContent}>
                <Text style={[styles.bottomSheetTitle, { color: theme.text }]}>Filter by Start Date</Text>
                <View style={styles.datePickerContainer}>
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                            setStartDate(selectedDate || startDate);
                        }}
                        textColor={theme.text}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: theme.tint }]}
                    onPress={onDateSheetClose}
                >
                    <Text style={styles.applyButtonText}>Apply Filter</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    bottomSheetContent: {
        padding: 16,
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 24,
    },
    amountInputs: {
        gap: 16,
    },
    amountInputContainer: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    amountInput: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    datePickerContainer: {
        marginBottom: 24,
    },
    applyButton: {
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 