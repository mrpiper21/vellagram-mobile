import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ContributionModal } from "./ContributionModal";

interface AnnouncementBannerProps {
    title: string;
    message: string;
    onContribute?: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
    title,
    message,
    onContribute
}) => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? "dark" : "light";
    const appColors = Colors[colorScheme];
    const [showContributionModal, setShowContributionModal] = useState(false);

    // Animation values
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Start entrance animation
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }),
        ]).start();
    }, []);

    const handleContribute = () => {
        setShowContributionModal(true);
    };

    const handlePay = (amount: number) => {
        setShowContributionModal(false);
        onContribute?.();
        // Here you would typically handle the payment
        console.log('Payment amount:', amount);
    };

    return (
        <>
            <Animated.View
                style={[
                    styles.announcementBanner,
                    {
                        backgroundColor: appColors.card,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ],
                        opacity: opacityAnim
                    }
                ]}
            >
                <View style={styles.announcementContent}>
                    <View style={styles.announcementHeader}>
                        <Ionicons name="megaphone" size={20} color={appColors.tint} />
                        <Text style={[styles.announcementTitle, { color: appColors.text }]}>
                            {title}
                        </Text>
                    </View>
                    <Text style={[styles.announcementText, { color: appColors.text }]}>
                        {message}
                    </Text>
                    <TouchableOpacity
                        style={[styles.contributeButton, { backgroundColor: appColors.tint }]}
                        onPress={handleContribute}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="wallet-outline" size={16} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.contributeButtonText}>Contribute Now</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <ContributionModal
                visible={showContributionModal}
                onClose={() => setShowContributionModal(false)}
                onPay={handlePay}
            />
        </>
    );
};

const styles = StyleSheet.create({
    announcementBanner: {
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    },
    announcementContent: {
        gap: 8,
    },
    announcementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    announcementText: {
        fontSize: 14,
        lineHeight: 20,
    },
    contributeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonIcon: {
        marginRight: 8,
    },
    contributeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
}); 