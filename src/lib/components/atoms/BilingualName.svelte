<script lang="ts">
	/**
	 * Atom: bilingual item name — Czech primary, Chinese, English secondary.
	 *
	 * Layer rule (atoms → sections → pages): an atom never fetches data;
	 * props in, markup out. Extracted verbatim from TvMenuItem so existing TV
	 * pages and new composed sections render names identically.
	 */
	export let name: string;
	export let nameLocal: string | undefined = undefined;
	export let nameChinese: string | undefined = undefined;
	export let showChinese: boolean = true;

	// Czech-first display: nameLocal is primary when present; the English
	// name drops to the secondary line unless it would duplicate the primary.
	$: primaryName = nameLocal || name;
	$: secondaryName = nameLocal && nameLocal !== name ? name : '';
</script>

<h3 class="tv-item-name">{primaryName}</h3>
{#if showChinese && nameChinese}
	<span class="tv-item-chinese">{nameChinese}</span>
{/if}
{#if secondaryName}
	<p class="tv-item-secondary">{secondaryName}</p>
{/if}

<style>
	.tv-item-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-size, 40px);
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
		line-height: 1.25;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.tv-item-chinese {
		font-size: var(--tv-chinese-size, 32px);
		color: var(--color-text-muted, #6B6B6B);
		font-weight: 400;
		line-height: 1.2;
	}

	.tv-item-secondary {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.2;
	}
</style>
