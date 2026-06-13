<script lang="ts">
	/**
	 * Valentine theme = skin only. This page reads the SAME published config
	 * as its base slug (tv-dumplings) and renders through the same
	 * SectionRenderer — edit content once in the builder, both themes update.
	 * The route group's +layout.svelte supplies the Valentine styling; this
	 * page only adds decorative overlays.
	 */
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import SectionRenderer from '$lib/components/sections/SectionRenderer.svelte';
	import { DEFAULT_SECTION_CONFIGS } from '$lib/domain/sectionConfig';

	const SLUG = 'tv-dumplings';

	const configQuery = browser
		? useQuery(api.displaySections.getPublishedConfig, { slug: SLUG })
		: null;
	$: sections = ($configQuery ?? DEFAULT_SECTION_CONFIGS[SLUG]).sections;

	const pageSettingsQuery = browser ? useQuery(api.settings.getPageSettings) : null;
	$: pageSettings = $pageSettingsQuery?.[SLUG] ?? {};
	$: overrides = {
		showImages: pageSettings.showImages ?? true,
		showChinese: pageSettings.showChinese ?? true,
		showAllergens: pageSettings.showAllergens ?? true,
	};
</script>

<svelte:head>
	<title>FULALA.CZ | Parní Knedlíčky / Steamed Dumplings ♥</title>
</svelte:head>

<div class="tv-dumplings-valentine">
	<SectionRenderer {sections} {overrides} />

	<!-- Decorative: pair of hearts with steam wisps -->
	<div class="v-decor-hearts" aria-hidden="true">
		<svg viewBox="0 0 180 160" fill="none">
			<!-- Left heart -->
			<path d="M45 45 C35 25, 10 25, 10 50 C10 75, 45 100, 45 100 C45 100, 80 75, 80 50 C80 25, 55 25, 45 45Z"
				stroke="#E83636" stroke-width="1.5" opacity="0.12"/>
			<!-- Right heart (overlapping) -->
			<path d="M135 45 C125 25, 100 25, 100 50 C100 75, 135 100, 135 100 C135 100, 170 75, 170 50 C170 25, 145 25, 135 45Z"
				stroke="#D4A76A" stroke-width="1.5" opacity="0.12"/>
			<!-- Steam wisps above hearts -->
			<path d="M45 20 Q50 5, 45 -5" stroke="#E83636" stroke-width="1" opacity="0.08" stroke-linecap="round"/>
			<path d="M135 20 Q130 5, 135 -5" stroke="#D4A76A" stroke-width="1" opacity="0.08" stroke-linecap="round"/>
			<!-- Connecting vine -->
			<path d="M65 70 Q90 55, 115 70" stroke="#D4A76A" stroke-width="1" opacity="0.1" stroke-linecap="round"/>
		</svg>
	</div>
</div>

<style>
	.tv-dumplings-valentine {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		position: relative;
	}

	.v-decor-hearts {
		position: absolute;
		bottom: 8px;
		right: 8px;
		width: 140px;
		height: 120px;
		pointer-events: none;
		z-index: 0;
	}
</style>
