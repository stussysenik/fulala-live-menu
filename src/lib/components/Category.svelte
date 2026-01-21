<script lang="ts">
	import MenuItem from './MenuItem.svelte';
	import type { Doc } from '../../../convex/_generated/dataModel';

	export let category: Doc<'categories'>;
	export let items: Doc<'menuItems'>[];

	$: sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
	$: availableItems = sortedItems.filter((item) => item.isAvailable);
	$: unavailableItems = sortedItems.filter((item) => !item.isAvailable);
</script>

{#if category.isActive}
	<section class="category" aria-labelledby="category-{category._id}">
		<h2 id="category-{category._id}" class="category-title">
			{category.displayName}
		</h2>
		<ul class="items" role="list">
			{#each availableItems as item (item._id)}
				<li>
					<MenuItem {item} />
				</li>
			{/each}
			{#each unavailableItems as item (item._id)}
				<li>
					<MenuItem {item} />
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.category {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-item-gap, var(--space-3));
	}

	.category-title {
		font-family: var(--font-headline, var(--font));
		font-size: var(--text-headline, var(--text-xl));
		font-weight: 600;
		color: var(--color-text, var(--text));
		padding-bottom: var(--space-2);
		border-bottom: 2px solid var(--color-accent, var(--text));
		line-height: 1.25;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-item-gap, var(--space-2));
	}

	.items li {
		list-style: none;
	}
</style>
