import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, glassStyles } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function TopNav() {
	const navigation = useNavigation<any>();
	return (
		<BlurView intensity={30} tint="dark" style={[glassStyles.card, styles.container]}>
			<Text style={styles.title}>₹ SMS Finance</Text>
			<View style={{ flexDirection: 'row', gap: 8 }}>
				<TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
					<BlurView intensity={20} tint="dark" style={[glassStyles.button, styles.smallBtn]}>
						<Text style={styles.btnText}>Transactions</Text>
					</BlurView>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate('Settings')}>
					<BlurView intensity={20} tint="dark" style={[glassStyles.button, styles.smallBtn]}>
						<Text style={styles.btnText}>Settings</Text>
					</BlurView>
				</TouchableOpacity>
			</View>
		</BlurView>
	);
}

const styles = StyleSheet.create({
	container: { margin: 16, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	title: { color: Colors.text, fontWeight: '800' },
	smallBtn: { paddingVertical: 8, paddingHorizontal: 12 },
	btnText: { color: Colors.text },
});