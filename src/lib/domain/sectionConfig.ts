/**
 * Section config domain — types, field specs, validation, defaults.
 *
 * Pure TS (no Svelte/Convex imports) so the same truth runs in three places:
 *  - `convex/displaySections.ts` rejects malformed configs at write time
 *  - the admin composer builds its props editors from the field specs
 *  - vitest exercises validation without a browser or database
 *
 * The component registry (`$lib/components/sections/registry.ts`) binds
 * these specs to Svelte components — components stay out of this module so
 * it loads anywhere.
 */

export interface SectionInstance {
	id: string;
	type: string;
	props: Record<string, unknown>;
	visible: boolean;
}

export interface DisplaySectionConfig {
	sections: SectionInstance[];
}

export interface SectionPropField {
	key: string;
	label: string;
	kind: 'text' | 'number' | 'boolean' | 'select' | 'category';
	/** Allowed values for 'select' fields. */
	options?: readonly string[];
	min?: number;
	max?: number;
	default: unknown;
}

export interface SectionTypeSpec {
	label: string;
	description: string;
	fields: SectionPropField[];
}

export const SECTION_TYPE_SPECS: Record<string, SectionTypeSpec> = {
	'menu-category': {
		label: 'Menu category',
		description: 'Full category list — photo, bilingual + Chinese name, price, allergens',
		fields: [
			{ key: 'categoryName', label: 'Category', kind: 'category', default: 'steamed-dumplings' },
		],
	},
	'info-cards': {
		label: 'Info cards',
		description: 'Customer info cards (discounts) from site settings',
		fields: [],
	},
	'extras-list': {
		label: 'Extras list',
		description: 'Compact two-column price list of a category',
		fields: [
			{ key: 'title', label: 'Title', kind: 'text', default: 'EXTRA' },
			{ key: 'categoryName', label: 'Category', kind: 'category', default: 'extras' },
		],
	},
	'category-photo-grid': {
		label: 'Category photo grid',
		description: 'Image-forward grid of a category with names and prices',
		fields: [
			{ key: 'categoryName', label: 'Category', kind: 'category', default: 'drinks' },
			{ key: 'title', label: 'Title', kind: 'text', default: '' },
			{ key: 'columns', label: 'Columns (0 = one row)', kind: 'number', min: 0, max: 4, default: 0 },
			{ key: 'photoSize', label: 'Photo size', kind: 'select', options: ['s', 'm', 'l'], default: 'm' },
			{ key: 'showPrices', label: 'Show prices', kind: 'boolean', default: true },
			{ key: 'showChinese', label: 'Show Chinese names', kind: 'boolean', default: true },
			{ key: 'maxItems', label: 'Max items (0 = all)', kind: 'number', min: 0, max: 24, default: 0 },
		],
	},
	'text-banner': {
		label: 'Text banner',
		description: 'Bilingual announcement banner',
		fields: [
			{ key: 'text', label: 'Text (EN)', kind: 'text', default: '' },
			{ key: 'textLocal', label: 'Text (CZ)', kind: 'text', default: '' },
			{ key: 'style', label: 'Style', kind: 'select', options: ['accent', 'plain'], default: 'accent' },
		],
	},
};

export const SECTION_TYPES = Object.keys(SECTION_TYPE_SPECS);

/** Default props for a freshly added section of the given type. */
export function defaultPropsFor(type: string): Record<string, unknown> {
	const spec = SECTION_TYPE_SPECS[type];
	if (!spec) return {};
	return Object.fromEntries(spec.fields.map((f) => [f.key, f.default]));
}

