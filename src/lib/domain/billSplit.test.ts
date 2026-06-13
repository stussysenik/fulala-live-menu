import { describe, it, expect } from 'vitest';
import { splitBill } from './billSplit';

describe('splitBill', () => {
	it('splits evenly when divisible', () => {
		expect(splitBill(900, 3)).toEqual([300, 300, 300]);
	});

	it('distributes the remainder to the first shares', () => {
		expect(splitBill(1000, 3)).toEqual([334, 333, 333]);
		expect(splitBill(787, 4)).toEqual([197, 197, 197, 196]);
	});

	it('always sums back to the total', () => {
		for (const [total, people] of [
			[1234, 5],
			[99, 7],
			[786, 4],
			[1, 2],
		] as const) {
			const shares = splitBill(total, people);
			expect(shares.reduce((a, b) => a + b, 0)).toBe(total);
			expect(shares.length).toBe(people);
		}
	});

	it('returns the whole total for fewer than 2 people', () => {
		expect(splitBill(500, 1)).toEqual([500]);
		expect(splitBill(500, 0)).toEqual([500]);
	});

	it('guards against junk input', () => {
		expect(splitBill(-5, 3)).toEqual([]);
		expect(splitBill(NaN, 3)).toEqual([]);
	});
});
