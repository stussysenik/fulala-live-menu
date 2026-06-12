/**
 * Section registry — the single mapping from section `type` strings to
 * components and their editable props.
 *
 * Registry over conditionals: adding a section type is one component, one
 * entry here, and one props validator in `convex/displaySections.ts`.
 * `SectionRenderer` resolves types through this object; the admin composer
 * builds its props editors from the same `fields` metadata, so the editor
 * can never drift from what components actually accept.
 */
import type { Component } from 'svelte';
import CategoryPhotoGrid from './CategoryPhotoGrid.svelte';
import ExtrasList from './ExtrasList.svelte';
import InfoCards from './InfoCards.svelte';
import TextBanner from './TextBanner.svelte';

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

export interface SectionTypeDef {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: Component<any>;
	label: string;
	description: string;
	fields: SectionPropField[];
}

export const SECTION_REGISTRY: Record<string, SectionTypeDef> = {
	'info-cards': {
		component: InfoCards as unknown as Component<any>,
		label: 'Info cards',
		description: 'Customer info cards (discounts) from site settings',
		fields: [],
	},
	'extras-list': {
		component: ExtrasList as unknown as Component<any>,
		label: 'Extras list',
		description: 'Compact two-column price list of a category',
		fields: [
			{ key: 'title', label: 'Title', kind: 'text', default: 'EXTRA' },
			{ key: 'categoryName', label: 'Category', kind: 'category', default: 'extras' },
		],
	},
	'category-photo-grid': {
		component: CategoryPhotoGrid as unknown as Component<any>,
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
		component: TextBanner as unknown as Component<any>,
		label: 'Text banner',
		description: 'Bilingual announcement banner',
		fields: [
			{ key: 'text', label: 'Text (EN)', kind: 'text', default: '' },
			{ key: 'textLocal', label: 'Text (CZ)', kind: 'text', default: '' },
			{ key: 'style', label: 'Style', kind: 'select', options: ['accent', 'plain'], default: 'accent' },
		],
	},
};

export type SectionType = keyof typeof SECTION_REGISTRY;

/** Default props for a freshly added section of the given type. */
export function defaultPropsFor(type: string): Record<string, unknown> {
	const def = SECTION_REGISTRY[type];
	if (!def) return {};
	return Object.fromEntries(def.fields.map((f) => [f.key, f.default]));
}
