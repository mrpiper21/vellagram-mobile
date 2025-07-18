import useFormStore from "@/store/useFormStore";
import React from "react";
import { Keyboard, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from "react-native";

interface EncryptionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (num: number) => void;
    theme: any;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({ visible, onClose, onSelect, theme }) => {
    const window = useWindowDimensions();
    const {setFormValues} = useFormStore(['setFormValues']);

    React.useEffect(() => {
        if (visible) {
            Keyboard.dismiss();
        }
    }, [visible]);

    const handleSelect = (num: number) => {
        setFormValues("key", num)
        Keyboard.dismiss();
        onSelect(num);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <SafeAreaView style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 60,
                width: window.width,
                alignItems: 'center',
            }}>
                <View style={[styles.encryptModal, { backgroundColor: theme.card, borderColor: theme.border, width: window.width - 24 }]}>  
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Encrypt message with:</Text>
                    <View style={styles.numbersRow}>
                        {[3,4,5,6,7,8,9].map(num => (
                            <TouchableOpacity
                                key={num}
                                style={[styles.numberButton, { backgroundColor: theme.tint }]}
                                onPress={() => handleSelect(num)}
                            >
                                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    encryptModal: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        zIndex: 100,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    numbersRow: {
        flexDirection: 'row',
        gap: 4,
        width: '100%',
        flexWrap: 'wrap'
    },
    numberButton: {
        marginHorizontal: 6,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
}); 