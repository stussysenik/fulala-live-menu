/**
 * Europe/Prague calendar-day keys for daily order numbers ("#42 resets at
 * midnight"). Implemented with explicit EU daylight-saving rules instead of
 * `Intl` because Convex's V8 isolate doesn't guarantee full ICU timezone
 * data — and pure arithmetic is deterministic and unit-testable anyway.
 *
 * EU rule (Directive 2000/84/EC): clocks go forward the last Sunday of March
 * at 01:00 UTC and back the last Sunday of October at 01:00 UTC.
 * Prague: CET = UTC+1 (winter), CEST = UTC+2 (summer).
 */

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** UTC timestamp of the last Sunday of a month, at 01:00 UTC. */
function lastSundayUtc(year: number, monthIndex: number): number {
	// Day 0 of next month = last day of this month.
	const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
	const lastSunday = lastDay.getUTCDate() - lastDay.getUTCDay();
	return Date.UTC(year, monthIndex, lastSunday, 1);
}

/** 2 during CEST (summer), 1 during CET (winter). */
export function pragueUtcOffsetHours(timestampMs: number): 1 | 2 {
	const year = new Date(timestampMs).getUTCFullYear();
	const dstStart = lastSundayUtc(year, 2); // March
	const dstEnd = lastSundayUtc(year, 9); // October
	return timestampMs >= dstStart && timestampMs < dstEnd ? 2 : 1;
}

/** YYYY-MM-DD of the Prague-local calendar day containing the timestamp. */
export function pragueDayKey(timestampMs: number): string {
	const local = new Date(timestampMs + pragueUtcOffsetHours(timestampMs) * HOUR_MS);
	const y = local.getUTCFullYear();
	const m = String(local.getUTCMonth() + 1).padStart(2, '0');
	const d = String(local.getUTCDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/** Start of a Prague day key, as a UTC timestamp — useful for range queries. */
export function pragueDayStartUtc(dayKey: string): number {
	const [y, m, d] = dayKey.split('-').map(Number);
	const naive = Date.UTC(y!, m! - 1, d!);
	// The offset at local midnight is the offset of (naive - offset); one
	// correction pass is enough because transitions happen at 02:00/03:00 local.
	return naive - pragueUtcOffsetHours(naive) * HOUR_MS;
}

export { DAY_MS };
