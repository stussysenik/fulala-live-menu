<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import TvCategory from '$lib/components/tv/TvCategory.svelte';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];
	$: category = menu.find((c: any) => c.name === 'noodle-soups');

	const extras = [
		{ nameCS: '+ Vejce na měkko', nameEN: 'Boiled Egg', price: 29 },
		{ nameCS: '+ Vejce do hněda', nameEN: 'Over-Easy Egg', price: 29 },
		{ nameCS: '+ Nudle', nameEN: 'Extra Noodles', price: 49 },
		{ nameCS: '+ Kuřecí', nameEN: 'Chicken', price: 79 },
		{ nameCS: '+ Vepřové', nameEN: 'Pork', price: 79 },
		{ nameCS: '+ Hovězí', nameEN: 'Beef', price: 99 },
	];
</script>

<svelte:head>
	<title>FULALA.CZ | Polévky s Nudlemi / Noodle Soups</title>
</svelte:head>

<div class="tv-noodles-page">
	{#if category}
		<TvCategory {category} items={category.items} />
	{:else}
		<div class="tv-loading">Načítání menu...</div>
	{/if}

	<section class="tv-extras">
		<h3 class="tv-extras-title">EXTRA</h3>
		<div class="tv-extras-grid">
			{#each extras as extra}
				<div class="tv-extras-item">
					<span class="tv-extras-name">
						{extra.nameCS}
						<span class="tv-extras-name-en">/ {extra.nameEN}</span>
					</span>
					<span class="tv-extras-price">{extra.price} Kč</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.tv-noodles-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.tv-loading {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--tv-item-name-size, 40px);
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-extras {
		flex-shrink: 0;
		padding-top: 12px;
		border-top: 2px solid var(--color-border, #E8E8E4);
		margin-top: auto;
	}

	.tv-extras-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-tag-size, 24px);
		font-weight: 700;
		color: var(--color-accent, #E83636);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 8px;
	}

	.tv-extras-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px 32px;
	}

	.tv-extras-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.tv-extras-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		color: var(--color-text, #2C2C2C);
		font-weight: 500;
	}

	.tv-extras-name-en {
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-extras-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-price, #16a34a);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
