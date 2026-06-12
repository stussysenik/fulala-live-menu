<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import TvCategory from '$lib/components/tv/TvCategory.svelte';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];
	$: category = menu.find((c: any) => c.name === 'noodle-soups');

	// Per-page display settings for this screen (slug: tv-noodles).
	// Every flag defaults to true so an unconfigured page renders as before.
	const pageSettingsQuery = browser ? useQuery(api.settings.getPageSettings) : null;
	$: pageSettings = $pageSettingsQuery?.['tv-noodles'] ?? {};
	$: showImages = pageSettings.showImages ?? true;
	$: showChinese = pageSettings.showChinese ?? true;
	$: showAllergens = pageSettings.showAllergens ?? true;
</script>

<svelte:head>
	<title>FULALA.CZ | Polévky s Nudlemi / Noodle Soups</title>
</svelte:head>

<div class="tv-noodles-page">
	{#if category}
		<TvCategory {category} items={category.items} {showImages} {showChinese} {showAllergens} />
	{:else}
		<div class="tv-loading">Načítání menu...</div>
	{/if}
</div>

<style>
	.tv-noodles-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		--tv-item-shrink: 1;
	}

	.tv-loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--tv-item-name-size, 40px);
		color: var(--color-text-muted, #6B6B6B);
	}
</style>
