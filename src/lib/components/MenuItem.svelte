<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import ChangeIndicator from './ChangeIndicator.svelte';
	import PriceDisplay from './PriceDisplay.svelte';
	import MenuItemImage from './MenuItemImage.svelte';
	import AllergenBadge from './AllergenBadge.svelte';
	import { getAllergenDisplayName, getAllergenByCode } from '$lib/allergens';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import type { ThemeConfig } from '$lib/theme/defaults';
	import { defaultTheme } from '$lib/theme/defaults';
	import { lang, t } from '$lib/i18n/store';

	export let item: Doc<'menuItems'>;

	// Get theme from context
	const themeStore = getContext<Writable<ThemeConfig>>('theme');
	$: theme = $themeStore ?? defaultTheme;

	// Scroll-triggered entrance animation
	let articleEl: HTMLElement;
	let visible = false;

	onMount(() => {
		if (!articleEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visible = true;
						observer.disconnect();
					}
				});
			},
			{ rootMargin: '20px', threshold: 0.1 }
		);
		observer.observe(articleEl);
		return () => observer.disconnect();
	});

	// Format price for aria-label
	function formatPriceLabel(price: number): string {
		return `${price} Kč`;
	}

	// Check if item was recently modified (within last 5 minutes)
	$: isRecentlyModified = Date.now() - item.lastModifiedAt < 5 * 60 * 1000;

	// Determine price alignment style
	$: useDots = theme.display.priceAlignment === 'dots';

	// Check if we should show images
	$: showImage = theme.display.showImages && item.imageUrl;

	// i18n: primary name based on language
	$: primaryName = $lang === 'cs' && item.nameLocal ? item.nameLocal : item.name;
	$: secondaryName = $lang === 'cs' ? item.name : (item.nameLocal || item.description);
	$: description = $lang === 'cs' ? (item.description || '') : (item.nameLocal || item.description || '');

	// Inline allergen name summary with emoji icons
	function getAllergenSummaryWithIcons(codes: string[], currentLang: string): string {
		return codes.map(code => {
			const info = getAllergenByCode(code);
			const name = getAllergenDisplayName(code, currentLang);
			const icon = info?.allergen?.icon || '';
			return `${icon} ${name}`;
		}).join('  ');
	}

	$: allergenSummary = (item.allergenCodes && item.allergenCodes.length > 0)
		? getAllergenSummaryWithIcons(item.allergenCodes, $lang)
		: '';
</script>

<article
	bind:this={articleEl}
	class="menu-item"
	class:with-image={showImage}
	class:animate-in={visible}
	data-available={item.isAvailable}
	data-testid="menu-item"
	aria-label="{item.name}, {formatPriceLabel(item.price)}{item.isAvailable ? '' : ', currently unavailable'}"
	style="--stagger: {item.sortOrder * 50}ms"
