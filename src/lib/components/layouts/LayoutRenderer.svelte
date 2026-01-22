<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import type { Doc } from '../../../../convex/_generated/dataModel';
	import DimSumGrid from './DimSumGrid.svelte';
	import CardGrid from './CardGrid.svelte';
	import Menu from '../Menu.svelte';
	import { createEventDispatcher } from 'svelte';

	// Allow override of layout via prop (useful for order page)
	export let layoutOverride: 'standard-list' | 'dim-sum-grid' | 'card-grid' | null = null;

	const dispatch = createEventDispatcher<{
		select: { item: Doc<'menuItems'>; quantity?: number };
	}>();

	// Fetch active layout from database
	const layoutQuery = browser ? useQuery(api.layouts.getActiveLayout) : null;
	$: layoutData = $layoutQuery;

	// Fetch full menu data
	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: categories = $menuQuery ?? [];

	// Determine which layout to use
	$: layoutType = layoutOverride ?? layoutData?.layoutType ?? 'standard-list';
	$: layoutConfig = layoutData?.config ?? {
		columnsPerRow: 1,
		showCheckboxes: false,
		showItemNumbers: false,
		showImages: true,
		categoryStyle: 'header',
	};

	function handleItemSelect(event: CustomEvent<{ item: Doc<'menuItems'>; quantity?: number }>) {
		dispatch('select', event.detail);
	}
</script>

<div class="layout-renderer">
	{#if layoutType === 'dim-sum-grid'}
		<DimSumGrid {categories} config={layoutConfig} on:select={handleItemSelect} />
	{:else if layoutType === 'card-grid'}
		<CardGrid {categories} config={layoutConfig} on:select={handleItemSelect} />
	{:else}
		<!-- Standard list layout - use existing Menu component -->
		<Menu />
	{/if}
</div>

<style>
	.layout-renderer {
		width: 100%;
	}
</style>
