<script lang="ts">
	import TvMenuItem from './TvMenuItem.svelte';
	import type { Doc } from '../../../../convex/_generated/dataModel';

	export let category: Doc<'categories'>;
	export let items: Doc<'menuItems'>[];

	// Show both languages for category title
	$: titleCS = category.displayNameLocal || category.displayName;
	$: titleEN = category.displayNameLocal ? category.displayName : '';

	$: sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
	$: availableItems = sortedItems.filter((item) => item.isAvailable);
</script>

{#if category.isActive}
	<section class="tv-category">
		<div class="tv-category-header">
			<h2 class="tv-category-title">{titleCS}</h2>
			{#if titleEN}
				<span class="tv-category-title-en">{titleEN}</span>
			{/if}
			{#if category.subtitle}
				<p class="tv-category-subtitle">{category.subtitle}</p>
			{/if}
		</div>
		<div class="tv-items">
			{#each availableItems as item (item._id)}
				<TvMenuItem {item} />
			{/each}
		</div>
	</section>
{/if}

<style>
	.tv-category {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.tv-category-header {
		padding-bottom: 16px;
		border-bottom: 4px solid var(--color-accent, #E83636);
		margin-bottom: 8px;
	}

	.tv-category-title {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: var(--tv-title-size, 64px);
		font-weight: 700;
		color: var(--color-text, #2C2C2C);
		line-height: 1.1;
		letter-spacing: 0.03em;
	}

	.tv-category-title-en {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: calc(var(--tv-title-size, 64px) * 0.6);
		font-weight: 600;
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.2;
		display: block;
		margin-top: 2px;
	}

	.tv-category-subtitle {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-subtitle-size, 32px);
		color: var(--color-text-muted, #6B6B6B);
		margin-top: 4px;
		letter-spacing: 0.02em;
	}

	.tv-items {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		justify-content: space-evenly;
		overflow: hidden;
	}
</style>
