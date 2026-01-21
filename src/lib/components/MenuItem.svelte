<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import ChangeIndicator from './ChangeIndicator.svelte';
	import PriceDisplay from './PriceDisplay.svelte';
	import MenuItemImage from './MenuItemImage.svelte';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import type { ThemeConfig } from '$lib/theme/defaults';
	import { defaultTheme } from '$lib/theme/defaults';

	export let item: Doc<'menuItems'>;

	// Get theme from context
	const themeStore = getContext<Writable<ThemeConfig>>('theme');
	$: theme = $themeStore ?? defaultTheme;

	// Format price for aria-label (always with $)
	function formatPriceLabel(cents: number): string {
		return `$${(cents / 100).toFixed(2)}`;
	}

	// Check if item was recently modified (within last 5 minutes)
	$: isRecentlyModified = Date.now() - item.lastModifiedAt < 5 * 60 * 1000;

	// Determine price alignment style
	$: useDots = theme.display.priceAlignment === 'dots';

	// Check if we should show images
	$: showImage = theme.display.showImages && item.imageUrl;
</script>

<article
	class="menu-item"
	class:with-image={showImage}
	data-available={item.isAvailable}
	data-testid="menu-item"
	aria-label="{item.name}, {formatPriceLabel(item.price)}{item.isAvailable ? '' : ', currently unavailable'}"
>
	{#if showImage && item.imageUrl}
		<MenuItemImage src={item.imageUrl} alt={item.name} />
	{/if}
	<div class="item-content">
		<div class="item-header" class:with-dots={useDots}>
			<h3 class="item-name">
				{item.name}
				{#if isRecentlyModified}
					<ChangeIndicator />
				{/if}
			</h3>
			<PriceDisplay price={item.price} />
		</div>
		{#if item.description}
			<p class="item-description">{item.description}</p>
		{/if}
		{#if item.allergens && item.allergens.length > 0}
			<p class="item-allergens">
				Contains: {item.allergens.join(', ')}
			</p>
		{/if}
		{#if !item.isAvailable}
			<span class="unavailable-badge" aria-hidden="true">Sold Out</span>
		{/if}
	</div>
</article>

<style>
	.menu-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-3);
		background: var(--color-surface, var(--surface));
		border-radius: var(--radius-md);
		transition: opacity var(--transition-fast);
		line-height: var(--line-spacing, 1.5);
	}

	.menu-item.with-image {
		flex-direction: row;
		align-items: flex-start;
	}

	.menu-item[data-available="false"] {
		opacity: 0.5;
	}

	.item-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
		min-width: 0;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
	}

	.item-header.with-dots {
		align-items: baseline;
	}

	.item-name {
		font-family: var(--font-body, var(--font));
		font-size: var(--text-body, var(--text-base));
		font-weight: 600;
		color: var(--color-text, var(--text));
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.item-header.with-dots .item-name {
		flex-shrink: 1;
	}

	.item-description {
		font-family: var(--font-body, var(--font));
		font-size: var(--text-sm);
		color: var(--color-text-muted, var(--text-muted));
		line-height: var(--line-spacing, 1.5);
	}

	.item-allergens {
		font-family: var(--font-body, var(--font));
		font-size: var(--text-allergen, var(--text-xs));
		color: var(--color-text-muted, var(--text-muted));
		font-style: italic;
	}

	.unavailable-badge {
		display: inline-block;
		font-size: var(--text-allergen, var(--text-xs));
		font-weight: 600;
		color: var(--color-unavailable, var(--unavailable));
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: var(--space-1);
	}
</style>
