<script lang="ts">
	// Bilingual footer — show both Czech and English prices note
</script>

<footer class="tv-footer">
	<p class="tv-footer-note">
		Ceny v Kč. Všechny ceny jsou včetně DPH.
		<span class="tv-footer-sep">|</span>
		Prices in CZK. All prices include VAT.
	</p>
</footer>

<style>
	.tv-footer {
		flex-shrink: 0;
		padding-top: 16px;
		border-top: 2px solid var(--color-border, #E8E8E4);
		margin-top: auto;
		text-align: center;
	}

	.tv-footer-note {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-footer-size, 24px);
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.4;
	}

	.tv-footer-sep {
		opacity: 0.3;
		margin: 0 8px;
	}
</style>
