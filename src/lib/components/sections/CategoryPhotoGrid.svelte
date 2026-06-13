<script lang="ts">
	/**
	 * Section: image-forward grid of one category's items — photo, bilingual
	 * name, optional price. The flagship composed section (drinks today;
	 * dumplings/noodles galleries whenever evidence asks for them).
	 *
	 * Layer rule: sections fetch via queries and compose atoms; pages are
	 * just config. Items without photos render the ItemPhoto placeholder so
	 * the grid rhythm never breaks; the composer separately reports which
	 * items lack photography.
	 */
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import ItemPhoto from '../atoms/ItemPhoto.svelte';
	import SectionTitle from '../atoms/SectionTitle.svelte';
	import { isReadyForDisplay, displayName, secondaryName } from '$lib/domain/menuItem';

	/** Stable category name to read (portable across deployments). */
	export let categoryName: string;
	/** Optional heading rendered with the standard section title atom. */
	export let title: string = '';
	/** 2–4 grid columns; 0 = single row spread evenly (the drinks look). */
	export let columns: number = 0;
	/** Photo tile size. */
	export let photoSize: 's' | 'm' | 'l' = 'm';
	export let showPrices: boolean = true;
	export let showChinese: boolean = true;
	/** Page-level kill switch (per-page display settings) for photos. */
	export let showImages: boolean = true;
	/** Cap the number of items shown (0 = no limit). */
	export let maxItems: number = 0;

	const PHOTO_SIZES = { s: '96px', m: '120px', l: '168px' } as const;

	const category = browser
		? useQuery(api.menu.getCategoryWithItems, { name: categoryName })
		: null;

	// Hard rail: incomplete drafts never reach the grid. Then the existing
	// availability and max-items rules apply on top.
	$: items = ($category?.items ?? [])
		.filter((i) => isReadyForDisplay(i) && i.isAvailable)
		.slice(0, maxItems > 0 ? maxItems : undefined);
</script>

{#if items.length > 0}
	<section class="tv-info-section tv-photo-grid">
		{#if title}
			<SectionTitle {title} />
		{/if}
		<div
			class="tv-photo-grid-items"
			class:tv-photo-grid-columns={columns > 0}
			style:--tv-photo-grid-columns={columns > 0 ? columns : undefined}
			style:--tv-image-size={PHOTO_SIZES[photoSize]}
		>
			{#each items as item (item._id)}
				<div class="tv-photo-card">
					{#if showImages}
						<ItemPhoto src={item.imageUrl} alt={displayName(item)} />
					{/if}
					<div class="tv-photo-name">
						{displayName(item)}
						{#if showChinese && item.nameChinese}
							<span class="tv-photo-cn">{item.nameChinese}</span>
						{/if}
					</div>
					{#if showPrices && item.price}
						<div class="tv-photo-price">{item.price} Kč</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Default: one row spread evenly — the original tv-info drinks layout. */
	.tv-photo-grid-items {
		display: flex;
		gap: 24px;
		justify-content: space-evenly;
	}

	/* Configured columns switch the row into a wrapping grid. */
	.tv-photo-grid-columns {
		display: grid;
		grid-template-columns: repeat(var(--tv-photo-grid-columns, 3), 1fr);
		gap: 24px;
		justify-items: center;
	}

	.tv-photo-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		flex: 1;
		max-width: calc(var(--tv-image-size, 120px) + 60px);
	}

	.tv-photo-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
		text-align: center;
		line-height: 1.2;
	}

	.tv-photo-cn {
		display: block;
		font-size: var(--tv-quantity-size, 26px);
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-photo-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-price, #16a34a);
		font-variant-numeric: tabular-nums;
	}
</style>
