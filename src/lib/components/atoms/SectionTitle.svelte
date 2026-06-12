<script lang="ts">
	/**
	 * Atom: display-page section heading with the accent underline.
	 *
	 * Layer rule: atoms never fetch data; props in, markup out. Extracted
	 * verbatim from the tv-info "Nápoje / Drinks" heading so composed pages
	 * keep the exact typography of the hand-built ones.
	 */
	export let title: string;
</script>

<h2 class="tv-section-title">{title}</h2>

<style>
	.tv-section-title {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: var(--tv-info-title-size, 44px);
		font-weight: 700;
		color: var(--color-text, #2C2C2C);
		line-height: 1.2;
		padding-bottom: 12px;
		border-bottom: 4px solid var(--color-accent, #E83636);
		margin-bottom: 16px;
	}
</style>
