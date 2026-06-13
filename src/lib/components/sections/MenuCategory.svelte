<script lang="ts">
	/**
	 * Section: a full menu category — the look the dumplings and noodles
	 * screens shipped hardcoded, now a composable block. Photo, bilingual +
	 * Chinese name, price, allergen badges (via TvCategory → TvMenuItem).
	 *
	 * Layer rule: sections fetch via queries and compose atoms; pages are
	 * just config. Reads the category by stable name (portable across
	 * deployments). The show* flags arrive as page-level overrides spread by
	 * SectionRenderer, so the per-page kill switches still win.
	 */
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import TvCategory from '$lib/components/tv/TvCategory.svelte';

	/** Stable category name to read (portable across deployments). */
	export let categoryName: string;
	/** Page-level display overrides (default: show everything). */
	export let showImages: boolean = true;
	export let showChinese: boolean = true;
	export let showAllergens: boolean = true;

	const category = browser
		? useQuery(api.menu.getCategoryWithItems, { name: categoryName })
		: null;
</script>

{#if $category}
	<TvCategory
		category={$category}
		items={$category.items}
		{showImages}
		{showChinese}
		{showAllergens}
	/>
{/if}
