import { Colors } from '@/constants/Colors';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

const RenderRegisterProgressBar = ({ currentStep, totalSteps = 5 }: { currentStep: number, totalSteps: number }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Calculate target width percentage
        const targetProgress = (currentStep / totalSteps) * 100;

        // Animate the progress change
        Animated.timing(progressAnim, {
            toValue: targetProgress,
            duration: 500, // Animation duration in ms
            easing: Easing.out(Easing.exp), // Smooth exponential easing
            useNativeDriver: false, // Width animation doesn't support native driver
        }).start();
    }, [currentStep]);

    return (
        <View style={{
            height: 4,
            backgroundColor: Colors.light.border,
            borderRadius: 2,
            marginHorizontal: 20,
            marginVertical: 20,
            overflow: 'hidden' // Ensures the inner bar stays rounded
        }}>
            <Animated.View style={{
                height: '100%',
                width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                }),
                backgroundColor: Colors.light.tint,
                borderRadius: 2
            }} />
        </View>
    );
};

export default RenderRegisterProgressBar