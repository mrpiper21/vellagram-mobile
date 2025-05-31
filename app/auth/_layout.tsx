import { Stack } from 'expo-router';
import 'react-native-reanimated';

// import { useColorScheme } from "@/hooks/useColorScheme";

export default function Layout() {

    return (
        <Stack screenOptions={{ animation: "none", headerShown: false }}>
            <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
            <Stack.Screen name="EmailAuthScreen" options={{ headerShown: false }} />
            <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />
            <Stack.Screen name="OtpAuthScreen" options={{ headerShown: false }} />
        </Stack>
    );
}
