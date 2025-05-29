import { IUserRegistrationData } from "@/@types/user-auth-types";
import { Colors } from "@/constants/Colors";
import { FC } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface Props {
    formData: IUserRegistrationData;
    updateFormData: (field: string, value: string) => void;
}

const PersonalInformation: FC<Props> = ({ formData, updateFormData }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Personal Information</Text>
                <Text style={styles.subtitle}>Let's start with your basic information</Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    placeholder="John"
                    placeholderTextColor={Colors.light.icon}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                    placeholder="Doe"
                    placeholderTextColor={Colors.light.icon}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    placeholder="john.doe@example.com"
                    placeholderTextColor={Colors.light.icon}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
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
});

export default PersonalInformation;