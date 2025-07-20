
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface RegistrationResponseModalProps {
  visible: boolean;
  success: boolean;
  message: string;
  onClose: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

const RegistrationResponseModal: React.FC<RegistrationResponseModalProps> = ({
  visible,
  success,
  message,
  onClose,
  onPrimaryAction,
  primaryActionLabel,
  onSecondaryAction,
  secondaryActionLabel,
}) => {
    const {theme} = useTheme()
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, {backgroundColor: theme.background}]}>
          <View style={styles.iconContainer}>
            {success ? (
              <Ionicons name="checkmark-circle" size={64} color={theme.success} />
            ) : (
              <Ionicons name="close-circle" size={64} color={'#ef4444'} />
            )}
          </View>
          <Text style={[styles.title, {color: theme.text}]}>
            {success ? "Registration Successful" : "Registration Failed"}
          </Text>
          <Text style={[styles.message, {color: theme.textSecondary}]}>{message}</Text>
          <View style={styles.actions}>
            {onPrimaryAction && primaryActionLabel && (
              <TouchableOpacity
                style={styles.button}
                onPress={onPrimaryAction}
              >
                <Text style={[styles.primaryButtonText, {color: theme.background}]}>{primaryActionLabel}</Text>
              </TouchableOpacity>
            )}
            {onSecondaryAction && secondaryActionLabel && (
              <TouchableOpacity
                style={[styles.button, {backgroundColor: theme.card}]}
                onPress={onSecondaryAction}
              >
                <Text style={[styles.secondaryButtonText, {color: theme.text}]}>{secondaryActionLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, {color: theme.textSecondary}]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  actions: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    fontWeight: "500",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  closeButtonText: {
    fontSize: 15,
  },
});

export default RegistrationResponseModal; 