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
	<title>FULALA.CZ | Parní Knedlíčky / Steamed Dumplings</title>
</svelte:head>

{#if category}
	<TvCategory {category} items={category.items} />
{:else}
	<div class="tv-loading">Načítání menu...</div>
{/if}

<style>
	.tv-loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--tv-item-name-size, 40px);
		color: var(--color-text-muted, #6B6B6B);
	}
</style>
