import { describe, it, expect } from 'vitest';
import {
	easterSunday,
	activeHolidays,
	upcomingHolidays,
	HOLIDAYS,
} from './holidays';

const utc = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe('easterSunday (Gregorian computus)', () => {
	it('computes known Easter dates', () => {
		expect(easterSunday(2025).toISOString().slice(0, 10)).toBe('2025-04-20');
		expect(easterSunday(2026).toISOString().slice(0, 10)).toBe('2026-04-05');
		expect(easterSunday(2027).toISOString().slice(0, 10)).toBe('2027-03-28');
	});
});

describe('activeHolidays', () => {
	it('matches fixed-date holidays', () => {
		const keys = activeHolidays(utc('2026-02-14')).map((h) => h.key);
		expect(keys).toContain('valentyn');
	});

	it('matches multi-day ranges (Vánoce Dec 24–26)', () => {
		expect(activeHolidays(utc('2026-12-24')).map((h) => h.key)).toContain('vanoce');
		expect(activeHolidays(utc('2026-12-26')).map((h) => h.key)).toContain('vanoce');
		expect(activeHolidays(utc('2026-12-27')).map((h) => h.key)).not.toContain('vanoce');
	});

	it('matches Easter Monday via computus (2026-04-06)', () => {
		expect(activeHolidays(utc('2026-04-06')).map((h) => h.key)).toContain('velikonoce');
		expect(activeHolidays(utc('2026-04-08')).map((h) => h.key)).not.toContain('velikonoce');
	});

	it('matches Chinese New Year from the year table (2026-02-17, 3 days)', () => {
		expect(activeHolidays(utc('2026-02-17')).map((h) => h.key)).toContain('cny');
		expect(activeHolidays(utc('2026-02-19')).map((h) => h.key)).toContain('cny');
		expect(activeHolidays(utc('2026-02-20')).map((h) => h.key)).not.toContain('cny');
	});

	it('returns nothing on an ordinary day', () => {
		expect(activeHolidays(utc('2026-03-03'))).toEqual([]);
	});
});

describe('upcomingHolidays', () => {
	it('lists holidays starting within the window, soonest first', () => {
		const upcoming = upcomingHolidays(utc('2026-02-10'), 7);
		const keys = upcoming.map((h) => h.key);
		expect(keys[0]).toBe('valentyn'); // Feb 14, in 4 days
		expect(keys).toContain('cny'); // Feb 17, in 7 days
		expect(upcoming[0].inDays).toBe(4);
	});

	it('excludes already-active and out-of-window holidays', () => {
		const keys = upcomingHolidays(utc('2026-12-24'), 5).map((h) => h.key);
		expect(keys).not.toContain('vanoce'); // active now, not "upcoming"
	});

	it('crosses the year boundary (Nový rok from late December)', () => {
		const keys = upcomingHolidays(utc('2026-12-29'), 7).map((h) => h.key);
		expect(keys).toContain('novy-rok');
	});
});

describe('holiday definitions', () => {
	it('every holiday has a stable key, emoji, and unique key', () => {
		const keys = HOLIDAYS.map((h) => h.key);
		expect(new Set(keys).size).toBe(keys.length);
		for (const h of HOLIDAYS) {
			expect(h.key).toMatch(/^[a-z0-9-]+$/);
			expect(h.emoji.length).toBeGreaterThan(0);
		}
	});
});
