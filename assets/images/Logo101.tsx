import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, ViewStyle } from 'react-native';
import Svg, {
    Circle,
    Defs,
    FeDropShadow,
    FeGaussianBlur,
    FeMerge,
    FeMergeNode,
    Filter,
    G,
    Path,
    RadialGradient,
    Stop,
    Text as SvgText
} from 'react-native-svg';

interface VellagramLogoProps {
    size?: number;
    showText?: boolean;
    animated?: boolean;
    style?: ViewStyle;
}

const VellagramLogo: React.FC<VellagramLogoProps> = ({
    size = 200,
    showText = true,
    animated = true,
    style = {}
}) => {
    const dot1Opacity = useRef(new Animated.Value(0.4)).current;
    const dot2Opacity = useRef(new Animated.Value(0.3)).current;
    const dot3Opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (animated) {
            const createAnimation = (animatedValue: Animated.Value, duration: number, delay: number = 0) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration: duration / 2,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: false,
                        }),
                        Animated.timing(animatedValue, {
                            toValue: 0.4,
                            duration: duration / 2,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: false,
                        }),
                    ])
                );
            };

            const animation1 = createAnimation(dot1Opacity, 2000);
            const animation2 = createAnimation(dot2Opacity, 2500, 500);
            const animation3 = createAnimation(dot3Opacity, 3000, 1000);

            animation1.start();
            animation2.start();
            animation3.start();

            return () => {
                animation1.stop();
                animation2.stop();
                animation3.stop();
            };
        }
    }, [animated, dot1Opacity, dot2Opacity, dot3Opacity]);

    // Calculate tight bounds - remove excessive margins
    const logoHeight: number = showText ? 110 : 90;
    const logoWidth: number = 90;
    const scale: number = size / Math.max(logoWidth, logoHeight);

    return (
        <View style={[{
            width: logoWidth * scale,
            height: logoHeight * scale
        }, style]}>
            <Svg
                width={logoWidth * scale}
                height={logoHeight * scale}
                viewBox={`0 0 ${logoWidth} ${logoHeight}`}
            >
                <Defs>
                    <RadialGradient id="energyGradient" cx="50%" cy="30%">
                        <Stop offset="0%" stopColor="#3A86A8" stopOpacity="1" />
                        <Stop offset="60%" stopColor="#2A4759" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#1A3A4A" stopOpacity="1" />
                    </RadialGradient>

                    <Filter id="glow">
                        <FeGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <FeMerge>
                            <FeMergeNode in="coloredBlur" />
                            <FeMergeNode in="SourceGraphic" />
                        </FeMerge>
                    </Filter>

                    <Filter id="premiumShadow">
                        <FeDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#2A4759" floodOpacity="0.2" />
                    </Filter>
                </Defs>

                {/* Main logo circle positioned tightly */}
                <G transform="translate(45,45)">
                    <Circle r="45" fill="url(#energyGradient)" filter="url(#premiumShadow)" />
                    <Circle r="38" fill="none" stroke="#3A86A8" strokeWidth="1" opacity="0.4" />

                    <G filter="url(#glow)">
                        <Path
                            d="M-20,0 L0,25 L20,0"
                            stroke="#FFFFFF"
                            strokeWidth="5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </G>

                    {/* Animated dots */}
                    {animated && (
                        <>
                            <Animated.View style={{ opacity: dot1Opacity }}>
                                <Circle cx="0" cy="-30" r="2" fill="#22C55E" />
                            </Animated.View>
                            <Animated.View style={{ opacity: dot2Opacity }}>
                                <Circle cx="12" cy="-26" r="1.5" fill="#3A86A8" />
                            </Animated.View>
                            <Animated.View style={{ opacity: dot3Opacity }}>
                                <Circle cx="-12" cy="-26" r="1.5" fill="#3A86A8" />
                            </Animated.View>
                        </>
                    )}

                    {!animated && (
                        <>
                            <Circle cx="0" cy="-30" r="2" fill="#22C55E" opacity="0.8" />
                            <Circle cx="12" cy="-26" r="1.5" fill="#3A86A8" opacity="0.6" />
                            <Circle cx="-12" cy="-26" r="1.5" fill="#3A86A8" opacity="0.6" />
                        </>
                    )}
                </G>

                {showText && (
                    <SvgText
                        x="45"
                        y="100"
                        textAnchor="middle"
                        fill="url(#energyGradient)"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
                    >
                        VELLAGRAM
                    </SvgText>
                )}
            </Svg>
        </View>
    );
};

export default VellagramLogo;