function validateProp(field: SectionPropField, value: unknown): string | null {
	switch (field.kind) {
		case 'text':
		case 'category':
			if (typeof value !== 'string') return `"${field.key}" must be a string`;
			return null;
		case 'boolean':
			if (typeof value !== 'boolean') return `"${field.key}" must be a boolean`;
			return null;
		case 'number':
			if (typeof value !== 'number' || !Number.isFinite(value))
				return `"${field.key}" must be a number`;
			if (field.min !== undefined && value < field.min)
				return `"${field.key}" must be ≥ ${field.min}`;
			if (field.max !== undefined && value > field.max)
				return `"${field.key}" must be ≤ ${field.max}`;
			return null;
		case 'select':
			if (typeof value !== 'string' || !(field.options ?? []).includes(value))
				return `"${field.key}" must be one of: ${(field.options ?? []).join(', ')}`;
			return null;
	}
}

/**
 * Validate a full section config. Returns [] when valid, otherwise
 * human-readable errors. Truth at the boundary: the save mutation rejects on
 * any error, so a TV can trust whatever is stored.
 *
 * Forward compatibility: unknown prop KEYS are ignored (newer code may have
 * written them), but unknown section TYPES are rejected — the admin can only
 * compose types this deployment knows how to render.
 */
export function validateSectionConfig(config: unknown): string[] {
	const errors: string[] = [];

	if (typeof config !== 'object' || config === null) {
		return ['config must be an object with a "sections" array'];
	}
	const sections = (config as DisplaySectionConfig).sections;
	if (!Array.isArray(sections)) {
		return ['config.sections must be an array'];
	}

	const seenIds = new Set<string>();
	sections.forEach((section, index) => {
		const where = `section ${index}`;
		if (typeof section !== 'object' || section === null) {
			errors.push(`${where}: must be an object`);
			return;
		}
		const { id, type, props, visible } = section as SectionInstance;
		if (typeof id !== 'string' || id.length === 0) {
			errors.push(`${where}: "id" must be a non-empty string`);
		} else if (seenIds.has(id)) {
			errors.push(`${where}: duplicate id "${id}"`);
		} else {
			seenIds.add(id);
		}
		if (typeof visible !== 'boolean') {
			errors.push(`${where}: "visible" must be a boolean`);
		}
		const spec = typeof type === 'string' ? SECTION_TYPE_SPECS[type] : undefined;
		if (!spec) {
			errors.push(`${where}: unknown section type "${String(type)}"`);
			return;
		}
		if (typeof props !== 'object' || props === null) {
			errors.push(`${where}: "props" must be an object`);
			return;
		}
		for (const field of spec.fields) {
			const value = (props as Record<string, unknown>)[field.key];
			if (value === undefined) continue; // missing = component default applies
			const problem = validateProp(field, value);
			if (problem) errors.push(`${where} (${type}): ${problem}`);
		}
	});

	return errors;
}

/**
 * Built-in defaults: a page slug with no stored config renders exactly what
 * the hand-built page rendered before composition existed. tv-info is the
 * first composed page — "info cards, extras, drinks grid".
 */
export const DEFAULT_SECTION_CONFIGS: Record<string, DisplaySectionConfig> = {
	'tv-dumplings': {
		sections: [
			{
				id: 'dumplings',
				type: 'menu-category',
				props: { categoryName: 'steamed-dumplings' },
				visible: true,
			},
		],
	},
	'tv-noodles': {
		sections: [
			{
				id: 'noodles',
				type: 'menu-category',
				props: { categoryName: 'noodle-soups' },
				visible: true,
			},
		],
	},
	'tv-info': {
		sections: [
			{ id: 'info-cards', type: 'info-cards', props: {}, visible: true },
			{
				id: 'extras',
				type: 'extras-list',
				props: { title: 'EXTRA', categoryName: 'extras' },
				visible: true,
			},
			{
				id: 'drinks-grid',
				type: 'category-photo-grid',
				props: {
					categoryName: 'drinks',
					title: 'Nápoje / Drinks',
					columns: 0,
					photoSize: 'm',
					showPrices: true,
					showChinese: true,
					maxItems: 0,
				},
				visible: true,
			},
		],
	},
};
