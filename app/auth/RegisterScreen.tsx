import { IUserRegistrationData } from '@/@types/user-auth-types';
import RenderRegisterProgressBar from '@/components/progress-bar/render-register-progressbar';
import ContactDetails from '@/components/registeration-form/contact-details';
import PersonalInformation from '@/components/registeration-form/personal-info';
import PinSetUp from '@/components/registeration-form/pin-setup';
import WalletSetUp from '@/components/registeration-form/wallet-setUp';
import { Colors } from '@/constants/Colors';
import { useValidateSteps } from '@/hooks/useValidateSteps';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const RegisterScreen = () => {
    const [currentStep, setCurrentStep] = useState(1);
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
        try {
            const registrationData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                profilePicture: formData.profilePicture || "url",
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                walletAddress: walletChoice === 'connect' ? formData.walletAddress : undefined,
                groups: formData.groups,
                pin: formData.pin
            };

            console.log('Registration data:', registrationData);
            Alert.alert('Success', 'Account created successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create account. Please try again.');
        }
    };



    const renderStepIndicator = () => {
        const steps = [
            'Personal Info',
            'Contact Details',
            'Security',
            'PIN Setup',
            'Profile Picture',
            'Wallet Setup',
            'Review'
        ];

        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 15,
                flexWrap: 'wrap'
            }}>
                {steps.map((step, index) => (
                    <View key={index} style={{
                        alignItems: 'center',
                        marginHorizontal: 4,
                        marginVertical: 5
                    }}>
                        <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: index + 1 <= currentStep ? Colors.light.tint : Colors.light.border
                        }} />
                        <Text style={{
                            fontSize: 10,
                            color: index + 1 <= currentStep ? Colors.light.tint : Colors.light.icon,
                            marginTop: 4,
                            textAlign: 'center'
                        }}>
                            {step}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <PersonalInformation formData={formData} updateFormData={updateFormData} />
            case 2:
                return <ContactDetails formData={formData} updateFormData={updateFormData} />
            case 3:
                return <PinSetUp formData={formData} updateFormData={updateFormData} />
            case 4:
                return <WalletSetUp formData={formData} setWalletChoice={setWalletChoice} walletChoice={walletChoice} updateFormData={updateFormData} />
            default:
                return null;
        }
    };

    return (
        <View style={{
            flex: 1,
            backgroundColor: Colors.light.background
        }}>
            {RenderRegisterProgressBar({ currentStep, totalSteps: 5 })}
            {/* {renderStepIndicator()} */}

            <ScrollView style={{ flex: 1 }}>
                {renderStep()}
            </ScrollView>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: Colors.light.border,
                backgroundColor: Colors.light.background
            }}>
                {currentStep > 1 && (
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 14,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginRight: 10,
                            borderWidth: 1,
                            borderColor: Colors.light.border
                        }}
                        onPress={previousStep}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: Colors.light.text
                        }}>
                            Back
                        </Text>
                    </TouchableOpacity>
                )}

                {currentStep < 6 && (
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: Colors.light.tint,
                            paddingVertical: 14,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginLeft: currentStep > 1 ? 10 : 0
                        }}
                        onPress={nextStep}
                    >
                        <Text style={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: '600'
                        }}>
                            Continue
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default RegisterScreen;