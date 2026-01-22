<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { Doc } from '../../../../convex/_generated/dataModel';
	import type { ThemeConfig } from '$lib/theme/defaults';
	import { defaultTheme } from '$lib/theme/defaults';
	import PriceDisplay from '../PriceDisplay.svelte';
	import { createEventDispatcher } from 'svelte';

	export let categories: Array<Doc<'categories'> & { items: Doc<'menuItems'>[] }>;
	export let config: {
		columnsPerRow?: number;
		showCheckboxes?: boolean;
		showItemNumbers?: boolean;
		showImages?: boolean;
		categoryStyle?: 'header' | 'tabs' | 'colored';
		showQuantityInput?: boolean;
		colorScheme?: 'classic-red' | 'jade-green' | 'gold';
	} = {};

	const dispatch = createEventDispatcher<{
		select: { item: Doc<'menuItems'>; quantity: number };
	}>();

	const themeStore = getContext<Writable<ThemeConfig>>('theme');
	$: theme = $themeStore ?? defaultTheme;

	// Track quantities for items
	let quantities: Record<string, number> = {};

	// Color schemes for traditional Chinese style
	const colorSchemes = {
		'classic-red': {
			primary: '#c41e3a',
			secondary: '#fdf5e6',
			accent: '#8b0000',
			border: '#c41e3a',
			headerBg: '#c41e3a',
			headerText: '#fdf5e6',
		},
		'jade-green': {
			primary: '#2e8b57',
			secondary: '#f0fff0',
			accent: '#006400',
			border: '#2e8b57',
			headerBg: '#2e8b57',
			headerText: '#f0fff0',
		},
		'gold': {
			primary: '#b8860b',
			secondary: '#fffaf0',
			accent: '#8b6914',
			border: '#b8860b',
			headerBg: '#b8860b',
			headerText: '#fffaf0',
		},
	};

	$: scheme = colorSchemes[config.colorScheme ?? 'classic-red'];
	$: columns = config.columnsPerRow ?? 2;

	function getQuantity(itemId: string): number {
		return quantities[itemId] || 0;
	}

	function setQuantity(itemId: string, value: number) {
		if (value <= 0) {
			delete quantities[itemId];
			quantities = { ...quantities };
		} else {
			quantities = { ...quantities, [itemId]: value };
		}
	}

	function handleQuantityChange(item: Doc<'menuItems'>, delta: number) {
		if (!item.isAvailable) return;
		const current = getQuantity(item._id);
		const newQty = Math.max(0, current + delta);
		setQuantity(item._id, newQty);
		if (newQty > 0) {
			dispatch('select', { item, quantity: newQty });
		}
	}

	function handleInputChange(item: Doc<'menuItems'>, event: Event) {
		const input = event.target as HTMLInputElement;
		const value = parseInt(input.value) || 0;
		setQuantity(item._id, Math.max(0, value));
		if (value > 0) {
			dispatch('select', { item, quantity: value });
		}
	}

	function handleItemClick(item: Doc<'menuItems'>) {
		if (!item.isAvailable) return;
		const current = getQuantity(item._id);
		if (current === 0) {
			setQuantity(item._id, 1);
			dispatch('select', { item, quantity: 1 });
		}
	}

	// Ornamental characters for decoration
	const ornaments = ['龍', '鳳', '壽', '福', '喜'];
</script>

<div
	class="traditional-menu"
	style:--primary={scheme.primary}
	style:--secondary={scheme.secondary}
	style:--accent={scheme.accent}
	style:--border-color={scheme.border}
	style:--header-bg={scheme.headerBg}
	style:--header-text={scheme.headerText}
