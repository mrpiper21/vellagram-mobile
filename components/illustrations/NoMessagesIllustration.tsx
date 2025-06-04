import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const NoMessagesIllustration = () => {
    const { theme } = useTheme();
    const colorScheme = theme.isDark ? 'dark' : 'light';
    const appColors = Colors[colorScheme];

    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const strokeDashoffset = useSharedValue(1000);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 1000 });
        scale.value = withRepeat(
            withTiming(1.05, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease)
            }),
            -1,
            true
        );
        strokeDashoffset.value = withDelay(
            500,
            withTiming(0, {
                duration: 2000,
                easing: Easing.inOut(Easing.ease)
            })
        );
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: strokeDashoffset.value,
    }));

    return (
        <Animated.View style={[
            styles.container,
            {
                opacity,
                transform: [{ scale }]
            }
        ]}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
                <G>
                    {/* Main chat bubble */}
                    <AnimatedPath
                        d="M160 40H40C35.5817 40 32 43.5817 32 48V152C32 156.418 35.5817 160 40 160H160C164.418 160 168 156.418 168 152V48C168 43.5817 164.418 40 160 40Z"
                        stroke={appColors.text}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        strokeDasharray={1000}
                        animatedProps={animatedProps}
                    />

                    {/* Message lines */}
                    <Path
                        d="M60 80H140"
                        stroke={appColors.text}
                        strokeWidth={2}
                        strokeLinecap="round"
                        opacity={0.7}
                    />
                    <Path
                        d="M60 100H120"
                        stroke={appColors.text}
                        strokeWidth={2}
                        strokeLinecap="round"
                        opacity={0.7}
                    />
                    <Path
                        d="M60 120H100"
                        stroke={appColors.text}
                        strokeWidth={2}
                        strokeLinecap="round"
                        opacity={0.7}
                    />

                    {/* Plus icon */}
                    <Circle
                        cx={150}
                        cy={150}
                        r={15}
                        fill={appColors.tint}
                        opacity={0.8}
                    />
                    <Path
                        d="M150 142V158M142 150H158"
                        stroke="white"
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
});

export default NoMessagesIllustration; 