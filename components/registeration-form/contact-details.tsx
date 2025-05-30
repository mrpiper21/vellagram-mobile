import { IUserRegistrationData } from "@/@types/user-auth-types";
import { Colors } from "@/constants/Colors";
import { FC, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import PhoneInput, { ICountry } from 'react-native-international-phone-number';

interface Props {
    formData: IUserRegistrationData;
    updateFormData: (field: string, value: string) => void
}

const ContactDetails: FC<Props> = ({ formData, updateFormData }) => {
    const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(undefined);

    const handlePhoneChange = (phoneNumber: string) => {
        updateFormData('phone', phoneNumber);
    };

    const handleCountryChange = (country: ICountry) => {
        setSelectedCountry(country);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Contact Details
            </Text>
            <Text style={styles.subtitle}>
                How can we reach you?
            </Text>

            <View style={styles.phoneInputContainer}>
                <PhoneInput
                    value={formData.phone}
                    onChangePhoneNumber={handlePhoneChange}
                    selectedCountry={selectedCountry}
                    onChangeSelectedCountry={handleCountryChange}
                    defaultCountry="US"
                    placeholder="Phone Number"
                    phoneInputStyles={{
                        container: styles.phoneInput,
                        flagContainer: styles.flagContainer,
                        callingCode: styles.callingCode,
                        input: styles.input,
                    }}
                    modalStyles={{
                        countryButton: styles.countryButton,
                        countryName: styles.countryName,
                        callingCode: styles.modalCallingCode,
                        searchInput: styles.searchInput,
                    }}
                    modalSearchInputPlaceholder="Search countries..."
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.icon,
        marginBottom: 32
    },
    phoneInputContainer: {
        marginBottom: 20,
    },
    phoneInput: {
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        height: 56,
    },
    flagContainer: {
        backgroundColor: Colors.light.highlight,
        borderRadius: 8,
        marginLeft: 8,
    },
    callingCode: {
        color: Colors.light.text,
        fontWeight: '500',
    },
    input: {
        color: Colors.light.text,
        fontSize: 16,
        flex: 1,
        paddingHorizontal: 12,
    },
    // Modal styles
    searchInput: {
        backgroundColor: Colors.light.card,
        borderColor: Colors.light.border,
        color: Colors.light.text,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    countryButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.highlight,
    },
    countryName: {
        color: Colors.light.text,
        fontSize: 16,
    },
    modalCallingCode: {
        color: Colors.light.icon,
        fontSize: 14,
    },
});

export default ContactDetails;