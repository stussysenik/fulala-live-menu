/**
 * Holiday decor engine — pure TS, no Svelte/Convex imports.
 *
 * Knows which holidays are active or coming up and what minimal decoration
 * each one carries (an emoji and a single accent color). It decides nothing
 * about WHETHER to decorate — that is an explicit per-holiday opt-in stored
 * as user preference ("introduce, don't assume"). This module is the
 * extractable core: date rules + decor data + two query functions, designed
 * so the holiday list and the rule kinds can grow without touching callers.
 *
 * Date rules (all evaluated in UTC, date-only, fully deterministic):
 *  - fixed:  same calendar date every year (May 1), optional multi-day span
 *  - easter: offset in days from Easter Sunday (computus, no tables)
 *  - table:  explicit year → "MM-DD" lookup for lunisolar dates (Chinese
 *            New Year, Mid-Autumn) — editable data, the extension point
 */

export interface Holiday {
	/** Stable identifier preferences are stored under. */
	key: string;
	name: string;
	nameLocal?: string;
	emoji: string;
	/** Single minimalist accent override (e.g. the TV's --color-accent). */
	accentColor?: string;
}

type DateRule =
	| { kind: 'fixed'; month: number; day: number; days?: number }
	| { kind: 'easter'; offset: number; days?: number }
	| { kind: 'table'; dates: Record<number, string>; days?: number };

export interface HolidayDef extends Holiday {
	rule: DateRule;
}

/** Anonymous Gregorian computus (Meeus/Jones/Butcher) — Easter Sunday, UTC. */
export function easterSunday(year: number): Date {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
	const day = ((h + l - 7 * m + 114) % 31) + 1;
	return new Date(Date.UTC(year, month - 1, day));
}

// Lunisolar dates have no closed-form rule worth carrying — a small lookup
// table is honest and trivially editable. Extend the years as time passes.
const CNY_DATES: Record<number, string> = {
	2025: '01-29',
	2026: '02-17',
	2027: '02-06',
	2028: '01-26',
	2029: '02-13',
	2030: '02-03',
	2031: '01-23',
	2032: '02-11',
	2033: '01-31',
	2034: '02-19',
	2035: '02-08',
};

const MID_AUTUMN_DATES: Record<number, string> = {
	2025: '10-06',
	2026: '09-25',
	2027: '09-15',
	2028: '10-03',
	2029: '09-22',
	2030: '09-12',
	2031: '10-01',
	2032: '09-19',
	2033: '09-08',
	2034: '09-27',
	2035: '09-16',
};

/**
 * The decor catalog: Czech public holidays a restaurant guest feels, plus
 * the Chinese festivals a dumpling shop celebrates, plus Valentine's (the
 * shop already runs a Valentine TV variant). Accents stay in the existing
 * palette's saturation range — celebration, not a redesign.
 */
