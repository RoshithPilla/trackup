import { StyleSheet } from 'react-native';

export const Colors = {
	backgroundStart: '#0D0D0D',
	backgroundEnd: '#1A1A1A',
	red: '#E50914',
	debit: '#FF3B30',
	credit: '#4CD964',
	text: '#F5F5F5',
	textDim: '#CCCCCC',
	glass: 'rgba(255,255,255,0.1)'
};

export const glassStyles = StyleSheet.create({
	card: {
		backgroundColor: Colors.glass,
		borderColor: Colors.red,
		borderWidth: 1,
		borderRadius: 16,
		padding: 16,
	},
	button: {
		backgroundColor: Colors.glass,
		borderColor: Colors.red,
		borderWidth: 1,
		borderRadius: 24,
		paddingVertical: 12,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	textTitle: {
		color: Colors.text,
		fontSize: 18,
		fontWeight: '600',
		textShadowColor: 'rgba(229,9,20,0.6)',
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 6,
	},
});