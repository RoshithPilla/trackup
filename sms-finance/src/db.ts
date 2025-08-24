import * as SQLite from 'expo-sqlite';

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
	id?: number;
	amount: number;
	type: TransactionType;
	date: string; // ISO string
	source: string; // Bank/UPI app name
	rawSmsId?: string; // optional reference to SMS id
}

const database = SQLite.openDatabaseSync('transactions.db');

export async function initializeDatabase(): Promise<void> {
	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS transactions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			amount REAL NOT NULL,
			type TEXT NOT NULL CHECK (type IN ('debit','credit')),
			date TEXT NOT NULL,
			source TEXT NOT NULL,
			rawSmsId TEXT
		);
		CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
		CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
	`);
}

export async function insertTransaction(tx: Transaction): Promise<number> {
	const result = await database.runAsync(
		`INSERT INTO transactions (amount, type, date, source, rawSmsId) VALUES (?,?,?,?,?)`,
		[tx.amount, tx.type, tx.date, tx.source, tx.rawSmsId ?? null]
	);
	return result.lastInsertRowId as number;
}

export async function insertMany(transactions: Transaction[]): Promise<void> {
	await database.withTransactionAsync(async () => {
		for (const t of transactions) {
			await insertTransaction(t);
		}
	});
}

export interface QueryFilters {
	fromDate?: string; // inclusive ISO
	toDate?: string;   // inclusive ISO
	onlyType?: TransactionType; // optional filter
}

export async function queryTransactions(filters: QueryFilters = {}): Promise<Transaction[]> {
	const clauses: string[] = [];
	const params: any[] = [];
	if (filters.fromDate) { clauses.push('date >= ?'); params.push(filters.fromDate); }
	if (filters.toDate) { clauses.push('date <= ?'); params.push(filters.toDate); }
	if (filters.onlyType) { clauses.push('type = ?'); params.push(filters.onlyType); }
	const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
	const rows = await database.getAllAsync<any>(`SELECT * FROM transactions ${where} ORDER BY date DESC`, params);
	return rows as Transaction[];
}

export interface MonthlySummaryItem { month: string; debit: number; credit: number; }

export async function getMonthlySummary(): Promise<MonthlySummaryItem[]> {
	const rows = await database.getAllAsync<any>(
		`SELECT substr(date, 1, 7) as month,
			SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) as debit,
			SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) as credit
		 FROM transactions
		 GROUP BY month
		 ORDER BY month DESC`
	);
	return rows.map(r => ({ month: r.month, debit: Number(r.debit || 0), credit: Number(r.credit || 0) }));
}

export async function getCurrentMonthTotals(): Promise<{ debit: number; credit: number; }>{
	const now = new Date();
	const monthStr = now.toISOString().slice(0,7); // YYYY-MM
	const rows = await database.getAllAsync<any>(
		`SELECT SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) as debit,
				SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) as credit
		 FROM transactions WHERE substr(date,1,7)=?`,
		[monthStr]
	);
	const r = rows[0] || { debit: 0, credit: 0 };
	return { debit: Number(r.debit || 0), credit: Number(r.credit || 0) };
}

export async function clearAll(): Promise<void> {
	await database.execAsync('DELETE FROM transactions');
}