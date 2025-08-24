import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export default function PrivacyGate({ children }: { children: React.ReactNode }) {
	const [locked, setLocked] = useState<boolean | null>(null);

	useEffect(() => { (async () => {
		const enabled = (await SecureStore.getItemAsync('privacyEnabled')) === '1';
		if (!enabled) { setLocked(false); return; }
		const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock SMS Finance' });
		setLocked(!res.success);
	})(); }, []);

	if (locked === null) return null;
	if (!locked) return <>{children}</>;
	return (
		<LinearGradient colors={[Colors.backgroundStart, Colors.backgroundEnd]} style={styles.container}>
			<Text style={styles.title}>Locked</Text>
			<TouchableOpacity onPress={async ()=>{
				const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock SMS Finance' });
				if (res.success) setLocked(false);
			}}>
				<Text style={styles.button}>Unlock</Text>
			</TouchableOpacity>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	title: { color: Colors.text, fontSize: 20, marginBottom: 16 },
	button: { color: Colors.red, fontWeight: '700' },
});