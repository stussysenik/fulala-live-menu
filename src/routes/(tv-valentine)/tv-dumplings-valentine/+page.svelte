<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import TvCategory from '$lib/components/tv/TvCategory.svelte';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];
	$: category = menu.find((c: any) => c.name === 'steamed-dumplings');
</script>

<svelte:head>
	<title>FULALA.CZ | Parní Knedlíčky / Steamed Dumplings ♥</title>
</svelte:head>

<div class="tv-dumplings-valentine">
	{#if category}
		<TvCategory {category} items={category.items} />
	{:else}
		<div class="tv-loading">Načítání menu...</div>
	{/if}

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

	.tv-loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--tv-item-name-size, 40px);
		color: var(--color-text-muted, #6B6B6B);
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
