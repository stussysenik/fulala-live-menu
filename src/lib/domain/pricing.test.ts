import { describe, expect, it } from 'vitest';
import {
	DEFAULT_VAT_CONFIG,
	computeTotals,
	includedVat,
	lineTotal,
	type VatConfig,
} from './pricing';

describe('lineTotal', () => {
	it('multiplies unit price by quantity', () => {
		expect(lineTotal({ unitPrice: 189, quantity: 2 })).toBe(378);
	});

	it('adds per-unit add-on prices before multiplying', () => {
		// e.g. noodles 289 + extra pork 69, twice
		expect(lineTotal({ unitPrice: 289, quantity: 2, addOnPrices: [69] })).toBe(716);
	});

	it('treats missing add-ons as zero', () => {
		expect(lineTotal({ unitPrice: 89, quantity: 1, addOnPrices: [] })).toBe(89);
	});
});

describe('computeTotals', () => {
	const items = [
		{ unitPrice: 189, quantity: 1 },
		{ unitPrice: 289, quantity: 2 },
	];

	it('default config reproduces legacy behavior: 10% VAT added on top', () => {
		expect(DEFAULT_VAT_CONFIG).toEqual({ rate: 0.1, mode: 'exclusive' });
		const totals = computeTotals(items);
		expect(totals.subtotal).toBe(767);
		expect(totals.tax).toBe(Math.round(767 * 0.1));
		expect(totals.total).toBe(767 + Math.round(767 * 0.1));
	});

	it('inclusive mode keeps menu prices as the total and reports included VAT', () => {
		const vat: VatConfig = { rate: 0.12, mode: 'inclusive' };
		const totals = computeTotals(items, vat);
		expect(totals.subtotal).toBe(767);
		expect(totals.total).toBe(767); // customers pay the menu price
		expect(totals.tax).toBe(Math.round(767 - 767 / 1.12)); // VAT portion inside
	});

	it('returns zeros for an empty order', () => {
		expect(computeTotals([])).toEqual({ subtotal: 0, tax: 0, total: 0 });
	});

	it('rounds tax to whole CZK', () => {
		const totals = computeTotals([{ unitPrice: 99, quantity: 1 }], {
			rate: 0.12,
			mode: 'exclusive',
		});
		expect(Number.isInteger(totals.tax)).toBe(true);
		expect(totals.tax).toBe(Math.round(99 * 0.12));
	});
});

describe('includedVat', () => {
	it('extracts the VAT portion from a gross amount', () => {
		// 112 gross at 12% → 12 VAT, 100 net
		expect(includedVat(112, 0.12)).toBe(12);
	});
});
