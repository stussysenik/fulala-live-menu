/**
 * Section registry — binds section `type` strings to Svelte components.
 *
 * The editable field specs, validation, and defaults live in the pure
 * domain module (`$lib/domain/sectionConfig`) so Convex mutations and unit
 * tests share them without importing Svelte components. This file only adds
 * the component bindings. Adding a section type = one component, one spec
 * entry in the domain module, one binding here.
 */
import type { Component } from 'svelte';
import {
	SECTION_TYPE_SPECS,
	defaultPropsFor,
	type SectionPropField,
	type SectionTypeSpec,
} from '$lib/domain/sectionConfig';
import CategoryPhotoGrid from './CategoryPhotoGrid.svelte';
import ExtrasList from './ExtrasList.svelte';
import InfoCards from './InfoCards.svelte';
import TextBanner from './TextBanner.svelte';

export type { SectionPropField, SectionTypeSpec };
export { SECTION_TYPE_SPECS, defaultPropsFor };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionTypeDef = SectionTypeSpec & { component: Component<any> };

const COMPONENTS: Record<string, Component<any>> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	'info-cards': InfoCards as unknown as Component<any>,
	'extras-list': ExtrasList as unknown as Component<any>,
	'category-photo-grid': CategoryPhotoGrid as unknown as Component<any>,
	'text-banner': TextBanner as unknown as Component<any>,
};

export const SECTION_REGISTRY: Record<string, SectionTypeDef> = Object.fromEntries(
	Object.entries(SECTION_TYPE_SPECS)
		.filter(([type]) => COMPONENTS[type] !== undefined)
		.map(([type, spec]) => [type, { ...spec, component: COMPONENTS[type]! }])
);
