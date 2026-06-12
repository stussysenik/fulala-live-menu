<script lang="ts">
	/**
	 * Section: compact two-column price list of a category's items —
	 * built for the noodle add-ons ("EXTRA") block on tv-info.
	 *
	 * Layer rule: sections fetch via queries and compose atoms; pages are
	 * just config. Reads the category from the database (default: "extras"),
	 * which retires the hardcoded-array drift bug class — the live TV can no
	 * longer disagree with the menu data (e.g. the Pork 79 vs 69 Kč drift).
	 */
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';

	/** Heading shown above the list. */
	export let title: string = 'EXTRA';
	/** Stable category name to read (portable across deployments). */
	export let categoryName: string = 'extras';

	const category = browser
		? useQuery(api.menu.getCategoryWithItems, { name: categoryName })
		: null;

	$: items = ($category?.items ?? []).filter((i) => i.isAvailable);
</script>

{#if items.length > 0}
	<section class="tv-info-section tv-extras">
		<h3 class="tv-extras-title">{title}</h3>
		<div class="tv-extras-grid">
			{#each items as item (item._id)}
				<div class="tv-extras-item">
					<span class="tv-extras-name">
						{item.nameLocal || item.name}
						{#if item.nameLocal && item.nameLocal !== item.name}
							<span class="tv-extras-name-en">/ {item.name}</span>
						{/if}
					</span>
					<span class="tv-extras-price">{item.price} Kč</span>
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.tv-extras {
		flex-shrink: 0;
		padding-top: 12px;
		border-top: 2px solid var(--color-border, #E8E8E4);
	}

	.tv-extras-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-tag-size, 24px);
		font-weight: 700;
		color: var(--color-accent, #E83636);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 8px;
	}

	.tv-extras-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px 32px;
	}

	.tv-extras-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.tv-extras-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		color: var(--color-text, #2C2C2C);
		font-weight: 500;
	}

	.tv-extras-name-en {
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-extras-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-price, #16a34a);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
</style>
