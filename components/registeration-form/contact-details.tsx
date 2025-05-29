import { IUserRegistrationData } from "@/@types/user-auth-types";
import { Colors } from "@/constants/Colors";
import { FC } from "react";
import { Text, TextInput, View } from "react-native";

interface Props {
    formData: IUserRegistrationData;
    updateFormData: (field: string, value: string) => void
}

const ContactDetails: FC<Props> = ({ formData, updateFormData }) => {
    return (
        <View style={{ padding: 18 }}>
            <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: Colors.light.text,
                marginBottom: 10
            }}>
                Contact Details
            </Text>
            <Text style={{
                fontSize: 16,
                color: Colors.light.icon,
                marginBottom: 30
            }}>
                How can we reach you?
            </Text>
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: Colors.light.border,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    marginBottom: 20,
                    backgroundColor: Colors.light.card
                }}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
            />
        </View>
    )
}

export default ContactDetails