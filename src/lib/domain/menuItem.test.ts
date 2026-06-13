import { describe, expect, it } from 'vitest';
import {
	displayName,
	secondaryName,
	hasValidPrice,
	menuItemReadiness,
	isReadyForDisplay,
	readinessSummary,
	readyForDisplay,
	type MenuItemLike
} from './menuItem';

// A complete, sellable item — the baseline every test mutates from.
const complete: MenuItemLike = {
	name: 'Pork Dumpling',
	nameLocal: 'Vepřové knedlíčky',
	price: 89,
	categoryId: 'cat_1'
};

describe('displayName — Czech-first headline', () => {
	it('headlines the Czech name when present', () => {
		expect(displayName(complete)).toBe('Vepřové knedlíčky');
	});

	it('falls back to English when there is no Czech name', () => {
		expect(displayName({ name: 'Coke', categoryId: 'c' })).toBe('Coke');
	});

	it('trims whitespace and ignores blank Czech names', () => {
		expect(displayName({ name: 'Tea', nameLocal: '   ', categoryId: 'c' })).toBe('Tea');
	});

	it('is empty only when both names are blank — this is the sync-bug guard', () => {
		expect(displayName({ name: '', nameLocal: '', categoryId: 'c' })).toBe('');
		// Editing EITHER name must move the headline; the admin field and the TV
		// title now resolve through this one function, so they can't disagree.
		expect(displayName({ name: 'X', nameLocal: '', categoryId: 'c' })).toBe('X');
		expect(displayName({ name: '', nameLocal: 'Y', categoryId: 'c' })).toBe('Y');
	});
});

describe('secondaryName — English under a Czech headline', () => {
	it('shows English as the secondary line when a distinct Czech headline exists', () => {
		expect(secondaryName(complete)).toBe('Pork Dumpling');
	});

	it('hides the secondary line when there is no Czech headline (English is already the title)', () => {
		expect(secondaryName({ name: 'Coke', categoryId: 'c' })).toBe('');
	});

	it('hides the secondary line when the two names are identical', () => {
		expect(secondaryName({ name: 'Espresso', nameLocal: 'Espresso', categoryId: 'c' })).toBe('');
	});
});

describe('hasValidPrice', () => {
	it('accepts a positive flat price', () => {
		expect(hasValidPrice({ price: 89 })).toBe(true);
	});

	it('rejects a zero or missing price (the draft default)', () => {
		expect(hasValidPrice({ price: 0 })).toBe(false);
		expect(hasValidPrice({})).toBe(false);
		expect(hasValidPrice({ price: -5 })).toBe(false);
	});

	it('accepts valid price tiers and ignores the flat price', () => {
		expect(
			hasValidPrice({
				price: 0,
				priceTiers: [
					{ quantity: '4ks', price: 79 },
					{ quantity: '6ks', price: 109 }
				]
			})
		).toBe(true);
	});

	it('rejects tiers that are empty or contain a 0/blank entry', () => {
		expect(hasValidPrice({ priceTiers: [] })).toBe(false);
		expect(hasValidPrice({ priceTiers: [{ quantity: '4ks', price: 0 }] })).toBe(false);
		expect(hasValidPrice({ priceTiers: [{ quantity: '', price: 79 }] })).toBe(false);
	});
});

describe('menuItemReadiness — the production hard rail', () => {
	it('a complete item is ready with nothing missing', () => {
		expect(menuItemReadiness(complete)).toEqual({ ready: true, missing: [] });
	});

	it('a freshly-created draft (price 0) is railed off for needing a price', () => {
		// This is exactly what SectionItemsEditor.addItem() inserts.
		const draft: MenuItemLike = {
			name: 'New item',
			nameLocal: 'Nová položka',
			price: 0,
			categoryId: 'cat_1'
		};
		expect(menuItemReadiness(draft)).toEqual({ ready: false, missing: ['price'] });
		expect(isReadyForDisplay(draft)).toBe(false);
	});

	it('reports every missing field at once', () => {
		expect(menuItemReadiness({ name: '', nameLocal: '', price: 0 })).toEqual({
			ready: false,
			missing: ['name', 'price', 'category']
		});
	});

	it('a sold-out but complete item is still ready (availability is a separate axis)', () => {
		// No isAvailable here — readiness must not depend on it. The screens show
		// complete sold-out items struck through; they are not "incomplete".
		expect(isReadyForDisplay({ ...complete })).toBe(true);
	});
});

describe('readinessSummary — admin badge text', () => {
	it('is empty for a ready item', () => {
		expect(readinessSummary(complete)).toBe('');
	});

	it('names a single missing field', () => {
		expect(readinessSummary({ ...complete, price: 0 })).toBe('Needs price');
	});

	it('joins multiple missing fields readably', () => {
		expect(readinessSummary({ price: 0 })).toBe('Needs name, price & category');
	});
});

describe('readyForDisplay — filtering a customer-facing list', () => {
	it('keeps complete items and drops drafts, preserving order', () => {
		const items: MenuItemLike[] = [
			{ name: 'A', price: 50, categoryId: 'c' },
			{ name: 'Draft', price: 0, categoryId: 'c' },
			{ name: 'B', price: 60, categoryId: 'c' }
		];
		expect(readyForDisplay(items).map((i) => i.name)).toEqual(['A', 'B']);
	});

	it('returns an empty list rather than throwing on all-draft input', () => {
		expect(readyForDisplay([{ price: 0 }])).toEqual([]);
	});
});
