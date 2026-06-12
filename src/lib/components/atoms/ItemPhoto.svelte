<script lang="ts">
	/**
	 * Atom: item photo with branded placeholder fallback.
	 *
	 * Layer rule: atoms never fetch data; props in, markup out. The square
	 * frame and radius come from the same CSS variables TvMenuItem used, so
	 * grids keep their rhythm whether or not an item has photography yet —
	 * a missing photo becomes a quiet branded tile instead of a broken hole.
	 */
	export let src: string | undefined = undefined;
	export let alt: string;
	/** Photos on TVs preload eagerly; admin previews may pass 'lazy'. */
	export let loading: 'eager' | 'lazy' = 'eager';
</script>

<div class="tv-item-image" class:tv-photo-placeholder={!src}>
	{#if src}
		<img {src} {alt} {loading} decoding="async" />
	{:else}
		<span class="tv-photo-placeholder-mark" aria-hidden="true">🐯</span>
	{/if}
</div>

<style>
	.tv-item-image {
		width: var(--tv-image-size, 120px);
		height: var(--tv-image-size, 120px);
		min-width: var(--tv-image-size, 120px);
		min-height: var(--tv-image-size, 120px);
		border-radius: var(--tv-image-radius, 12px);
		overflow: hidden;
		flex-shrink: 0;
	}

	.tv-item-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.tv-photo-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in srgb, var(--color-accent, #E83636) 8%, #f5f5f5);
		border: 1px dashed color-mix(in srgb, var(--color-accent, #E83636) 30%, transparent);
	}

	.tv-photo-placeholder-mark {
		font-size: calc(var(--tv-image-size, 120px) * 0.4);
		opacity: 0.55;
	}
</style>
