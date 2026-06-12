<script lang="ts">
	/**
	 * tv-info — the first composed display page.
	 *
	 * Layer rule: pages are just config. This page reads its published
	 * section composition from Convex and hands it to SectionRenderer;
	 * the sections (info cards, extras list, drinks photo grid) fetch
	 * their own data. Until something is published for this slug, the
	 * built-in default config reproduces the page exactly as it was
	 * hardcoded — publishing is opt-in, never a forced migration.
	 */
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import SectionRenderer from '$lib/components/sections/SectionRenderer.svelte';
	import { DEFAULT_SECTION_CONFIGS } from '$lib/domain/sectionConfig';

	const SLUG = 'tv-info';

	const configQuery = browser
		? useQuery(api.displaySections.getPublishedConfig, { slug: SLUG })
		: null;
	$: sections = ($configQuery ?? DEFAULT_SECTION_CONFIGS[SLUG]).sections;

	// Per-page display settings for this screen (slug: tv-info).
	// Spread as overrides so they win over any section-level props —
	// the staff kill switch beats the composed configuration.
	const pageSettingsQuery = browser ? useQuery(api.settings.getPageSettings) : null;
	$: pageSettings = $pageSettingsQuery?.[SLUG] ?? {};
	$: overrides = {
		showImages: pageSettings.showImages ?? true,
		showChinese: pageSettings.showChinese ?? true,
	};
</script>

<svelte:head>
	<title>FULALA.CZ | Info & Nápoje / Drinks</title>
</svelte:head>

<div class="tv-info-page">
	<SectionRenderer {sections} {overrides} />
</div>

<style>
	.tv-info-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--tv-section-gap, 36px);
		min-height: 0;
		justify-content: space-evenly;
	}
</style>
