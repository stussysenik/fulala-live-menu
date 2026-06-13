<script lang="ts">
	/**
	 * tv-noodles — composable display page.
	 *
	 * Layer rule: pages are just config. Reads the published section
	 * composition from Convex and hands it to SectionRenderer; the sections
	 * fetch their own data. Until something is published for this slug, the
	 * built-in default ([menu-category: noodle-soups]) reproduces the page
	 * exactly as it was hardcoded — publishing is opt-in, never forced.
	 */
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import SectionRenderer from '$lib/components/sections/SectionRenderer.svelte';
	import { DEFAULT_SECTION_CONFIGS } from '$lib/domain/sectionConfig';

	const SLUG = 'tv-noodles';

	const configQuery = browser
		? useQuery(api.displaySections.getPublishedConfig, { slug: SLUG })
		: null;
	$: sections = ($configQuery ?? DEFAULT_SECTION_CONFIGS[SLUG]).sections;

	// Per-page display settings for this screen. Spread as overrides so they
	// win over section props — the staff kill switch beats the composition.
	const pageSettingsQuery = browser ? useQuery(api.settings.getPageSettings) : null;
	$: pageSettings = $pageSettingsQuery?.[SLUG] ?? {};
	$: overrides = {
		showImages: pageSettings.showImages ?? true,
		showChinese: pageSettings.showChinese ?? true,
		showAllergens: pageSettings.showAllergens ?? true,
	};
</script>

<svelte:head>
	<title>FULALA.CZ | Polévky s Nudlemi / Noodle Soups</title>
</svelte:head>

<div class="tv-noodles-page">
	<SectionRenderer {sections} {overrides} />
</div>

<style>
	.tv-noodles-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		--tv-item-shrink: 1;
	}
</style>
