import { ThemeProvider } from '@/context/ThemeContext';
import { UserInactivityProvider } from '@/context/UserInactivityContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import RootLayoutContent from './components/RootLayoutContent';
import { FilterSheetProvider } from './context/FilterSheetContext';

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider>
				<FilterSheetProvider>
					<UserInactivityProvider>
						<BottomSheetModalProvider>
							<RootLayoutContent />
						</BottomSheetModalProvider>
					</UserInactivityProvider>
				</FilterSheetProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}