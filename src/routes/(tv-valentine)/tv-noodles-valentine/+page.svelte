<script lang="ts">
	/**
	 * Valentine theme = skin only. Reads the SAME published config as its base
	 * slug (tv-noodles) through the same SectionRenderer — edit once, both
	 * themes update. The route group's +layout.svelte supplies Valentine
	 * styling; this page only adds decorative overlays.
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

	const pageSettingsQuery = browser ? useQuery(api.settings.getPageSettings) : null;
	$: pageSettings = $pageSettingsQuery?.[SLUG] ?? {};
	$: overrides = {
		showImages: pageSettings.showImages ?? true,
		showChinese: pageSettings.showChinese ?? true,
		showAllergens: pageSettings.showAllergens ?? true,
	};
</script>

<svelte:head>
	<title>FULALA.CZ | Polévky s Nudlemi / Noodle Soups ♥</title>
</svelte:head>

<div class="tv-noodles-valentine">
	<SectionRenderer {sections} {overrides} />

	<!-- Decorative: fortune coin with heart center -->
	<div class="v-decor-fortune" aria-hidden="true">
		<svg viewBox="0 0 120 120" fill="none">
			<!-- Outer circle (fortune coin) -->
			<circle cx="60" cy="60" r="55" stroke="#D4A76A" stroke-width="1.5" opacity="0.1"/>
			<circle cx="60" cy="60" r="48" stroke="#D4A76A" stroke-width="0.8" opacity="0.08"/>
			<!-- Heart in center (replacing the square hole) -->
			<path d="M60 42 C54 32, 40 32, 40 45 C40 58, 60 70, 60 70 C60 70, 80 58, 80 45 C80 32, 66 32, 60 42Z"
				stroke="#E83636" stroke-width="1.5" fill="none" opacity="0.12"/>
			<!-- Fortune dots at compass points -->
			<circle cx="60" cy="8" r="3" fill="#D4A76A" opacity="0.1"/>
			<circle cx="60" cy="112" r="3" fill="#D4A76A" opacity="0.1"/>
			<circle cx="8" cy="60" r="3" fill="#D4A76A" opacity="0.1"/>
			<circle cx="112" cy="60" r="3" fill="#D4A76A" opacity="0.1"/>
		</svg>
	</div>
</div>

<style>
	.tv-noodles-valentine {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		--tv-item-shrink: 1;
		position: relative;
	}

	.v-decor-fortune {
		position: absolute;
		bottom: 4px;
		right: 4px;
		width: 120px;
		height: 120px;
		pointer-events: none;
		z-index: 0;
	}
</style>
