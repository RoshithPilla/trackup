import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation';
import { initializeDatabase, insertMany } from './src/db';
import { PermissionsAndroid, Platform } from 'react-native';
import PrivacyGate from './src/components/PrivacyGate';

export default function App() {
	useEffect(() => {
		(async () => {
			await initializeDatabase();
			if (Platform.OS === 'android') {
				const granted = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.READ_SMS,
					PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
				]);
				const ok = Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
				if (!ok) {
					await insertMany([
						{ amount: 1200.5, type: 'debit', date: new Date().toISOString(), source: 'Demo Bank' },
						{ amount: 2500, type: 'credit', date: new Date().toISOString(), source: 'Salary' },
					]);
				}
			}
		})();
	}, []);

	return (
		<>
			<StatusBar style="light" />
			<PrivacyGate>
				<RootNavigator />
			</PrivacyGate>
		</>
	);
}
