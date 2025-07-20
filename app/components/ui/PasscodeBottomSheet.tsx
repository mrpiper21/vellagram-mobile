import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import * as LocalAuthentication from "expo-local-authentication";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface PasscodeBottomSheetProps {
  onClose: () => void;
  onSuccess: (pinOrBiometric: string) => void;
}

const PasscodeBottomSheet = forwardRef<any, PasscodeBottomSheetProps>(
  ({ onClose, onSuccess }, ref) => {
    const { theme } = useTheme();
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      expand: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const handleNumberPress = (num: number) => {
      if (pin.length < 4) {
        setPin(pin + num);
        setError("");
      }
    };

    const handleDelete = () => setPin(pin.slice(0, -1));

    const handleBiometric = async () => {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to decypher text",
          fallbackLabel: "Use Passcode",
        });
        if (result.success) {
          onSuccess("biometric");
          onClose();
        } else {
          setError("Biometric authentication failed");
        }
      } catch {
        setError("Biometric authentication not available");
      }
    };

    React.useEffect(() => {
      if (pin.length === 4) {
        onSuccess(pin);
        onClose();
      }
    }, [pin]);

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["95%"]}
          enablePanDownToClose
          onClose={onClose}
          backgroundStyle={{ backgroundColor: theme.background }}
          backdropComponent={props => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              pressBehavior="close"
              opacity={0.5}
            />
          )}
        >
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={[styles.title, { color: theme.text }]}>Enter Passcode</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Enter your 4-digit PIN or use biometrics to decypher this message.</Text>
            <View style={styles.pinDotsContainer}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: i < pin.length ? theme.tint : theme.card,
                      borderColor: theme.border,
                    },
                  ]}
                />
              ))}
            </View>
            {error ? (
              <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
            ) : null}
            <View style={styles.numberPad}>
              <View style={styles.numberRow}>
                {[1, 2, 3].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.numberButton, { backgroundColor: theme.card }]}
                    onPress={() => handleNumberPress(num)}
                    disabled={pin.length === 4}
                  >
                    <Text style={[styles.number, { color: theme.text }]}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.numberRow}>
                {[4, 5, 6].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.numberButton, { backgroundColor: theme.card }]}
                    onPress={() => handleNumberPress(num)}
                    disabled={pin.length === 4}
                  >
                    <Text style={[styles.number, { color: theme.text }]}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.numberRow}>
                {[7, 8, 9].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.numberButton, { backgroundColor: theme.card }]}
                    onPress={() => handleNumberPress(num)}
                    disabled={pin.length === 4}
                  >
                    <Text style={[styles.number, { color: theme.text }]}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.numberRow}>
                <View style={styles.numberButton} />
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.card }]}
                  onPress={() => handleNumberPress(0)}
                  disabled={pin.length === 4}
                >
                  <Text style={[styles.number, { color: theme.text }]}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.numberButton, { backgroundColor: theme.card }]}
                  onPress={handleDelete}
                  disabled={pin.length === 0}
                >
                  <Ionicons name="backspace" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.biometricButton, { backgroundColor: theme.tint }]}
              onPress={handleBiometric}
            >
              <Ionicons name="finger-print" size={24} color={theme.background} />
              <Text style={{ color: theme.background, marginLeft: 8 }}>Use Biometrics</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  }
);

const styles = StyleSheet.create({
	title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
	subtitle: { fontSize: 15, marginBottom: 24, textAlign: "center" },
	pinDotsContainer: { flexDirection: "row", marginBottom: 16 },
	pinDot: {
		width: 16,
		height: 16,
		borderRadius: 8,
		marginHorizontal: 8,
		borderWidth: 1,
	},
	numberPad: { marginBottom: 24 },
	numberRow: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 12,
	},
	numberButton: {
		width: 64,
		height: 64,
		borderRadius: 32,
		margin: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	number: { fontSize: 24, fontWeight: "600" },
	biometricButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 8,
	},
});

export default PasscodeBottomSheet;
