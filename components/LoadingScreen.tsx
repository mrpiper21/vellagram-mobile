import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface LoadingScreenProps {
    theme: any;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ theme }) => {
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="large" color={theme.tint} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 