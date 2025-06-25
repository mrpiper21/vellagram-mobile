import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import PhoneInput, { ICountry } from 'react-native-international-phone-number';

interface PersonalInfoProps {
    formData: {
        firstName: string;
        lastName: string;
        phone: string;
    };
    updateFormData: (field: string, value: string) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ formData, updateFormData }) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];
    const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(undefined);

    const handlePhoneChange = (phoneNumber: string) => {
        updateFormData('phone', phoneNumber);
    };

    const handleCountryChange = (country: ICountry) => {
        setSelectedCountry(country);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: appColors.text }]}>Personal Information</Text>
                <Text style={[styles.subtitle, { color: appColors.icon }]}>
                    Let's start with your basic information
                </Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: appColors.text }]}>First Name</Text>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: appColors.card,
                        color: appColors.text,
                        borderColor: appColors.border
                    }]}
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    placeholder="John"
                    placeholderTextColor={appColors.icon}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: appColors.text }]}>Last Name</Text>
                <TextInput
                    style={[styles.input, {
                        backgroundColor: appColors.card,
                        color: appColors.text,
                        borderColor: appColors.border
                    }]}
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                    placeholder="Doe"
                    placeholderTextColor={appColors.icon}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: appColors.text }]}>Phone Number</Text>
                <PhoneInput
                    value={formData.phone}
                    onChangePhoneNumber={handlePhoneChange}
                    selectedCountry={selectedCountry}
                    onChangeSelectedCountry={handleCountryChange}
                    defaultCountry="GH"
                    placeholder="Enter phone number"
                    phoneInputStyles={{
                        container: [styles.phoneInput, {
                            backgroundColor: appColors.card,
                            borderColor: appColors.border
                        }],
                        flagContainer: styles.flagContainer,
                        callingCode: { color: appColors.text },
                        input: { color: appColors.text }
                    }}
                    modalStyles={{
                        countryButton: styles.countryButton,
                        countryName: { color: appColors.text },
                        callingCode: { color: appColors.icon },
                        searchInput: {
                            backgroundColor: appColors.card,
                            borderColor: appColors.border,
                            color: appColors.text
                        }
                    }}
                    modalSearchInputPlaceholder="Search countries..."
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.light.icon,
        lineHeight: 22,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.text,
        marginBottom: 8,
    },
    input: {
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.light.border,
        backgroundColor: Colors.light.card,
        fontSize: 16,
        color: Colors.light.text,
    },
    phoneInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    flagContainer: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        marginLeft: 8,
    },
    countryButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
});

export default PersonalInfo;