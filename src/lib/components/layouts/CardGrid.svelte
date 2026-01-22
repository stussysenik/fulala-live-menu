<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Doc } from '../../../../convex/_generated/dataModel';
	import type { ThemeConfig } from '$lib/theme/defaults';
	import { defaultTheme } from '$lib/theme/defaults';
	import PriceDisplay from '../PriceDisplay.svelte';
	import DietaryTags from '../DietaryTags.svelte';
	import MenuItemImage from '../MenuItemImage.svelte';
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
		select: { item: Doc<'menuItems'> };
	}>();

	const themeStore = getContext<Writable<ThemeConfig>>('theme');
	$: theme = $themeStore ?? defaultTheme;

	// Tab navigation for 'tabs' style
	let activeCategory: string | null = null;
	$: if (categories.length > 0 && !activeCategory) {
		activeCategory = categories[0]._id;
	}

	$: displayCategories =
		config.categoryStyle === 'tabs' && activeCategory
			? categories.filter((c) => c._id === activeCategory)
			: categories;

	$: columns = config.columnsPerRow ?? 3;
	$: showImages = config.showImages ?? true;

	function handleItemClick(item: Doc<'menuItems'>) {
		if (!item.isAvailable) return;
		dispatch('select', { item });
	}
</script>

<div class="card-grid-menu">
	{#if config.categoryStyle === 'tabs'}
		<nav class="category-tabs" role="tablist">
			{#each categories as category}
				<button
					role="tab"
					class="tab-button"
					class:active={activeCategory === category._id}
					on:click={() => (activeCategory = category._id)}
					aria-selected={activeCategory === category._id}
				>
					{category.displayName}
				</button>
			{/each}
		</nav>
	{/if}

	{#each displayCategories as category (category._id)}
		<section class="category-section">
			{#if config.categoryStyle !== 'tabs'}
				<header class="category-header">
					<h2 class="category-title">{category.displayName}</h2>
				</header>
			{/if}

			<div class="cards-grid" style:--columns={columns}>
				{#each category.items as item (item._id)}
					<button
						class="menu-card"
						class:unavailable={!item.isAvailable}
						class:with-image={showImages && item.imageUrl}
						disabled={!item.isAvailable}
						on:click={() => handleItemClick(item)}
						type="button"
					>
						{#if showImages && item.imageUrl}
							<div class="card-image">
								<MenuItemImage src={item.imageUrl} alt={item.name} />
								{#if !item.isAvailable}
									<div class="sold-out-overlay">
										<span>Sold Out</span>
									</div>
								{/if}
							</div>
						{/if}

						<div class="card-content">
							<div class="card-header">
								{#if config.showItemNumbers && item.itemCode}
									<span class="item-code">{item.itemCode}</span>
								{/if}
								<h3 class="card-title">{item.name}</h3>
							</div>

							{#if item.description}
								<p class="card-description">{item.description}</p>
							{/if}

							{#if item.dietaryTags && item.dietaryTags.length > 0}
								<div class="card-tags">
									<DietaryTags tags={item.dietaryTags} />
								</div>
							{/if}

							<div class="card-footer">
								<div class="card-price">
									<PriceDisplay price={item.price} />
								</div>

								{#if item.isAvailable}
									<span class="add-button">+ Add</span>
								{:else if !showImages || !item.imageUrl}
									<span class="sold-out-text">Sold Out</span>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.card-grid-menu {
		display: flex;
		flex-direction: column;
		gap: var(--space-5, 1.5rem);
	}

	.category-tabs {
		display: flex;
		gap: var(--space-2, 0.5rem);
		overflow-x: auto;
		padding-bottom: var(--space-2, 0.5rem);
		border-bottom: 1px solid var(--color-border, #e5e5e5);
		-webkit-overflow-scrolling: touch;
	}

	.tab-button {
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border: none;
		background: transparent;
		font-family: var(--font-body, system-ui);
		font-size: var(--text-body, 1rem);
		font-weight: 500;
		color: var(--color-text-muted, #666);
		cursor: pointer;
		white-space: nowrap;
		border-radius: var(--radius-md, 8px);
		transition: all 0.15s ease;
	}

	.tab-button:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.tab-button.active {
		background: var(--color-accent, #c45a3b);
		color: white;
	}

	.category-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3, 0.75rem);
	}

	.category-header {
		padding: 0 var(--space-2, 0.5rem);
	}

	.category-title {
		font-family: var(--font-headline, Georgia, serif);
		font-size: var(--text-subheadline, 1.25rem);
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
		margin: 0;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(var(--columns, 3), 1fr);
		gap: var(--space-4, 1rem);
	}

	.menu-card {
		display: flex;
		flex-direction: column;
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-lg, 12px);
		overflow: hidden;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.menu-card:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: var(--color-accent, #c45a3b);
	}

	.menu-card.unavailable {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.card-image {
		position: relative;
		width: 100%;
		aspect-ratio: 4/3;
		overflow: hidden;
		background: var(--color-border, #f0f0f0);
	}

	.card-image :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.sold-out-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sold-out-overlay span {
		color: white;
		font-weight: 700;
		font-size: var(--text-lg, 1.125rem);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-3, 0.75rem);
		flex: 1;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
	}

	.item-code {
		font-family: var(--font-body, system-ui);
		font-size: var(--text-xs, 0.75rem);
		font-weight: 700;
		color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.1);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.card-title {
		font-family: var(--font-body, system-ui);
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
		margin: 0;
		line-height: 1.3;
	}

	.card-description {
		font-family: var(--font-body, system-ui);
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-tags {
		margin-top: auto;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--space-2, 0.5rem);
		padding-top: var(--space-2, 0.5rem);
		border-top: 1px solid var(--color-border, #e5e5e5);
		gap: var(--space-2, 0.5rem);
	}

	.card-price {
		font-weight: 700;
		font-size: var(--text-lg, 1.125rem);
		flex-shrink: 0;
		min-width: fit-content;
	}

	.add-button {
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.1);
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		border-radius: 20px;
		transition: all 0.15s ease;
	}

	.menu-card:hover:not(:disabled) .add-button {
		background: var(--color-accent, #c45a3b);
		color: white;
	}

	.sold-out-text {
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		color: var(--color-unavailable, #dc2626);
		text-transform: uppercase;
	}

	@media (max-width: 768px) {
		.cards-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 480px) {
		.cards-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
