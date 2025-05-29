import { IUserRegistrationData } from "@/@types/user-auth-types";
import { Alert } from "react-native";

export const useValidateSteps = ({currentStep, formData, walletChoice}: {currentStep: number, formData: IUserRegistrationData, walletChoice: string | null}) => {
    switch (currentStep) {
        case 1:
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.firstName.trim() || !formData.lastName.trim()) {
                Alert.alert('Error', 'Please enter your first and last name');
                return false;
            }
            if (!emailRegex.test(formData.email)) {
                Alert.alert('Error', 'Please enter a valid email address');
                return false;
            }
            return true;
        case 2:
            const phoneRegex = /^\+?[\d\s-()]+$/;
            if (!phoneRegex.test(formData.phone)) {
                Alert.alert('Error', 'Please enter a valid phone number');
                return false;
            }
            return true;
        case 3:
            if (formData.pin.length !== 4) {
                Alert.alert('Error', 'PIN must be 4 digits');
                return false;
            }
            if (formData.pin !== formData.confirmPin) {
                Alert.alert('Error', 'PINs do not match');
                return false;
            }
            return true;
        case 4:
            if (!walletChoice) {
                Alert.alert('Error', 'Please choose a wallet option');
                return false;
            }
            return true;
        default:
            return true;
    }
};