import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";

const ContactSkeleton = () => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const appColors = Colors[colorScheme];
    const opacity = useSharedValue(0.5);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, { backgroundColor: appColors.card }]}>
            <View style={styles.content}>
                <Animated.View style={[styles.avatar, { backgroundColor: appColors.border }, animatedStyle]} />
                <View style={styles.textContainer}>
                    <Animated.View style={[styles.name, { backgroundColor: appColors.border }, animatedStyle]} />
                    <Animated.View style={[styles.phone, { backgroundColor: appColors.border }, animatedStyle]} />
                </View>
            </View>
            <Animated.View style={[styles.button, { backgroundColor: appColors.border }, animatedStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        gap: 8,
    },
    name: {
        height: 16,
        width: '60%',
        borderRadius: 4,
    },
    phone: {
        height: 14,
        width: '40%',
        borderRadius: 4,
    },
    button: {
        width: 80,
        height: 36,
        borderRadius: 18,
    },
});

export default ContactSkeleton; 