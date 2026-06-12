<script lang="ts">
	import AllergenBadge from '../AllergenBadge.svelte';
	import BilingualName from '../atoms/BilingualName.svelte';
	import ItemPhoto from '../atoms/ItemPhoto.svelte';
	import PriceTag from '../atoms/PriceTag.svelte';
	import type { Doc } from '../../../../convex/_generated/dataModel';

	export let item: Doc<'menuItems'>;

	// Per-page display overrides (set from the page's saved settings).
	// Default to `true` so a page with no saved settings behaves exactly as before.
	export let showImages: boolean = true;
	export let showChinese: boolean = true;
	export let showAllergens: boolean = true;
</script>

<article class="tv-item" data-available={item.isAvailable}>
	{#if showImages && item.imageUrl}
		<ItemPhoto src={item.imageUrl} alt={item.name} />
	{/if}

	<div class="tv-item-body">
		<div class="tv-item-top">
			<div class="tv-item-names">
				<BilingualName
					name={item.name}
					nameLocal={item.nameLocal}
					nameChinese={item.nameChinese}
					{showChinese}
				/>
			</div>

			<PriceTag price={item.price} priceTiers={item.priceTiers} quantity={item.quantity} />
		</div>

		{#if (showAllergens && item.allergenCodes && item.allergenCodes.length > 0) || item.isFeatured || item.isSweet || item.isGlutenFree}
			<div class="tv-item-meta">
				{#if showAllergens && item.allergenCodes && item.allergenCodes.length > 0}
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
