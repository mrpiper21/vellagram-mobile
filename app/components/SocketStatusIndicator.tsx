import { useAppTheme } from '@/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSocket } from '../context/SocketContext';

interface SocketStatusIndicatorProps {
	showText?: boolean;
	size?: 'small' | 'medium' | 'large';
}

const SocketStatusIndicator: React.FC<SocketStatusIndicatorProps> = ({ 
	showText = true, 
	size = 'small' 
}) => {
	const { isConnected } = useSocket();
	const theme = useAppTheme();

	const getDotSize = () => {
		switch (size) {
			case 'large':
				return 12;
			case 'medium':
				return 8;
			case 'small':
			default:
				return 6;
		}
	};

	const getTextSize = () => {
		switch (size) {
			case 'large':
				return 14;
			case 'medium':
				return 12;
			case 'small':
			default:
				return 10;
		}
	};

	return (
		<View style={styles.container}>
			<View 
				style={[
					styles.dot, 
					{ 
						width: getDotSize(), 
						height: getDotSize(), 
						borderRadius: getDotSize() / 2,
						backgroundColor: isConnected ? theme.success : theme.textSecondary 
					}
				]} 
			/>
			{showText && (
				<Text 
					style={[
						styles.text, 
						{ 
							color: theme.textSecondary, 
							fontSize: getTextSize() 
						}
					]}
				>
					{isConnected ? 'Connected' : 'Disconnected'}
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	dot: {
		// Size will be set dynamically
	},
	text: {
		fontWeight: '500',
	},
});

export default SocketStatusIndicator; 