<script lang="ts">
	import { browser } from '$app/environment';
	import Category from './Category.svelte';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../convex/_generated/api';
	import type { Doc, Id } from '../../../convex/_generated/dataModel';
	import { isReadyForDisplay } from '$lib/domain/menuItem';

	type CategoryDoc = Doc<'categories'>;
	type MenuItemDoc = Doc<'menuItems'>;

	// Only subscribe to data on the client
	const categoriesQuery = browser ? useQuery(api.menu.getCategories) : null;
	const menuItemsQuery = browser ? useQuery(api.menu.getMenuItems) : null;

	$: categories = ($categoriesQuery ?? []) as CategoryDoc[];
	// Hard rail: a customer never sees (or orders) a half-built draft. Admin
	// surfaces read the same data unfiltered; only this customer view gates.
	$: menuItems = (($menuItemsQuery ?? []) as MenuItemDoc[]).filter(isReadyForDisplay);

	$: categoriesWithItems = categories.map((category: CategoryDoc) => ({
		...category,
		items: menuItems.filter((item: MenuItemDoc) => item.categoryId === category._id)
	}));
</script>

<div class="menu" role="region" aria-label="Menu">
	{#if categories.length === 0}
		<div class="loading" aria-live="polite">
			<p>Loading menu...</p>
		</div>
	{:else}
		{#each categoriesWithItems as category (category._id)}
			<Category {category} items={category.items} />
		{/each}
	{/if}
</div>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.loading {
		text-align: center;
		padding: var(--space-6);
		color: var(--text-muted);
	}
</style>
