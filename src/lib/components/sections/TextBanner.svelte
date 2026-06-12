<script lang="ts">
	/**
	 * Section: bilingual text banner — announcements, hours notes, seasonal
	 * messages. The simplest section type; also the registry's "hello world".
	 *
	 * Layer rule: sections fetch via queries and compose atoms; this one
	 * needs no data at all — everything comes from its props.
	 */
	export let text: string;
	export let textLocal: string = '';
	/** 'accent' draws the brand-red frame; 'plain' is quiet. */
	export let style: 'accent' | 'plain' = 'accent';
</script>

<section class="tv-info-section tv-text-banner" class:tv-banner-accent={style === 'accent'}>
	<p class="tv-banner-text">
		{textLocal || text}
		{#if textLocal && textLocal !== text}
			<span class="tv-banner-text-en">/ {text}</span>
		{/if}
	</p>
</section>

<style>
	.tv-text-banner {
		padding: 20px 24px;
		border-radius: 12px;
		text-align: center;
	}

	.tv-banner-accent {
		border: 2px solid color-mix(in srgb, var(--color-accent, #E83636) 40%, transparent);
		background: color-mix(in srgb, var(--color-accent, #E83636) 6%, transparent);
	}

	.tv-banner-text {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-info-body-size, 36px);
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
		line-height: 1.3;
	}

	.tv-banner-text-en {
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}
</style>
