<script lang="ts">
	/**
	 * Atom: price column — either multi-tier rows ("6ks 179 Kč") or a single
	 * price with optional portion size.
	 *
	 * Layer rule: atoms never fetch data; props in, markup out. Extracted
	 * verbatim from TvMenuItem — same classes, same CSS variables — so the
	 * live TV pages keep rendering pixel-identically.
	 */
	export let price: number;
	export let priceTiers: { quantity: string; price: number }[] | undefined = undefined;
	export let quantity: string | undefined = undefined;

	$: hasTiers = priceTiers !== undefined && priceTiers.length > 0;

	function formatPrice(value: number): string {
		return `${value} Kč`;
	}
</script>

<div class="tv-item-price-col" class:tv-item-tiers={hasTiers}>
	{#if hasTiers && priceTiers}
		{#each priceTiers as tier}
			<div class="tv-tier-row">
				<span class="tv-item-quantity">{tier.quantity}</span>
				<span class="tv-item-price">{formatPrice(tier.price)}</span>
			</div>
		{/each}
	{:else}
		{#if quantity}
			<span class="tv-item-quantity">{quantity}</span>
		{/if}
		<span class="tv-item-price">{formatPrice(price)}</span>
	{/if}
</div>

<style>
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
		font-size: var(--tv-tier-quantity-size, 24px);
		min-width: 4ch;
		text-align: right;
	}

	.tv-tier-row .tv-item-price {
		font-size: var(--tv-tier-price-size, 32px);
	}
</style>
