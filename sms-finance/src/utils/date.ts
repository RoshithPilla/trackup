export function getCurrentMonthRange(): { from: string; to: string } {
	const now = new Date();
	const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
	const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));
	return { from: fromDate.toISOString(), to: toDate.toISOString() };
}