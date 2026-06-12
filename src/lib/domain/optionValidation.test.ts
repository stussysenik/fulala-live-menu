import { describe, expect, it } from 'vitest';
import {
	legacyToOptionGroups,
	validateSelections,
	type OptionGroupConfig,
} from './optionValidation';

const noodleConfig: OptionGroupConfig[] = [
	{ key: 'noodleType', values: ['thin', 'flat', 'thick'], required: true },
	{ key: 'spiceLevel', values: ['mild', 'medium', 'hot'], required: false },
	{ key: 'addOns', values: ['Extra pork', 'Extra tofu'], required: false, multi: true },
];

describe('validateSelections', () => {
	it('accepts a complete valid selection', () => {
		const issues = validateSelections(noodleConfig, {
			noodleType: 'thin',
			spiceLevel: 'mild',
		});
		expect(issues).toEqual([]);
	});

	it('flags a missing required group', () => {
		const issues = validateSelections(noodleConfig, { spiceLevel: 'mild' });
		expect(issues).toHaveLength(1);
		expect(issues[0]).toMatchObject({ groupKey: 'noodleType', code: 'missing-required' });
	});

	it('flags a selection for a group the item does not have', () => {
		const issues = validateSelections(noodleConfig, {
			noodleType: 'thin',
			brothType: 'clear',
		});
		expect(issues).toHaveLength(1);
		expect(issues[0]).toMatchObject({ groupKey: 'brothType', code: 'unknown-group' });
	});

	it('flags a value outside the allowed list', () => {
		const issues = validateSelections(noodleConfig, { noodleType: 'udon' });
		expect(issues).toHaveLength(1);
		expect(issues[0]).toMatchObject({ groupKey: 'noodleType', code: 'unknown-value' });
	});

	it('accepts multiple values only for multi groups', () => {
		expect(
			validateSelections(noodleConfig, {
				noodleType: 'thin',
				addOns: ['Extra pork', 'Extra tofu'],
			})
		).toEqual([]);
		const issues = validateSelections(noodleConfig, {
			noodleType: ['thin', 'flat'],
		});
		expect(issues).toHaveLength(1);
		expect(issues[0]).toMatchObject({ groupKey: 'noodleType', code: 'multiple-not-allowed' });
	});

	it('validates each value of a multi selection', () => {
		const issues = validateSelections(noodleConfig, {
			noodleType: 'thin',
			addOns: ['Extra pork', 'Boba'],
		});
		expect(issues).toHaveLength(1);
		expect(issues[0]).toMatchObject({ groupKey: 'addOns', code: 'unknown-value' });
	});

	it('an item with no option config accepts only empty selections', () => {
		expect(validateSelections(undefined, undefined)).toEqual([]);
		expect(validateSelections(undefined, {})).toEqual([]);
		const issues = validateSelections(undefined, { spiceLevel: 'hot' });
		expect(issues).toHaveLength(1);
		expect(issues[0]).toMatchObject({ groupKey: 'spiceLevel', code: 'unknown-group' });
	});

	it('treats empty-string and empty-array selections as not selected', () => {
		const issues = validateSelections(noodleConfig, { noodleType: '', addOns: [] });
		expect(issues).toHaveLength(1);
		expect(issues[0]).toMatchObject({ groupKey: 'noodleType', code: 'missing-required' });
	});
});

describe('legacyToOptionGroups', () => {
	it('converts legacy modifiers to optional option groups', () => {
		const groups = legacyToOptionGroups({
			modifiers: {
				noodleType: ['thin', 'flat'],
				spiceLevel: ['mild', 'hot'],
			},
		});
		expect(groups).toEqual([
			{ key: 'noodleType', values: ['thin', 'flat'], required: false },
			{ key: 'spiceLevel', values: ['mild', 'hot'], required: false },
		]);
	});

	it('converts legacy drink options including multi add-ons', () => {
		const groups = legacyToOptionGroups({
			drinkOptions: {
				temperatures: ['hot', 'iced'],
				sugarLevels: ['0%', '50%', '100%'],
				addOns: [
					{ name: 'Honey', price: 15 },
					{ name: 'Lemon', price: 10 },
				],
			},
		});
		expect(groups).toEqual([
			{ key: 'temperature', values: ['hot', 'iced'], required: false },
			{ key: 'sugarLevel', values: ['0%', '50%', '100%'], required: false },
			{ key: 'addOns', values: ['Honey', 'Lemon'], required: false, multi: true },
		]);
	});

	it('skips empty legacy groups and returns [] when nothing is configured', () => {
		expect(legacyToOptionGroups({})).toEqual([]);
		expect(legacyToOptionGroups({ modifiers: { noodleType: [] } })).toEqual([]);
	});

	it('explicit optionGroups win over legacy fields', () => {
		const explicit: OptionGroupConfig[] = [
			{ key: 'noodleType', values: ['thin'], required: true },
		];
		const groups = legacyToOptionGroups({
			optionGroups: explicit,
			modifiers: { spiceLevel: ['mild'] },
		});
		expect(groups).toEqual(explicit);
	});
});
