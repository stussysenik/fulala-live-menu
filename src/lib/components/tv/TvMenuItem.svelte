<script lang="ts">
	import AllergenBadge from '../AllergenBadge.svelte';
	import type { Doc } from '../../../../convex/_generated/dataModel';

	export let item: Doc<'menuItems'>;

	// Always show both languages (bilingual display)
	// Skip secondary if it's identical to primary
	$: primaryName = item.nameLocal || item.name;
	$: secondaryName = item.nameLocal && item.nameLocal !== item.name ? item.name : '';

	// Format price in CZK
	function formatPrice(price: number): string {
		return `${price} Kč`;
	}
</script>

<article class="tv-item" data-available={item.isAvailable}>
	{#if item.imageUrl}
		<div class="tv-item-image">
			<img src={item.imageUrl} alt={item.name} loading="eager" decoding="async" />
		</div>
	{/if}

	<div class="tv-item-body">
		<div class="tv-item-top">
			<div class="tv-item-names">
				<h3 class="tv-item-name">{primaryName}</h3>
				{#if item.nameChinese}
					<span class="tv-item-chinese">{item.nameChinese}</span>
				{/if}
				{#if secondaryName}
					<p class="tv-item-secondary">{secondaryName}</p>
				{/if}
			</div>

			<div class="tv-item-price-col" class:tv-item-tiers={item.priceTiers && item.priceTiers.length > 0}>
				{#if item.priceTiers && item.priceTiers.length > 0}
					{#each item.priceTiers as tier}
						<div class="tv-tier-row">
							<span class="tv-item-quantity">{tier.quantity}</span>
							<span class="tv-item-price">{formatPrice(tier.price)}</span>
						</div>
					{/each}
				{:else}
					{#if item.quantity}
						<span class="tv-item-quantity">{item.quantity}</span>
					{/if}
					<span class="tv-item-price">{formatPrice(item.price)}</span>
				{/if}
			</div>
		</div>

		{#if (item.allergenCodes && item.allergenCodes.length > 0) || item.isFeatured || item.isSweet || item.isGlutenFree}
			<div class="tv-item-meta">
				{#if item.allergenCodes && item.allergenCodes.length > 0}
					<span class="tv-allergen-codes">
						{#each item.allergenCodes as code}
							<AllergenBadge {code} />
						{/each}
					</span>
				{/if}
				{#if item.isFeatured}
					<span class="tv-tag tv-tag-featured">Doporučujeme</span>
				{/if}
				{#if item.isSweet}
					<span class="tv-tag tv-tag-sweet">Sladké / Sweet</span>
				{/if}
				{#if item.isGlutenFree}
					<span class="tv-tag tv-tag-gf">Bezlepkové / GF</span>
				{/if}
			</div>
		{/if}
	</div>

	{#if !item.isAvailable}
		<div class="tv-item-unavailable">VYPRODÁNO / SOLD OUT</div>
	{/if}
</article>

<style>
	.tv-item {
		display: flex;
		align-items: flex-start;
		gap: 20px;
		padding: var(--tv-item-padding, 16px) 0;
		border-bottom: 1px solid var(--color-border, #E8E8E4);
		position: relative;
		flex-shrink: var(--tv-item-shrink, 0);
	}

	.tv-item:last-child {
		border-bottom: none;
	}

	.tv-item[data-available="false"] {
		opacity: 0.4;
	}

	.tv-item-image {
		width: var(--tv-image-size, 120px);
		height: var(--tv-image-size, 120px);
		min-width: var(--tv-image-size, 120px);
		min-height: var(--tv-image-size, 120px);
		border-radius: var(--tv-image-radius, 12px);
		overflow: hidden;
		flex-shrink: 0;
	}

	.tv-item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.tv-item-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.tv-item-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}

	.tv-item-names {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.tv-item-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-size, 40px);
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.tv-item-chinese {
		font-size: var(--tv-chinese-size, 32px);
		color: var(--color-text-muted, #6B6B6B);
		font-weight: 400;
		line-height: 1.2;
	}

	.tv-item-secondary {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.2;
	}

	.tv-item-price-col {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
		gap: 2px;
	}

	.tv-item-quantity {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-quantity-size, 26px);
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-item-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-price-size, 48px);
		font-weight: 600;
		color: var(--color-price, #16a34a);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		line-height: 1;
	}

	.tv-item-tiers {
		gap: 6px;
	}

	.tv-tier-row {
		display: flex;
		align-items: baseline;
		gap: 8px;
		white-space: nowrap;
	}

	.tv-tier-row .tv-item-quantity {
		font-size: 24px;
		min-width: 4ch;
		text-align: right;
	}

	.tv-tier-row .tv-item-price {
		font-size: var(--tv-tier-price-size, 32px);
	}

	.tv-item-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.tv-allergen-codes {
		display: inline-flex;
		gap: 6px;
		flex-wrap: wrap;
		align-items: center;
	}

	/* Scale up the reused AllergenBadge component */
	.tv-allergen-codes :global(.allergen-badge) {
		min-width: var(--tv-allergen-badge-size, 36px);
		height: var(--tv-allergen-badge-size, 36px);
		font-size: var(--tv-allergen-size, 24px);
		border-width: 2px;
	}

	.tv-tag {
		display: inline-block;
		padding: 6px 16px;
		border-radius: 16px;
		font-size: var(--tv-tag-size, 24px);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.tv-tag-featured {
		background: color-mix(in srgb, var(--color-accent, #E83636) 12%, transparent);
		color: var(--color-accent, #E83636);
	}

	.tv-tag-sweet {
		background: color-mix(in srgb, #D4A76A 15%, transparent);
		color: #8B6914;
	}

	.tv-tag-gf {
		background: color-mix(in srgb, var(--color-available, #2d5016) 12%, transparent);
		color: var(--color-available, #2d5016);
	}

	.tv-item-unavailable {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-tag-size, 24px);
		font-weight: 700;
		color: var(--color-unavailable, #dc2626);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		background: rgba(255, 255, 255, 0.9);
		padding: 8px 20px;
		border-radius: 8px;
	}
</style>
