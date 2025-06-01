import { IUserRegistrationData } from '@/@types/user-auth-types';
import RenderRegisterProgressBar from '@/components/progress-bar/render-register-progressbar';
import AccountInfo from '@/components/registeration-form/account-info';
import PersonalInformation from '@/components/registeration-form/personal-info';
import PinSetUp from '@/components/registeration-form/pin-setup';
import WalletSetUp from '@/components/registeration-form/wallet-setUp';
import { API_ENDPOINTS } from '@/config/api';
import { Colors } from '@/constants/Colors';
import { useValidateSteps } from '@/hooks/useValidateSteps';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import useFormStore from '../store/useFormStore';

const RegisterScreen = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState<boolean>(false)
    const { setFormValue } = useFormStore();
    const [formData, setFormData] = useState<IUserRegistrationData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        pin: '',
        confirmPin: '',
        profilePicture: null,
        walletAddress: null,
        groups: []
    });

    const [walletChoice, setWalletChoice] = useState<string | null>(null);

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (useValidateSteps({ currentStep, formData, walletChoice })) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const previousStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const registrationData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                phone: formData.phone,
                pin: formData.pin,
                confirmPin: formData.confirmPin
            };

            const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, registrationData);

            if (response.data.success) {
                setFormValue("user", response.data.user)
                router.push({
                    pathname: "/auth/OtpAuthScreen",
                    params: { email: formData.email }
                });
            } else {
                Alert.alert('Error', response.data.message || 'Registration failed. Please try again.');
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to create account. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <PersonalInformation formData={formData} updateFormData={updateFormData} />
            case 2:
                return <AccountInfo formData={formData} updateFormData={updateFormData} />
            case 3:
                return <PinSetUp formData={formData} updateFormData={updateFormData} />
            case 4:
                return <WalletSetUp formData={formData} setWalletChoice={setWalletChoice} walletChoice={walletChoice} updateFormData={updateFormData} />
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.light.background, paddingTop: 35 }}>
            <RenderRegisterProgressBar currentStep={currentStep} totalSteps={4} />
            <ScrollView style={{ flex: 1 }}>
                {renderStep()}
            </ScrollView>
            <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
                {currentStep > 1 && (
                    <TouchableOpacity
                        style={{
                            padding: 16,
                            borderRadius: 8,
                            backgroundColor: Colors.light.card,
                            flex: 1,
                            marginRight: 8,
                            alignItems: 'center'
                        }}
                        onPress={previousStep}
                    >
                        <Text style={{ color: Colors.light.text }}>Previous</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={{
                        padding: 16,
                        borderRadius: 8,
                        backgroundColor: Colors.light.tint,
                        flex: 1,
                        marginLeft: currentStep > 1 ? 8 : 0,
                        alignItems: 'center',
                        opacity: loading ? 0.7 : 1
                    }}
                    onPress={currentStep === 4 ? handleRegister : nextStep}
                    disabled={loading}
                >
                    <Text style={{ color: Colors.light.background }}>
                        {loading ? 'Processing...' : currentStep === 4 ? 'Complete' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RegisterScreen;