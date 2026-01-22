<script lang="ts">
	import LayoutRenderer from '$lib/components/layouts/LayoutRenderer.svelte';
	import AnalyticsTracker from '$lib/components/AnalyticsTracker.svelte';
	import CurrencyLens from '$lib/components/CurrencyLens.svelte';
	import { onMount } from 'svelte';

	// Current time for display
	let currentTime = '';

	onMount(() => {
		const updateTime = () => {
			const now = new Date();
			currentTime = now.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>FULALA.CZ MENU 26' - TV Display</title>
	<meta name="description" content="Fulala live menu display" />
</svelte:head>

<AnalyticsTracker displayType="tv" />

<main class="tv-page" data-mode="tv">
	<header class="tv-header">
		<div class="logo">
			<h1 class="title">FULALA.CZ</h1>
			<p class="tagline">Fresh Noodles & Dumplings & Snacks</p>
		</div>
		<div class="header-right">
			<div class="currency-lens-wrapper">
				<CurrencyLens />
			</div>
			<time class="clock" datetime={currentTime}>{currentTime}</time>
		</div>
	</header>

	<div class="tv-menu" role="region" aria-label="Menu">
		<LayoutRenderer pageType="display" />
	</div>

	<footer class="tv-footer">
		<p>Menu prices subject to change. Ask about daily specials!</p>
	</footer>
</main>

<style>
	.tv-page {
		min-height: 100vh;
		padding: var(--space-5);
		display: flex;
		flex-direction: column;
		background: var(--bg);
		font-size: 24px; /* Base size for TV */
	}

	.tv-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-4);
		border-bottom: 3px solid var(--text);
		margin-bottom: var(--space-5);
	}

	.logo {
		display: flex;
		flex-direction: column;
	}

	.title {
		font-size: 3rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.tagline {
		font-size: 1rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		margin-top: var(--space-1);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.currency-lens-wrapper {
		transform: scale(1.25);
		transform-origin: right center;
	}

	.clock {
		font-size: 2rem;
		font-weight: 500;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.tv-menu {
		flex: 1;
		overflow: hidden;
	}

	.tv-footer {
		padding-top: var(--space-4);
		border-top: 1px solid var(--border);
		margin-top: var(--space-5);
		text-align: center;
	}

	.tv-footer p {
		font-size: 1rem;
		color: var(--text-muted);
	}

	/* Vertical TV adjustments (1080x1920) */
	@media (max-width: 1200px) and (min-height: 1600px) {
		.tv-page {
			font-size: 28px;
		}

		.title {
			font-size: 4rem;
		}
	}
</style>
