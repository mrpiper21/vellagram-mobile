import { IUserRegistrationData } from "@/@types/user-auth-types";
import { Colors } from "@/constants/Colors";
import { FC } from "react";
import { Text, TextInput, View } from "react-native";

interface Props {
    formData: IUserRegistrationData;
    updateFormData: (field: string, value: string) => void
}

const PinSetUp: FC<Props> = ({ formData, updateFormData }) => {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors.light.text,
                marginBottom: 10
            }}>
                PIN Setup
            </Text>
            <Text style={{
                fontSize: 16,
                color: Colors.light.icon,
                marginBottom: 30
            }}>
                Set up a 4-digit PIN for quick access
            </Text>

            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: Colors.light.border,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 18,
                    marginBottom: 16,
                    backgroundColor: Colors.light.card,
                    textAlign: 'center',
                    letterSpacing: 8
                }}
                placeholder="1234"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={formData.pin}
                onChangeText={(text) => updateFormData('pin', text)}
            />

            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: Colors.light.border,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 18,
                    marginBottom: 20,
                    backgroundColor: Colors.light.card,
                    textAlign: 'center',
                    letterSpacing: 8
                }}
                placeholder="Confirm PIN"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={formData.confirmPin}
                onChangeText={(text) => updateFormData('confirmPin', text)}
            />
        </View>
    )
}

export default PinSetUp