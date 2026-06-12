import { describe, expect, it } from 'vitest';
import {
	DEFAULT_SECTION_CONFIGS,
	SECTION_TYPES,
	defaultPropsFor,
	validateSectionConfig,
	type DisplaySectionConfig,
} from './sectionConfig';

const validConfig: DisplaySectionConfig = {
	sections: [
		{ id: 'a', type: 'info-cards', props: {}, visible: true },
		{
			id: 'b',
			type: 'category-photo-grid',
			props: { categoryName: 'drinks', columns: 3, photoSize: 'm' },
			visible: true,
		},
	],
};

describe('validateSectionConfig', () => {
	it('accepts a valid config', () => {
		expect(validateSectionConfig(validConfig)).toEqual([]);
	});

	it('rejects non-object configs and missing sections array', () => {
		expect(validateSectionConfig(null)).not.toEqual([]);
		expect(validateSectionConfig({})).not.toEqual([]);
		expect(validateSectionConfig({ sections: 'nope' })).not.toEqual([]);
	});

	it('rejects unknown section types at write time', () => {
		const errors = validateSectionConfig({
			sections: [{ id: 'x', type: 'hologram', props: {}, visible: true }],
		});
		expect(errors.some((e) => e.includes('hologram'))).toBe(true);
	});

	it('rejects duplicate section ids', () => {
		const errors = validateSectionConfig({
			sections: [
				{ id: 'dup', type: 'info-cards', props: {}, visible: true },
				{ id: 'dup', type: 'text-banner', props: { text: 'hi' }, visible: true },
			],
		});
		expect(errors.some((e) => e.includes('dup'))).toBe(true);
	});

	it('rejects wrong prop types and out-of-range numbers', () => {
		expect(
			validateSectionConfig({
				sections: [
					{
						id: 'g',
						type: 'category-photo-grid',
						props: { categoryName: 'drinks', columns: 9 },
						visible: true,
					},
				],
			}).some((e) => e.includes('columns'))
		).toBe(true);

		expect(
			validateSectionConfig({
				sections: [
					{
						id: 'g',
						type: 'category-photo-grid',
						props: { categoryName: 42 },
						visible: true,
					},
				],
			}).some((e) => e.includes('categoryName'))
		).toBe(true);
	});

	it('rejects select values outside the allowed options', () => {
		const errors = validateSectionConfig({
			sections: [
				{
					id: 'g',
					type: 'category-photo-grid',
					props: { categoryName: 'drinks', photoSize: 'xxl' },
					visible: true,
				},
			],
		});
		expect(errors.some((e) => e.includes('photoSize'))).toBe(true);
	});

	it('ignores unknown prop keys (forward compatibility) and allows missing ones', () => {
		expect(
			validateSectionConfig({
				sections: [
					{
						id: 'g',
						type: 'category-photo-grid',
						props: { categoryName: 'drinks', futureProp: 'whatever' },
						visible: true,
					},
				],
			})
		).toEqual([]);
	});
});

describe('defaults', () => {
	it('defaultPropsFor returns every field default', () => {
		const props = defaultPropsFor('category-photo-grid');
		expect(props.categoryName).toBe('drinks');
		expect(props.columns).toBe(0);
		expect(props.photoSize).toBe('m');
	});

	it('every built-in default config validates (default = current behavior)', () => {
		for (const [slug, config] of Object.entries(DEFAULT_SECTION_CONFIGS)) {
			expect(validateSectionConfig(config), `default config for ${slug}`).toEqual([]);
		}
	});

	it('tv-info default reproduces today’s page: info cards, extras, drinks grid', () => {
		const types = DEFAULT_SECTION_CONFIGS['tv-info']!.sections.map((s) => s.type);
		expect(types).toEqual(['info-cards', 'extras-list', 'category-photo-grid']);
		const drinks = DEFAULT_SECTION_CONFIGS['tv-info']!.sections[2]!;
		expect(drinks.props.categoryName).toBe('drinks');
		expect(drinks.props.columns).toBe(0); // single evenly-spread row, as today
	});

	it('registry type list and field specs cover each other', () => {
		expect(SECTION_TYPES.length).toBeGreaterThanOrEqual(4);
		for (const type of SECTION_TYPES) {
			expect(defaultPropsFor(type)).toBeDefined();
		}
	});
});
