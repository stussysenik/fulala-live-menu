<script lang="ts">
	/**
	 * Live menu-card preview — the right pane of every events form.
	 *
	 * Renders the package being composed the way a guest would read it:
	 * branded card, serif headline, dishes grouped by category with price
	 * leaders, summed value. Inputs on the left are the controls; this is
	 * the evidence.
	 */
	export let title: string = '';
	export let subtitle: string = '';
	export let priceLine: string = '';
	export let pickedItemIds: string[] = [];
	export let menuCategories: Array<{
		_id: string;
		displayName: string;
		displayNameLocal?: string;
		items: Array<{ _id: string; name: string; nameLocal?: string; price: number }>;
	}> = [];

	$: picked = new Set(pickedItemIds);
	$: groups = menuCategories
		.map((c) => ({
			label: c.displayNameLocal || c.displayName,
			items: c.items.filter((i) => picked.has(i._id)),
		}))
		.filter((g) => g.items.length > 0);
	$: totalValue = groups.flatMap((g) => g.items).reduce((sum, i) => sum + i.price, 0);
</script>

<aside class="menu-card" aria-label="Live menu preview">
	<div class="menu-card-brand">FULALA <span class="menu-card-tiger">🐯</span></div>
	<h3 class="menu-card-title">{title || 'Untitled menu'}</h3>
	{#if subtitle}
		<p class="menu-card-subtitle">{subtitle}</p>
	{/if}
	{#if priceLine}
		<p class="menu-card-price-line">{priceLine}</p>
	{/if}

	{#if groups.length === 0}
		<p class="menu-card-empty">Pick dishes on the left — they appear here as the menu.</p>
	{:else}
		{#each groups as group (group.label)}
			<div class="menu-card-group">
				<h4>{group.label}</h4>
				{#each group.items as item (item._id)}
					<div class="menu-card-dish">
						<span class="dish-name">{item.nameLocal || item.name}</span>
						<span class="dish-leader"></span>
						<span class="dish-price">{item.price} Kč</span>
					</div>
				{/each}
			</div>
		{/each}
		<div class="menu-card-total">
			<span>À la carte value</span>
			<span>{totalValue} Kč</span>
		</div>
	{/if}
</aside>

<style>
	.menu-card {
		background: #fffdf8;
		border: 1px solid #e8e8e4;
		border-top: 5px solid var(--color-accent, #e83636);
		border-radius: 12px;
		padding: 1.5rem 1.5rem 1.25rem;
		position: sticky;
		top: 1rem;
		font-family: var(--font-body, 'Inter', sans-serif);
	}

	.menu-card-brand {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-weight: 700;
		font-size: 0.9rem;
		letter-spacing: 0.18em;
		color: var(--color-accent, #e83636);
		text-align: center;
		margin-bottom: 0.875rem;
	}

	.menu-card-tiger {
		letter-spacing: 0;
	}

	.menu-card-title {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: 1.45rem;
		font-weight: 700;
		color: #2c2c2c;
		text-align: center;
		line-height: 1.2;
	}

	.menu-card-subtitle,
	.menu-card-price-line {
		text-align: center;
		font-size: 0.8125rem;
		color: #6b6b6b;
		margin-top: 0.25rem;
	}

	.menu-card-price-line {
		font-weight: 600;
		color: #2c2c2c;
	}

	.menu-card-empty {
		margin-top: 1.25rem;
		text-align: center;
		font-size: 0.8125rem;
		color: #b3b3ae;
		font-style: italic;
	}

	.menu-card-group {
		margin-top: 1.125rem;
	}

	.menu-card-group h4 {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent, #e83636);
		margin-bottom: 0.375rem;
	}

	.menu-card-dish {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 0.8125rem;
		color: #2c2c2c;
		padding: 2px 0;
	}

	.dish-leader {
		flex: 1;
		border-bottom: 1px dotted #d4d4d0;
		transform: translateY(-3px);
	}

	.dish-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		white-space: nowrap;
		color: #6b6b6b;
	}

	.menu-card-total {
		display: flex;
		justify-content: space-between;
		margin-top: 1.25rem;
		padding-top: 0.75rem;
		border-top: 1px solid #e8e8e4;
		font-size: 0.8125rem;
		font-weight: 650;
		color: #2c2c2c;
	}
</style>