export const HOLIDAYS: HolidayDef[] = [
	{
		key: 'novy-rok',
		name: 'New Year',
		nameLocal: 'Nový rok',
		emoji: '🎆',
		accentColor: '#B8860B',
		rule: { kind: 'fixed', month: 1, day: 1 },
	},
	{
		key: 'valentyn',
		name: "Valentine's Day",
		nameLocal: 'Valentýn',
		emoji: '💘',
		accentColor: '#E8527E',
		rule: { kind: 'fixed', month: 2, day: 14 },
	},
	{
		key: 'cny',
		name: 'Chinese New Year',
		nameLocal: 'Čínský nový rok',
		emoji: '🧧',
		accentColor: '#D4351C',
		rule: { kind: 'table', dates: CNY_DATES, days: 3 },
	},
	{
		key: 'velikonoce',
		name: 'Easter Monday',
		nameLocal: 'Velikonoční pondělí',
		emoji: '🐰',
		accentColor: '#7CB342',
		// Good Friday through Easter Monday (offset -2, four days).
		rule: { kind: 'easter', offset: -2, days: 4 },
	},
	{
		key: 'svatek-prace',
		name: 'Labour Day',
		nameLocal: 'Svátek práce',
		emoji: '🌷',
		rule: { kind: 'fixed', month: 5, day: 1 },
	},
	{
		key: 'mid-autumn',
		name: 'Mid-Autumn Festival',
		nameLocal: 'Svátek středu podzimu',
		emoji: '🥮',
		accentColor: '#C8861B',
		rule: { kind: 'table', dates: MID_AUTUMN_DATES },
	},
	{
		key: 'den-statnosti',
		name: 'Czech Statehood Day',
		nameLocal: 'Den české státnosti',
		emoji: '🇨🇿',
		rule: { kind: 'fixed', month: 9, day: 28 },
	},
	{
		key: 'vznik-csr',
		name: 'Czechoslovak Independence Day',
		nameLocal: 'Vznik samostatného Československa',
		emoji: '🇨🇿',
		rule: { kind: 'fixed', month: 10, day: 28 },
	},
	{
		key: 'mikulas',
		name: 'St. Nicholas Day',
		nameLocal: 'Mikuláš',
		emoji: '🎅',
		rule: { kind: 'fixed', month: 12, day: 5 },
	},
	{
		key: 'vanoce',
		name: 'Christmas',
		nameLocal: 'Vánoce',
		emoji: '🎄',
		accentColor: '#1B6E3C',
		rule: { kind: 'fixed', month: 12, day: 24, days: 3 },
	},
];

const DAY_MS = 24 * 60 * 60 * 1000;

const utcMidnight = (d: Date) =>
	Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/** Start (UTC midnight ms) of a holiday's occurrence in `year`, or null. */
function occurrenceStart(rule: DateRule, year: number): number | null {
	switch (rule.kind) {
		case 'fixed':
			return Date.UTC(year, rule.month - 1, rule.day);
		case 'easter':
			return utcMidnight(easterSunday(year)) + rule.offset * DAY_MS;
		case 'table': {
			const date = rule.dates[year];
			if (!date) return null;
			const [month, day] = date.split('-').map(Number);
			return Date.UTC(year, month - 1, day);
		}
	}
}

const spanDays = (rule: DateRule) => rule.days ?? 1;

const toPublic = ({ rule: _rule, ...holiday }: HolidayDef): Holiday => holiday;

/** Holidays whose span covers `date` (UTC calendar day). */
export function activeHolidays(date: Date): Holiday[] {
	const today = utcMidnight(date);
	const year = date.getUTCFullYear();
	return HOLIDAYS.filter((h) =>
		// Check both years around the boundary: a span starting Dec 31 of the
		// previous year can still cover early January.
		[year - 1, year].some((y) => {
			const start = occurrenceStart(h.rule, y);
			return start !== null && today >= start && today < start + spanDays(h.rule) * DAY_MS;
		}),
	).map(toPublic);
}

export interface UpcomingHoliday extends Holiday {
	/** ISO date (YYYY-MM-DD) the holiday starts. */
	startsOn: string;
	/** Whole days until it starts (1 = tomorrow). */
	inDays: number;
}

/** Holidays starting within `withinDays` (excluding already-active ones), soonest first. */
export function upcomingHolidays(date: Date, withinDays = 14): UpcomingHoliday[] {
	const today = utcMidnight(date);
	const year = date.getUTCFullYear();
	const upcoming: UpcomingHoliday[] = [];
	for (const h of HOLIDAYS) {
		for (const y of [year, year + 1]) {
			const start = occurrenceStart(h.rule, y);
			if (start === null) continue;
			const inDays = Math.round((start - today) / DAY_MS);
			if (inDays > 0 && inDays <= withinDays) {
				upcoming.push({
					...toPublic(h),
					startsOn: new Date(start).toISOString().slice(0, 10),
					inDays,
				});
				break;
			}
		}
	}
	return upcoming.sort((a, b) => a.inDays - b.inDays);
}
