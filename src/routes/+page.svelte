<script lang="ts">
	import Menu from '$lib/components/Menu.svelte';
	import AnalyticsTracker from '$lib/components/AnalyticsTracker.svelte';
	import CurrencyLens from '$lib/components/CurrencyLens.svelte';
</script>

<svelte:head>
	<title>FULALA.CZ MENU 26'</title>
	<meta name="description" content="Live restaurant menu" />
</svelte:head>

<AnalyticsTracker displayType="mobile" />

<main class="page">
	<header class="header">
		<h1 class="title">FULALA.CZ</h1>
		<p class="subtitle">Fresh Noodles & Dumplings & Snacks</p>
		<div class="currency-selector">
			<CurrencyLens />
		</div>
	</header>
	<Menu />
</main>

<style>
	.page {
		max-width: 600px;
		margin: 0 auto;
		padding: var(--space-4);
		min-height: 100vh;
	}

	.header {
		text-align: center;
		margin-bottom: var(--space-5);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--border);
	}

	.title {
		font-size: var(--text-3xl);
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: var(--space-1);
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.currency-selector {
		margin-top: var(--space-3);
		display: flex;
		justify-content: center;
	}
</style>
