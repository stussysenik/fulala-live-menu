<script lang="ts">
	import TvMenuItem from './TvMenuItem.svelte';
	import type { Doc } from '../../../../convex/_generated/dataModel';

	export let category: Doc<'categories'>;
	export let items: Doc<'menuItems'>[];

	// Show both languages for category title
	$: titleCS = category.displayNameLocal || category.displayName;
	$: titleEN = category.displayNameLocal ? category.displayName : '';

	$: sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
	$: availableItems = sortedItems.filter((item) => item.isAvailable);
</script>

{#if category.isActive}
	<section class="tv-category">
		<div class="tv-items">
			{#each availableItems as item (item._id)}
				<TvMenuItem {item} />
			{/each}
		</div>
	</section>
{/if}

<style>
	.tv-category {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		padding-top: var(--tv-content-pad-top, 12px);
	}

	.tv-items {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		justify-content: space-evenly;
	}
</style>
