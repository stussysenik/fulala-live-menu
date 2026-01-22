<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Doc } from '../../../../convex/_generated/dataModel';
	import type { ThemeConfig } from '$lib/theme/defaults';
	import { defaultTheme } from '$lib/theme/defaults';
	import PriceDisplay from '../PriceDisplay.svelte';
	import DietaryTags from '../DietaryTags.svelte';
	import { createEventDispatcher } from 'svelte';

	export let categories: Array<Doc<'categories'> & { items: Doc<'menuItems'>[] }>;
	export let config: {
		columnsPerRow?: number;
		showCheckboxes?: boolean;
		showItemNumbers?: boolean;
		showImages?: boolean;
		categoryStyle?: 'header' | 'tabs' | 'colored';
	} = {};

	const dispatch = createEventDispatcher<{
		select: { item: Doc<'menuItems'>; quantity: number };
	}>();

	const themeStore = getContext<Writable<ThemeConfig>>('theme');
	$: theme = $themeStore ?? defaultTheme;

	// Track selected items with quantities
	let selectedItems: Record<string, number> = {};

	// Category color palette for dim sum style
	const categoryColors: Record<string, string> = {
		steamed: '#e8f5e9',      // Light green
		fried: '#fff3e0',        // Light orange
		noodles: '#fce4ec',      // Light pink
		desserts: '#f3e5f5',     // Light purple
		default: '#f5f5f5',      // Light grey
	};

	function getCategoryColor(name: string): string {
		const key = name.toLowerCase();
		if (key.includes('steam') || key.includes('蒸')) return categoryColors.steamed;
		if (key.includes('fry') || key.includes('frie') || key.includes('煎') || key.includes('炸')) return categoryColors.fried;
		if (key.includes('noodle') || key.includes('rice') || key.includes('粉') || key.includes('面') || key.includes('饭')) return categoryColors.noodles;
		if (key.includes('dessert') || key.includes('sweet') || key.includes('甜')) return categoryColors.desserts;
		return categoryColors.default;
	}

	function toggleItem(itemId: string) {
		if (selectedItems[itemId]) {
			delete selectedItems[itemId];
			selectedItems = { ...selectedItems };
		} else {
			selectedItems[itemId] = 1;
			selectedItems = { ...selectedItems };
		}
	}

	function updateQuantity(itemId: string, delta: number) {
		const current = selectedItems[itemId] || 0;
		const newQty = Math.max(0, current + delta);
		if (newQty === 0) {
			delete selectedItems[itemId];
			selectedItems = { ...selectedItems };
		} else {
			selectedItems = { ...selectedItems, [itemId]: newQty };
		}
	}

	function handleItemClick(item: Doc<'menuItems'>) {
		if (!item.isAvailable) return;

		if (config.showCheckboxes) {
			toggleItem(item._id);
		}
		dispatch('select', { item, quantity: selectedItems[item._id] || 1 });
	}

	$: columns = config.columnsPerRow ?? 2;
	$: useColors = config.categoryStyle === 'colored';
</script>

