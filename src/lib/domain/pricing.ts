/**
 * Order pricing — line totals, VAT, rounding. Pure TS: the Convex mutations
 * and the cart UI import the same arithmetic, so the customer never sees a
 * total that the backend then computes differently.
 *
 * Money convention: whole CZK units (integers), matching menu prices in the
 * database. All rounding happens here and nowhere else.
 */

export interface VatConfig {
	/** e.g. 0.12 for 12 % */
	rate: number;
	/**
	 * 'exclusive': VAT is added on top of menu prices (legacy behavior).
	 * 'inclusive': menu prices already contain VAT — the customer pays the
	 * menu price and `tax` reports the VAT portion inside it (Czech receipts).
	 */
	mode: 'exclusive' | 'inclusive';
}

/**
 * Matches the hardcoded 10 %-on-top behavior the app shipped with, so orders
 * computed before the owner saves a `vat-config` setting stay byte-identical.
 */
export const DEFAULT_VAT_CONFIG: VatConfig = { rate: 0.1, mode: 'exclusive' };

export interface PricedLine {
	unitPrice: number;
	quantity: number;
	/** Per-unit add-on prices (e.g. paid extras), added before multiplying. */
	addOnPrices?: number[];
}

export interface OrderTotals {
	subtotal: number;
	tax: number;
	total: number;
}

export function lineTotal(line: PricedLine): number {
	const addOns = (line.addOnPrices ?? []).reduce((sum, p) => sum + p, 0);
	return (line.unitPrice + addOns) * line.quantity;
}

/** VAT contained in a gross (VAT-inclusive) amount: gross − gross / (1 + rate). */
export function includedVat(gross: number, rate: number): number {
	return Math.round(gross - gross / (1 + rate));
}

export function computeTotals(
	lines: PricedLine[],
	vat: VatConfig = DEFAULT_VAT_CONFIG
): OrderTotals {
	const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);

	if (vat.mode === 'inclusive') {
		return { subtotal, tax: includedVat(subtotal, vat.rate), total: subtotal };
	}

	const tax = Math.round(subtotal * vat.rate);
	return { subtotal, tax, total: subtotal + tax };
}

/** Parse a stored `vat-config` settings value, falling back to the legacy default. */
export function parseVatConfig(value: unknown): VatConfig {
	if (
		typeof value === 'object' &&
		value !== null &&
		typeof (value as VatConfig).rate === 'number' &&
		(value as VatConfig).rate >= 0 &&
		(value as VatConfig).rate < 1 &&
		((value as VatConfig).mode === 'exclusive' || (value as VatConfig).mode === 'inclusive')
	) {
		return { rate: (value as VatConfig).rate, mode: (value as VatConfig).mode };
	}
	return DEFAULT_VAT_CONFIG;
}
