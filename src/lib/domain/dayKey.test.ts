import { describe, expect, it } from 'vitest';
import { pragueDayKey, pragueUtcOffsetHours } from './dayKey';

// Helper: build a UTC timestamp.
const utc = (iso: string) => new Date(iso).getTime();

describe('pragueUtcOffsetHours', () => {
	it('is UTC+1 in winter (CET)', () => {
		expect(pragueUtcOffsetHours(utc('2026-01-15T12:00:00Z'))).toBe(1);
	});

	it('is UTC+2 in summer (CEST)', () => {
		expect(pragueUtcOffsetHours(utc('2026-06-12T12:00:00Z'))).toBe(2);
	});

	it('switches at the EU boundaries: last Sunday of March / October, 01:00 UTC', () => {
		// 2026: DST starts Sun 29 March, ends Sun 25 October.
		expect(pragueUtcOffsetHours(utc('2026-03-29T00:59:00Z'))).toBe(1);
		expect(pragueUtcOffsetHours(utc('2026-03-29T01:00:00Z'))).toBe(2);
		expect(pragueUtcOffsetHours(utc('2026-10-25T00:59:00Z'))).toBe(2);
		expect(pragueUtcOffsetHours(utc('2026-10-25T01:00:00Z'))).toBe(1);
	});
});

describe('pragueDayKey', () => {
	it('formats as YYYY-MM-DD in Prague local time', () => {
		expect(pragueDayKey(utc('2026-06-12T10:00:00Z'))).toBe('2026-06-12');
	});

	it('an order at 23:30 UTC in summer belongs to the next Prague day', () => {
		// 23:30 UTC + 2h = 01:30 next day in Prague
		expect(pragueDayKey(utc('2026-06-11T23:30:00Z'))).toBe('2026-06-12');
	});

	it('an order at 23:30 UTC in winter belongs to the next Prague day too', () => {
		// 23:30 UTC + 1h = 00:30 next day
		expect(pragueDayKey(utc('2026-01-15T23:30:00Z'))).toBe('2026-01-16');
	});

	it('an order at 22:30 UTC in winter stays on the same Prague day', () => {
		// 22:30 UTC + 1h = 23:30 same day
		expect(pragueDayKey(utc('2026-01-15T22:30:00Z'))).toBe('2026-01-15');
	});

	it('handles year boundaries', () => {
		expect(pragueDayKey(utc('2025-12-31T23:30:00Z'))).toBe('2026-01-01');
	});
});
