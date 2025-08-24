import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, glassStyles } from '../theme';
import { Transaction, queryTransactions } from '../db';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

export default function TransactionsScreen() {
	const [items, setItems] = useState<Transaction[]>([]);
	async function load() {
		const onlyDebits = (await SecureStore.getItemAsync('onlyDebits')) === '1';
		const onlyCredits = (await SecureStore.getItemAsync('onlyCredits')) === '1';
		const rows = await queryTransactions({ onlyType: onlyDebits ? 'debit' : onlyCredits ? 'credit' : undefined });
		setItems(rows);
	}
	useEffect(() => { load(); }, []);
	useFocusEffect(useCallback(() => { load(); }, []));
	return (
		<LinearGradient colors={[Colors.backgroundStart, Colors.backgroundEnd]} style={{ flex: 1 }}>
			<FlatList
				contentContainerStyle={{ padding: 16 }}
				ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
				data={items}
				keyExtractor={(item) => String(item.id)}
				renderItem={({ item }) => (
					<BlurView intensity={30} tint="dark" style={[glassStyles.card]}>
						<View style={styles.rowBetween}>
							<Text style={[styles.amount, { color: item.type === 'debit' ? Colors.debit : Colors.credit }]}>₹ {item.amount.toFixed(2)}</Text>
							<Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
						</View>
						<View style={styles.divider} />
						<Text style={styles.source}>{item.source}</Text>
					</BlurView>
				)}
			/>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	amount: { fontSize: 18, fontWeight: '700' },
	date: { color: '#ccc' },
	source: { color: Colors.text, marginTop: 8 },
	divider: { height: 1, backgroundColor: Colors.red, opacity: 0.6, marginTop: 8 },
});