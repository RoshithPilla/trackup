import SmsAndroid from 'react-native-get-sms-android';
import RnSmsListener from 'react-native-android-sms-listener';
import { insertTransaction, Transaction, TransactionType } from './db';

const FINANCE_KEYWORDS = [
	'debit', 'debited', 'paid', 'spent', 'purchase', 'withdrawn', 'txn', 'payment',
	'credit', 'credited', 'received', 'added', 'refund'
];

const SOURCE_HINTS: Record<string, string> = {
	'gpay': 'Google Pay',
	'google pay': 'Google Pay',
	'phonepe': 'PhonePe',
	'paytm': 'Paytm',
	'upi': 'UPI',
	'visa': 'VISA',
	'mastercard': 'MasterCard',
	'rupay': 'RuPay',
	'icici': 'ICICI Bank',
	'hdfc': 'HDFC Bank',
	'sbi': 'SBI',
	'axis': 'Axis Bank',
	'kotak': 'Kotak Bank'
};

function containsFinanceKeywords(text: string): boolean {
	const lower = text.toLowerCase();
	return FINANCE_KEYWORDS.some(k => lower.includes(k));
}

function parseAmount(text: string): number | null {
	// Match Rs./INR amounts like: Rs. 1,234.56 or INR 500 or Rs123
	const amountRegex = /(rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\.[0-9]{1,2})?/i;
	const match = text.match(amountRegex);
	if (!match) return null;
	const numeric = match[2].replace(/,/g, '');
	const decimalMatch = text.slice(match.index || 0).match(/(\.[0-9]{1,2})/);
	const cents = decimalMatch ? decimalMatch[1] : '';
	return Number(`${numeric}${cents}`);
}

function parseType(text: string): TransactionType | null {
	const lower = text.toLowerCase();
	if (lower.includes('debited') || lower.includes('debit') || lower.includes('spent') || lower.includes('paid') || lower.includes('withdrawn') || lower.includes('purchase')) return 'debit';
	if (lower.includes('credited') || lower.includes('credit') || lower.includes('received') || lower.includes('refund') || lower.includes('added')) return 'credit';
	return null;
}

function parseSource(text: string, address?: string): string {
	const lower = text.toLowerCase();
	for (const key of Object.keys(SOURCE_HINTS)) {
		if (lower.includes(key)) return SOURCE_HINTS[key];
	}
	if (address) return address;
	return 'Unknown';
}

export function smsToTransaction(body: string, address?: string, timestamp?: number, smsId?: string): Transaction | null {
	if (!containsFinanceKeywords(body)) return null;
	const amount = parseAmount(body);
	const type = parseType(body);
	if (!amount || !type) return null;
	const dateIso = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
	const source = parseSource(body, address);
	return { amount, type, date: dateIso, source, rawSmsId: smsId };
}

export async function importExistingSms(): Promise<number> {
	return new Promise((resolve, reject) => {
		SmsAndroid.list(JSON.stringify({
			box: 'inbox',
			indexFrom: 0,
			maxCount: 1000,
		}), async (fail: any) => reject(new Error(String(fail))), async (count: number, smsList: string) => {
			try {
				const arr: any[] = JSON.parse(smsList);
				let inserted = 0;
				for (const sms of arr) {
					const tx = smsToTransaction(sms.body, sms.address, sms.date, String(sms._id ?? sms.id ?? ''));
					if (tx) { await insertTransaction(tx); inserted++; }
				}
				resolve(inserted);
			} catch (e) {
				reject(e);
			}
		});
	});
}

let subscription: { remove: () => void } | null = null;

export function startIncomingSmsListener(onTransaction: (t: Transaction) => void): void {
	if (subscription) return;
	subscription = RnSmsListener.addListener(async (message: { originatingAddress?: string; body: string; timestamp?: number; }) => {
		const tx = smsToTransaction(message.body, message.originatingAddress, message.timestamp);
		if (tx) {
			await insertTransaction(tx);
			onTransaction(tx);
		}
	});
}

export function stopIncomingSmsListener(): void {
	if (subscription) { subscription.remove(); subscription = null; }
}