>
	{#if showImage && item.imageUrl}
		<MenuItemImage src={item.imageUrl} alt={item.name} />
	{/if}
	<div class="item-content">
		<div class="item-header" class:with-dots={useDots}>
			<div class="item-name-block">
				<h3 class="item-name">
					<span class="name-primary">{primaryName}</span>
					{#if isRecentlyModified}
						<ChangeIndicator />
					{/if}
				</h3>
				{#if item.nameChinese}
					<span class="name-chinese">{item.nameChinese}</span>
				{/if}
			</div>
			<div class="price-block">
				{#if item.quantity}
					<span class="item-quantity">{item.quantity}</span>
				{/if}
				<PriceDisplay price={item.price} />
			</div>
		</div>
		{#if secondaryName}
			<p class="item-description">
				{secondaryName}
			</p>
		{/if}
		{#if (item.allergenCodes && item.allergenCodes.length > 0) || item.isFeatured || item.isSweet || item.isGlutenFree}
			<div class="item-bottom-row">
				{#if item.allergenCodes && item.allergenCodes.length > 0}
					<span class="allergen-codes">
						{#each item.allergenCodes as code}
							<AllergenBadge {code} />
						{/each}
					</span>
				{/if}
				{#if item.isFeatured}
					<span class="tag tag-featured">{$t.featured}</span>
				{/if}
				{#if item.isSweet}
					<span class="tag tag-sweet">{$t.sweet}</span>
				{/if}
				{#if item.isGlutenFree}
					<span class="tag tag-gf">{$t.glutenFree}</span>
				{/if}
			</div>
		{/if}
		{#if !item.isAvailable}
			<span class="unavailable-badge" aria-hidden="true">{$t.soldOut}</span>
		{/if}
	</div>
</article>

<style>
	.menu-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--spacing-card-padding, var(--space-3));
		background: var(--color-surface, var(--surface));
		border-radius: var(--radius-md);
		transition:
			opacity var(--transition-fast),
			transform var(--anim-duration-normal, 400ms) var(--anim-ease-enter, ease),
			box-shadow var(--anim-duration-normal, 400ms) var(--anim-ease-enter, ease),
			background-color var(--anim-duration-quick, 200ms) ease;
		line-height: var(--line-spacing, 1.6);
		cursor: pointer;

		/* Scroll-triggered entrance: start hidden */
		opacity: 0;
		transform: translateY(12px);
	}

	.menu-item.animate-in {
		animation: card-entrance var(--anim-duration-normal, 400ms) var(--anim-ease-enter, ease) var(--stagger, 0ms) forwards;
	}

	@keyframes card-entrance {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Respect prefers-reduced-motion */
	@media (prefers-reduced-motion: reduce) {
		.menu-item {
			opacity: 1;
			transform: none;
		}
		.menu-item.animate-in {
			animation: none;
		}
	}

	.menu-item:hover:not([data-available="false"]) {
		will-change: transform;
		transform: translateY(-2px) scale(1.01);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.05),
			0 2px 4px -1px rgba(0, 0, 0, 0.03);
		background: color-mix(in srgb, var(--color-surface, var(--surface)) 95%, var(--color-accent, var(--accent)) 5%);
	}

	.menu-item.with-image {
		flex-direction: row;
		align-items: flex-start;
	}

	.menu-item[data-available="false"] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.item-content {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		flex: 1;
		min-width: 0;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.item-header.with-dots {
		align-items: baseline;
	}

	.item-name-block {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex-shrink: 1;
		min-width: 0;
	}

	.item-name {
		font-family: var(--font-body, var(--font));
		font-size: var(--text-body, var(--text-base));
		font-weight: 600;
		color: var(--color-text, var(--text));
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.name-primary {
		flex-shrink: 1;
		min-width: 0;
	}

	.name-chinese {
		display: block;
		font-family: var(--font-body, var(--font));
		font-weight: 400;
		color: var(--color-text-muted, var(--text-muted));
		font-size: 0.85em;
	}

	.allergen-codes {
		display: inline-flex;
		gap: 0.25rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.item-bottom-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
		margin-top: 0.25rem;
	}

	.price-block {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-shrink: 0;
		white-space: nowrap;
		align-self: flex-start;
		margin-top: 2px;
	}

	.item-quantity {
		font-family: var(--font-body, var(--font));
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, var(--text-muted));
	}

	/* Protect price from being compressed on narrow screens */
	.price-block :global(.price) {
		flex-shrink: 0;
		min-width: fit-content;
	}

	.item-description {
		font-family: var(--font-body, var(--font));
		font-size: var(--text-sm);
		color: var(--color-text-muted, var(--text-muted));
		line-height: var(--line-spacing, 1.6);
	}

	.tag {
		display: inline-block;
		padding: 1px 8px;
		border-radius: 12px;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.tag-featured {
		background: color-mix(in srgb, var(--color-accent, #C41E3A) 12%, transparent);
		color: var(--color-accent, #C41E3A);
	}

	.tag-sweet {
		background: color-mix(in srgb, #D4A76A 15%, transparent);
		color: #8B6914;
	}

	.tag-gf {
		background: color-mix(in srgb, var(--color-available, #2d5016) 12%, transparent);
		color: var(--color-available, #2d5016);
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
