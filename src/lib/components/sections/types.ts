/**
 * Display section composition — the data shape behind composed display pages.
 *
 * A page is an ordered list of section instances. Each instance carries a
 * stable `id` (for keyed rendering and reordering), a registry `type`, a
 * `props` bag validated per type at write time, and a `visible` flag so
 * sections can be parked without losing their configuration.
 *
 * Deliberately a list, not a canvas: deterministic to render, trivially
 * diffable in version history, and recitable by a human — "info cards,
 * extras, drinks grid".
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
