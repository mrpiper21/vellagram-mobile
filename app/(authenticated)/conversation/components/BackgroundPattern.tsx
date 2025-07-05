import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface BackgroundPatternProps {
    theme: any;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ theme }) => {
    const randomElements = useMemo(() => (
        [...Array(12)].map((_, index) => ({
            id: index,
            width: 20 + (index * 2) % 40,
            height: 20 + (index * 3) % 40,
            borderRadius: 10 + (index * 2) % 20,
            top: (index * 7) % 100,
            left: (index * 11) % 100,
            rotate: (index * 30) % 360,
        }))
    ), []);

    return (
        <View style={[styles.backgroundPattern, { backgroundColor: theme.background }]}>
            <View style={styles.patternGrid}>
                {[...Array(6)].map((_, rowIndex) => (
                    <View key={rowIndex} style={styles.patternRow}>
                        {[...Array(8)].map((_, colIndex) => (
                            <View key={colIndex} style={[
                                styles.patternDot,
                                {
                                    opacity: 0.15,
                                    backgroundColor: theme.tint,
                                    transform: [
                                        { scale: (rowIndex + colIndex) % 2 === 0 ? 1 : 0.8 }
                                    ]
                                }
                            ]} />
                        ))}
                    </View>
                ))}
            </View>
            <View style={styles.randomElements}>
                {randomElements.map((element) => (
                    <View
                        key={element.id}
                        style={[
                            styles.randomElement,
                            {
                                backgroundColor: theme.tint,
                                opacity: 0.08,
                                width: element.width,
                                height: element.height,
                                borderRadius: element.borderRadius,
                                top: `${element.top}%`,
                                left: `${element.left}%`,
                                transform: [
                                    { rotate: `${element.rotate}deg` }
                                ]
                            }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    patternGrid: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    patternRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
    },
    patternDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    randomElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    randomElement: {
        position: 'absolute',
    },
}); 