<div class="dim-sum-menu">
	{#each categories as category}
		<section
			class="category-section"
			style:--category-bg={useColors ? getCategoryColor(category.name) : 'transparent'}
		>
			<header class="category-header" class:colored={useColors}>
				<h2 class="category-title">{category.displayName}</h2>
			</header>

			<div class="items-grid" style:--columns={columns}>
				{#each category.items as item (item._id)}
					<button
						class="dim-sum-item"
						class:selected={!!selectedItems[item._id]}
						class:unavailable={!item.isAvailable}
						disabled={!item.isAvailable}
						on:click={() => handleItemClick(item)}
						type="button"
					>
						{#if config.showCheckboxes}
							<div class="checkbox" class:checked={!!selectedItems[item._id]}>
								{#if selectedItems[item._id]}
									<span class="checkmark">✓</span>
								{/if}
							</div>
						{/if}

						<div class="item-info">
							{#if config.showItemNumbers && item.itemCode}
								<span class="item-code">{item.itemCode}</span>
							{/if}
							<span class="item-name">{item.name}</span>
							{#if item.dietaryTags && item.dietaryTags.length > 0}
								<DietaryTags tags={item.dietaryTags} compact />
							{/if}
						</div>

						<div class="item-price">
							<PriceDisplay price={item.price} />
						</div>

						{#if selectedItems[item._id] && config.showCheckboxes}
							<div class="quantity-controls" on:click|stopPropagation>
								<button
									type="button"
									class="qty-btn"
									on:click|stopPropagation={() => updateQuantity(item._id, -1)}
								>
									-
								</button>
								<span class="qty-value">{selectedItems[item._id]}</span>
								<button
									type="button"
									class="qty-btn"
									on:click|stopPropagation={() => updateQuantity(item._id, 1)}
								>
									+
								</button>
							</div>
						{/if}

						{#if !item.isAvailable}
							<span class="sold-out-badge">Sold Out</span>
						{/if}
					</button>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.dim-sum-menu {
		display: flex;
		flex-direction: column;
		gap: var(--space-4, 1rem);
	}

	.category-section {
		background: var(--category-bg, transparent);
		border-radius: var(--radius-lg, 12px);
		overflow: hidden;
	}

	.category-header {
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
		border-bottom: 2px solid var(--color-border, #e5e5e5);
	}

	.category-header.colored {
		background: rgba(0, 0, 0, 0.05);
	}

	.category-title {
		font-family: var(--font-headline, Georgia, serif);
		font-size: var(--text-subheadline, 1.25rem);
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
		margin: 0;
	}

	.items-grid {
		display: grid;
		grid-template-columns: repeat(var(--columns, 2), 1fr);
		gap: 1px;
		background: var(--color-border, #e5e5e5);
	}

	.dim-sum-item {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-3, 0.75rem);
		background: var(--color-surface, white);
		border: none;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s ease;
		position: relative;
		min-height: 60px;
	}

	.dim-sum-item:hover:not(:disabled) {
		background: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.1);
	}

	.dim-sum-item.selected {
		background: rgba(45, 80, 22, 0.1);
	}

	.dim-sum-item.unavailable {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox {
		width: 24px;
		height: 24px;
		border: 2px solid var(--color-border, #ccc);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: white;
		transition: all 0.15s ease;
	}

	.checkbox.checked {
		background: var(--color-accent, #2d5016);
		border-color: var(--color-accent, #2d5016);
	}

	.checkmark {
		color: white;
		font-weight: bold;
		font-size: 14px;
	}

	.item-info {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		flex: 1;
		min-width: 0;
		flex-wrap: wrap;
	}

	.item-code {
		font-family: var(--font-body, system-ui);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 700;
		color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.1);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.item-name {
		font-family: var(--font-body, system-ui);
		font-size: var(--text-body, 1rem);
		color: var(--color-text, #1a1a1a);
	}

	.item-price {
		flex-shrink: 0;
		font-weight: 600;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: var(--space-1, 0.25rem);
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: 20px;
		padding: 2px;
	}

	.qty-btn {
		width: 24px;
		height: 24px;
		border: none;
		background: var(--color-accent, #2d5016);
		color: white;
		border-radius: 50%;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qty-btn:hover {
		opacity: 0.9;
	}

	.qty-value {
		min-width: 24px;
		text-align: center;
		font-weight: 600;
		font-size: var(--text-sm, 0.875rem);
	}

	.sold-out-badge {
		position: absolute;
		top: 50%;
		right: var(--space-3, 0.75rem);
		transform: translateY(-50%);
		font-size: var(--text-xs, 0.75rem);
		font-weight: 700;
		color: var(--color-unavailable, #dc2626);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@media (max-width: 480px) {
		.items-grid {
			grid-template-columns: 1fr;
		}

		.dim-sum-item {
			flex-wrap: wrap;
		}
	}
</style>
