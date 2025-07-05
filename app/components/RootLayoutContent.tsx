import { useAppTheme } from '@/context/ThemeContext';
import { DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { Fragment } from 'react';
import { useFilterSheet } from '../context/FilterSheetContext';

export default function RootLayoutContent() {
    const theme = useAppTheme();
    const { isAmountSheetVisible, isDateSheetVisible, hideAmountSheet, hideDateSheet } = useFilterSheet();

    // Create navigation theme based on your app theme
    const navigationTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: theme.accent,
            background: theme.background,
            card: theme.card,
            text: theme.text,
            border: theme.border,
            notification: theme.border,
        },
    };

    return (
        <Fragment>
            <NavigationThemeProvider value={navigationTheme}>
                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: theme.card,
                        },
                        headerTintColor: theme.text,
                        headerTitleStyle: {
                            fontFamily: 'SpaceMono',
                        },
                        headerShown: false,
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen
                        name="lock-Screen"
                        options={{
                            headerShown: false,
                            gestureEnabled: false,
                        }}
                    />
                    <Stack.Screen
                        name="auth"
                        options={{
                            headerShown: false,
                            gestureEnabled: false,
                        }}
                    />
                    <Stack.Screen
                        name="(authenticated)"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="+not-found"
                        options={{
                            title: 'Page Not Found',
                            headerShown: true,
                        }}
                    />
                    <Stack.Screen
                        name="white-overlay"
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                        }}
                    />
                    <Stack.Screen
                        name="contacts"
                        options={{
                            headerShown: true,
                            title: 'Contacts',
                            headerBackTitle: 'Back',
                        }}
                    />
                </Stack>
            </NavigationThemeProvider>

            {/* Status bar with dynamic style based on theme */}
            <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        </Fragment>
    );
} 