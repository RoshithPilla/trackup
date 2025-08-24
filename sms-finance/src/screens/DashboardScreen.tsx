import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, glassStyles } from '../theme';
import { getCurrentMonthTotals, getMonthlySummary, initializeDatabase, Transaction } from '../db';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { exportToCSV, exportToXLSX } from '../export';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { importExistingSms, startIncomingSmsListener, stopIncomingSmsListener } from '../sms';
import TopNav from '../components/TopNav';
import { getCurrentMonthRange } from '../utils/date';
import { queryTransactions } from '../db';

export type DashboardProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: DashboardProps) {
	const [totals, setTotals] = useState({ debit: 0, credit: 0 });
	const [summary, setSummary] = useState<{ month: string; debit: number; credit: number; }[]>([]);

	async function refresh() {
		setTotals(await getCurrentMonthTotals());
		setSummary(await getMonthlySummary());
	}

	useEffect(() => {
		initializeDatabase().then(async () => {
			await importExistingSms().catch(() => {});
			await refresh();
		});
		startIncomingSmsListener(async (_t: Transaction) => {
			await refresh();
		});
		return () => stopIncomingSmsListener();
	}, []);

	const chartData = useMemo(() => {
		const labels = summary.slice(-6).map(s => s.month.slice(5));
		const debit = summary.slice(-6).map(s => s.debit);
		const credit = summary.slice(-6).map(s => s.credit);
		return { labels, datasets: [ { data: debit, color: () => Colors.debit }, { data: credit, color: () => Colors.credit } ] };
	}, [summary]);

	async function onExportCurrentMonth() {
		const now = new Date();
		const monthStr = now.toISOString().slice(0,7);
		try {
			const { from, to } = getCurrentMonthRange();
			const rows = await queryTransactions({ fromDate: from, toDate: to });
			const csvPath = await exportToCSV(`sms-finance-${monthStr}.csv`, rows);
			const xlsxPath = await exportToXLSX(`sms-finance-${monthStr}.xlsx`, rows);
			Alert.alert('Exported', `Saved to\nCSV: ${csvPath}\nXLSX: ${xlsxPath}`);
		} catch (e: any) {
			Alert.alert('Export failed', String(e?.message || e));
		}
	}

	return (
		<LinearGradient colors={[Colors.backgroundStart, Colors.backgroundEnd]} style={{ flex: 1 }}>
			<TopNav />
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<BlurView intensity={40} tint="dark" style={[styles.header, glassStyles.card]}>
					<Text style={styles.headerText}>Monthly Summary</Text>
				</BlurView>
				<View style={styles.row}>
					<BlurView intensity={30} tint="dark" style={[styles.card, glassStyles.card]}>
						<Text style={styles.cardTitle}>Total Spent</Text>
						<Text style={[styles.cardValue, { color: Colors.debit }]}>₹ {totals.debit.toFixed(2)}</Text>
					</BlurView>
					<BlurView intensity={30} tint="dark" style={[styles.card, glassStyles.card]}>
						<Text style={styles.cardTitle}>Total Received</Text>
						<Text style={[styles.cardValue, { color: Colors.credit }]}>₹ {totals.credit.toFixed(2)}</Text>
					</BlurView>
				</View>
				<View style={[styles.chartCard, glassStyles.card]}>
					<Text style={styles.chartTitle}>Last 6 Months</Text>
					<BarChart
						width={Dimensions.get('window').width - 48}
						height={220}
						chartConfig={{
							backgroundGradientFromOpacity: 0,
							backgroundGradientToOpacity: 0,
							decimalPlaces: 0,
							color: (o=1) => `rgba(255,255,255,${o})`,
							labelColor: () => '#e8e8e8',
							propsForBackgroundLines: { strokeDasharray: '' },
						}}
						fromZero
						withHorizontalLabels
						segments={4}
						data={{ labels: chartData.labels, datasets: [{ data: chartData.datasets[0].data }, { data: chartData.datasets[1].data }] }}
						style={{ marginVertical: 8 }}
					/>
				</View>
				<TouchableOpacity onPress={onExportCurrentMonth} activeOpacity={0.8}>
					<BlurView intensity={30} tint="dark" style={[glassStyles.button, { marginTop: 8 }]}> 
						<Text style={{ color: Colors.text, fontWeight: '600' }}>Quick Export (CSV/XLSX)</Text>
					</BlurView>
				</TouchableOpacity>
			</ScrollView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	header: { marginTop: 8, padding: 16 },
	headerText: { color: Colors.red, fontSize: 20, fontWeight: '700', textShadowColor: 'rgba(229,9,20,0.7)', textShadowRadius: 10 },
	row: { flexDirection: 'row', gap: 12, marginTop: 12 },
	card: { flex: 1 },
	cardTitle: { color: '#e8e8e8' },
	cardValue: { fontSize: 24, fontWeight: '700', marginTop: 8 },
	chartCard: { marginTop: 12 },
	chartTitle: { color: Colors.text, marginBottom: 8, fontWeight: '600' },
});