>
	<!-- Decorative header -->
	<header class="menu-header">
		<span class="ornament left">{ornaments[0]}</span>
		<div class="header-content">
			<h1 class="menu-title">點心單</h1>
			<p class="menu-subtitle">DIM SUM ORDER</p>
		</div>
		<span class="ornament right">{ornaments[1]}</span>
	</header>

	{#each categories as category, categoryIndex}
		<section class="category-section">
			<header class="category-header">
				<span class="category-ornament">{ornaments[(categoryIndex + 2) % ornaments.length]}</span>
				<h2 class="category-title">{category.displayName}</h2>
				<span class="category-ornament">{ornaments[(categoryIndex + 3) % ornaments.length]}</span>
			</header>

			<div class="items-grid" style:--columns={columns}>
				{#each category.items as item (item._id)}
					<div
						class="order-item"
						class:unavailable={!item.isAvailable}
						class:has-quantity={getQuantity(item._id) > 0}
					>
						<button
							class="item-main"
							on:click={() => handleItemClick(item)}
							disabled={!item.isAvailable}
							type="button"
						>
							{#if config.showItemNumbers && item.itemCode}
								<span class="item-number">{item.itemCode}</span>
							{/if}
							<span class="item-name">{item.name}</span>
							<span class="item-price">
								<PriceDisplay price={item.price} />
							</span>
						</button>

						{#if config.showQuantityInput && item.isAvailable}
							<div class="quantity-box">
								<button
									type="button"
									class="qty-btn minus"
									on:click={() => handleQuantityChange(item, -1)}
									disabled={getQuantity(item._id) === 0}
								>
									−
								</button>
								<input
									type="number"
									class="qty-input"
									value={getQuantity(item._id) || ''}
									placeholder="0"
									min="0"
									max="99"
									on:change={(e) => handleInputChange(item, e)}
								/>
								<button
									type="button"
									class="qty-btn plus"
									on:click={() => handleQuantityChange(item, 1)}
								>
									+
								</button>
							</div>
						{/if}

						{#if !item.isAvailable}
							<span class="sold-out">售罄 SOLD OUT</span>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/each}

	<!-- Decorative footer -->
	<footer class="menu-footer">
		<div class="footer-ornaments">
			{#each ornaments as char}
				<span class="footer-ornament">{char}</span>
			{/each}
		</div>
		<p class="footer-text">請在數量欄填寫</p>
		<p class="footer-text-en">Please fill in quantity</p>
	</footer>
</div>

<style>
	.traditional-menu {
		font-family: 'Noto Serif TC', 'Songti SC', 'SimSun', Georgia, serif;
		background: var(--secondary);
		border: 3px double var(--border-color);
		border-radius: 0;
		padding: var(--space-4, 1rem);
	}

	/* Decorative header */
	.menu-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4, 1rem);
		padding: var(--space-4, 1rem);
		margin-bottom: var(--space-4, 1rem);
		border-bottom: 2px solid var(--border-color);
	}

	.ornament {
		font-size: 2.5rem;
		color: var(--primary);
		opacity: 0.8;
	}

	.header-content {
		text-align: center;
	}

	.menu-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--primary);
		margin: 0;
		letter-spacing: 0.3em;
	}

	.menu-subtitle {
		font-size: 0.875rem;
		color: var(--accent);
		margin: var(--space-1, 0.25rem) 0 0;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	/* Category sections */
	.category-section {
		margin-bottom: var(--space-4, 1rem);
		border: 1px solid var(--border-color);
	}

	.category-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3, 0.75rem);
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		background: var(--header-bg);
	}

	.category-ornament {
		font-size: 1.25rem;
		color: var(--header-text);
		opacity: 0.8;
	}

	.category-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--header-text);
		margin: 0;
		letter-spacing: 0.15em;
	}

	/* Items grid */
	.items-grid {
		display: grid;
		grid-template-columns: repeat(var(--columns, 2), 1fr);
		background: var(--secondary);
	}

	.order-item {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border-color);
		border-top: none;
		position: relative;
		background: var(--secondary);
	}

	.order-item:nth-child(odd) {
		border-right: none;
	}

	.order-item.unavailable {
		opacity: 0.5;
	}

	.order-item.has-quantity {
		background: rgba(255, 215, 0, 0.15);
	}

	.item-main {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		flex: 1;
		transition: background-color 0.15s ease;
	}

	.item-main:hover:not(:disabled) {
		background: rgba(0, 0, 0, 0.05);
	}

	.item-number {
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--primary);
		background: var(--secondary);
		border: 1px solid var(--primary);
		padding: 2px 6px;
		border-radius: 2px;
		min-width: 32px;
		text-align: center;
	}

	.item-name {
		flex: 1;
		font-size: 0.9375rem;
		color: #1a1a1a;
		line-height: 1.3;
	}

	.item-price {
		font-family: 'Courier New', monospace;
		font-weight: 600;
		color: var(--accent);
		font-size: 0.875rem;
	}

	/* Quantity input box */
	.quantity-box {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1, 0.25rem);
		padding: var(--space-2, 0.5rem);
		background: rgba(0, 0, 0, 0.03);
		border-top: 1px dashed var(--border-color);
	}

	.qty-btn {
		width: 28px;
		height: 28px;
		border: 1px solid var(--border-color);
		background: var(--secondary);
		color: var(--primary);
		font-size: 1.25rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.qty-btn:hover:not(:disabled) {
		background: var(--primary);
		color: var(--secondary);
	}

	.qty-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.qty-input {
		width: 50px;
		height: 28px;
		border: 2px solid var(--border-color);
		background: white;
		text-align: center;
		font-family: 'Courier New', monospace;
		font-size: 1rem;
		font-weight: 700;
		color: var(--primary);
	}

	.qty-input:focus {
		outline: none;
		border-color: var(--primary);
	}

	.qty-input::placeholder {
		color: #ccc;
	}

	/* Hide number input spinners */
	.qty-input::-webkit-outer-spin-button,
	.qty-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.qty-input[type='number'] {
		-moz-appearance: textfield;
	}

	.sold-out {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(-15deg);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--primary);
		background: rgba(255, 255, 255, 0.9);
		padding: 4px 12px;
		border: 2px solid var(--primary);
	}

	/* Footer */
	.menu-footer {
		margin-top: var(--space-4, 1rem);
		padding-top: var(--space-3, 0.75rem);
		border-top: 2px solid var(--border-color);
		text-align: center;
	}

	.footer-ornaments {
		display: flex;
		justify-content: center;
		gap: var(--space-4, 1rem);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.footer-ornament {
		font-size: 1.25rem;
		color: var(--primary);
		opacity: 0.6;
	}

	.footer-text {
		font-size: 0.875rem;
		color: var(--accent);
		margin: 0;
	}

	.footer-text-en {
		font-size: 0.75rem;
		color: var(--accent);
		margin: var(--space-1, 0.25rem) 0 0;
		opacity: 0.8;
	}

	/* Responsive */
	@media (max-width: 480px) {
		.items-grid {
			grid-template-columns: 1fr;
		}

		.order-item {
			border-right: 1px solid var(--border-color) !important;
		}

		.menu-title {
			font-size: 1.5rem;
		}

		.ornament {
			font-size: 1.75rem;
		}
	}

	/* Print styles */
	@media print {
		.traditional-menu {
			border: 2px solid black;
		}

		.qty-btn {
			display: none;
		}

		.qty-input {
			border: 1px solid black;
		}
	}
</style>
