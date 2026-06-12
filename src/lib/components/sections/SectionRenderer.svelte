<script lang="ts">
	/**
	 * SectionRenderer — turns a section config (ordered list of typed
	 * instances) into rendered components via the registry.
	 *
	 * Resilience rule: a TV must never crash on stale config. Unknown
	 * section types log an error and render nothing; every known section
	 * renders independently. `{#key}` on the serialized props recreates a
	 * section when its props change, because sections bind their queries at
	 * component init.
	 */
	import { SECTION_REGISTRY } from './registry';
	import type { SectionInstance } from './types';

	export let sections: SectionInstance[];
	/**
	 * Page-level prop overrides (e.g. the per-page showImages/showChinese
	 * kill switches) — spread after section props so they always win.
	 */
	export let overrides: Record<string, unknown> = {};

	$: visibleSections = sections.filter((s) => s.visible);

	const warned = new Set<string>();
	$: for (const section of visibleSections) {
		if (!SECTION_REGISTRY[section.type] && !warned.has(section.type)) {
			warned.add(section.type);
			console.error(
				`[SectionRenderer] Unknown section type "${section.type}" — section skipped. ` +
					'Known types: ' + Object.keys(SECTION_REGISTRY).join(', ')
			);
		}
	}
</script>

{#each visibleSections as section (section.id)}
	{#if SECTION_REGISTRY[section.type]}
		{#key JSON.stringify(section.props) + JSON.stringify(overrides)}
			<svelte:component
				this={SECTION_REGISTRY[section.type].component}
				{...section.props}
				{...overrides}
			/>
		{/key}
	{/if}
{/each}
