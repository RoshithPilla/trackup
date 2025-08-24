import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

export type SplashProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: SplashProps) {
	useEffect(() => {
		const t = setTimeout(() => navigation.replace('Dashboard'), 1200);
		return () => clearTimeout(t);
	}, [navigation]);
	return (
		<LinearGradient colors={[Colors.backgroundStart, Colors.backgroundEnd]} style={styles.container}>
			<View style={styles.center}>
				<Text style={styles.logo}>₹ SMS Finance</Text>
				<Text style={styles.subtitle}>Track debits & credits automatically</Text>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	logo: {
		color: Colors.red,
		fontSize: 36,
		fontWeight: '800',
		textShadowColor: 'rgba(229,9,20,0.7)',
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 14,
	},
	subtitle: { color: '#e8e8e8', marginTop: 8 },
});