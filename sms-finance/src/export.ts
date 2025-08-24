import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import Papa from 'papaparse';
import { Transaction } from './db';
import { Platform } from 'react-native';

function downloadsDir(): string {
	if (Platform.OS === 'android') return RNFS.DownloadDirectoryPath;
	return RNFS.DocumentDirectoryPath;
}

export async function exportToCSV(filename: string, rows: Transaction[]): Promise<string> {
	const csv = Papa.unparse(rows.map(r => ({
		Date: r.date,
		Type: r.type,
		Amount: r.amount,
		Source: r.source,
	})));
	const path = `${downloadsDir()}/${filename}`;
	await RNFS.writeFile(path, csv, 'utf8');
	return path;
}

export async function exportToXLSX(filename: string, rows: Transaction[]): Promise<string> {
	const worksheet = XLSX.utils.json_to_sheet(rows.map(r => ({
		Date: r.date,
		Type: r.type,
		Amount: r.amount,
		Source: r.source,
	})));
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
	const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
	const path = `${downloadsDir()}/${filename}`;
	await RNFS.writeFile(path, wbout, 'base64');
	return path;
}