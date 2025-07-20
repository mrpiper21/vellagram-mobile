import { DecryptText } from "@/helpers/cypher";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";

const { height } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.95;

interface CustomPasscodeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  userPin: string;
  encryptedText: string;
  encryptionKey: string;
  onDecypher: (decyphered: string) => void;
}

const OFFSET = 20;
const TIME = 80;

const CustomPasscodeBottomSheet: React.FC<CustomPasscodeBottomSheetProps> = ({
  visible,
  onClose,
  userPin,
  encryptedText,
  encryptionKey,
  onDecypher,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setPin("");
      setError("");
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNumberPress = (num: number) => {
    if (pin.length < 4) {
      setPin(pin + num);
      setError("");
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  const handleSubmit = useCallback(
    (submittedPin: string) => {
      if (submittedPin === userPin) {
        const decyphered = DecryptText(encryptedText, Number(encryptionKey));
        onDecypher(decyphered);
        onClose();
      } else {
        Animated.sequence([
          Animated.timing(offset, { toValue: -OFFSET, duration: TIME / 2, useNativeDriver: true }),
          Animated.timing(offset, { toValue: OFFSET, duration: TIME, useNativeDriver: true }),
          Animated.timing(offset, { toValue: -OFFSET, duration: TIME, useNativeDriver: true }),
          Animated.timing(offset, { toValue: OFFSET, duration: TIME, useNativeDriver: true }),
          Animated.timing(offset, { toValue: 0, duration: TIME / 2, useNativeDriver: true }),
        ]).start();
        Vibration.vibrate([0, 500, 200, 500]);
        setError("Incorrect passcode. Try again.");
        setPin("");
      }
    },
    [userPin, encryptedText, encryptionKey, onDecypher, onClose]
  );

  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit(pin);
    }
  }, [pin, handleSubmit]);

  const handleBiometric = async () => {
    try {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to decypher text"
      });
      if (success) {
        const decyphered = DecryptText(encryptedText, Number(encryptionKey));
        onDecypher(decyphered);
        onClose();
      }
    } catch {
      setError("Biometric authentication failed");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }], height: SHEET_HEIGHT },
          ]}
        >
          <Text style={styles.title}>Enter Passcode</Text>
          <Text style={styles.subtitle}>Enter your 4-digit PIN or use biometrics to decypher this message.</Text>
          <Animated.View style={[styles.pinDotsContainer, { transform: [{ translateX: offset }] }]}> 
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  { backgroundColor: i < pin.length ? "#4F8EF7" : "#eee" },
                ]}
              />
            ))}
          </Animated.View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.numberPad}>
            <View style={styles.numberRow}>
              {[1, 2, 3].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(num)}
                  disabled={pin.length === 4}
                >
                  <Text style={styles.number}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.numberRow}>
              {[4, 5, 6].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(num)}
                  disabled={pin.length === 4}
                >
                  <Text style={styles.number}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.numberRow}>
              {[7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(num)}
                  disabled={pin.length === 4}
                >
                  <Text style={styles.number}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.numberRow}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={handleBiometric}
              >
                <Ionicons name="finger-print" size={24} color="#222" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => handleNumberPress(0)}
                disabled={pin.length === 4}
              >
                <Text style={styles.number}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={handleDelete}
                disabled={pin.length === 0}
              >
                <Ionicons name="backspace" size={24} color="#222" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    paddingBottom: 36,
    minHeight: 320,
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, marginBottom: 24, textAlign: "center" },
  pinDotsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 16 },
  pinDot: { width: 16, height: 16, borderRadius: 8, marginHorizontal: 8, backgroundColor: "#eee" },
  error: { color: "red", marginBottom: 8, textAlign: "center" },
  numberPad: { marginBottom: 24 },
  numberRow: { flexDirection: "row", justifyContent: "center", marginBottom: 12 },
  numberButton: { width: 64, height: 64, borderRadius: 32, margin: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#f4f4f4" },
  number: { fontSize: 24, fontWeight: "600", color: "#222" },
  closeButton: { alignSelf: "center", marginTop: 8 },
  closeButtonText: { color: "#4F8EF7", fontSize: 16 },
});

export default CustomPasscodeBottomSheet; 