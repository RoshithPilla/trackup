import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, glassStyles } from '../theme';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { exportToCSV, exportToXLSX } from '../export';
import { queryTransactions } from '../db';

export default function SettingsScreen() {
	const [onlyDebits, setOnlyDebits] = useState(false);
	const [onlyCredits, setOnlyCredits] = useState(false);
	const [privacyEnabled, setPrivacyEnabled] = useState(false);

	useEffect(() => { (async () => {
		const stored = await SecureStore.getItemAsync('privacyEnabled');
		setPrivacyEnabled(stored === '1');
		setOnlyDebits((await SecureStore.getItemAsync('onlyDebits')) === '1');
		setOnlyCredits((await SecureStore.getItemAsync('onlyCredits')) === '1');
	})(); }, []);

	async function togglePrivacy(v: boolean) {
		setPrivacyEnabled(v);
		await SecureStore.setItemAsync('privacyEnabled', v ? '1' : '0');
		if (v) {
			const supported = await LocalAuthentication.hasHardwareAsync();
			if (!supported) Alert.alert('Note', 'Biometrics/PIN may not be supported on this device.');
		}
	}

	async function onToggleDebits(v: boolean) {
		setOnlyDebits(v); if (v) setOnlyCredits(false);
		await SecureStore.setItemAsync('onlyDebits', v ? '1' : '0');
		if (v) await SecureStore.setItemAsync('onlyCredits', '0');
	}

	async function onToggleCredits(v: boolean) {
		setOnlyCredits(v); if (v) setOnlyDebits(false);
		await SecureStore.setItemAsync('onlyCredits', v ? '1' : '0');
		if (v) await SecureStore.setItemAsync('onlyDebits', '0');
	}

	async function onFullExport() {
		try {
			const rows = await queryTransactions({ onlyType: onlyDebits ? 'debit' : onlyCredits ? 'credit' : undefined });
			const csvPath = await exportToCSV(`sms-finance-all.csv`, rows);
			const xlsxPath = await exportToXLSX(`sms-finance-all.xlsx`, rows);
			Alert.alert('Exported', `Saved to\nCSV: ${csvPath}\nXLSX: ${xlsxPath}`);
		} catch (e: any) {
			Alert.alert('Export failed', String(e?.message || e));
		}
	}

	return (
		<LinearGradient colors={[Colors.backgroundStart, Colors.backgroundEnd]} style={{ flex: 1 }}>
			<View style={{ padding: 16, gap: 12 }}>
				<BlurView intensity={30} tint="dark" style={[glassStyles.card]}>
					<View style={styles.rowBetween}>
						<Text style={styles.label}>Show only Debits</Text>
						<Switch thumbColor={Colors.red} trackColor={{ true: '#661015' }} value={onlyDebits} onValueChange={onToggleDebits} />
					</View>
				</BlurView>
				<BlurView intensity={30} tint="dark" style={[glassStyles.card]}>
					<View style={styles.rowBetween}>
						<Text style={styles.label}>Show only Credits</Text>
						<Switch thumbColor={Colors.red} trackColor={{ true: '#661015' }} value={onlyCredits} onValueChange={onToggleCredits} />
					</View>
				</BlurView>
				<BlurView intensity={30} tint="dark" style={[glassStyles.card]}>
					<View style={styles.rowBetween}>
						<Text style={styles.label}>Privacy Lock (PIN/Fingerprint)</Text>
						<Switch thumbColor={Colors.red} trackColor={{ true: '#661015' }} value={privacyEnabled} onValueChange={togglePrivacy} />
					</View>
				</BlurView>

				<TouchableOpacity onPress={onFullExport} activeOpacity={0.85}>
					<BlurView intensity={30} tint="dark" style={[glassStyles.button]}>
						<Text style={{ color: Colors.text, fontWeight: '600' }}>Full Export (CSV/XLSX)</Text>
					</BlurView>
				</TouchableOpacity>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	label: { color: Colors.text },
});