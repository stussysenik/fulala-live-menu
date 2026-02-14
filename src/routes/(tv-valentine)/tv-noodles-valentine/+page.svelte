<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import TvCategory from '$lib/components/tv/TvCategory.svelte';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];
	$: category = menu.find((c: any) => c.name === 'noodle-soups');
</script>

<svelte:head>
	<title>FULALA.CZ | Polévky s Nudlemi / Noodle Soups ♥</title>
</svelte:head>

<div class="tv-noodles-valentine">
	{#if category}
		<TvCategory {category} items={category.items} />
	{:else}
		<div class="tv-loading">Načítání menu...</div>
	{/if}

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

	.tv-loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--tv-item-name-size, 40px);
		color: var(--color-text-muted, #6B6B6B);
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
