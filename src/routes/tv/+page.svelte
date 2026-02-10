<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../convex/_generated/api';
	import AnalyticsTracker from '$lib/components/AnalyticsTracker.svelte';
	import CurrencyLens from '$lib/components/CurrencyLens.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import MenuScheduleBanner from '$lib/components/MenuScheduleBanner.svelte';
	import CustomerInfo from '$lib/components/CustomerInfo.svelte';
	import AllergenLegend from '$lib/components/AllergenLegend.svelte';
	import Category from '$lib/components/Category.svelte';
	import { onMount } from 'svelte';
	import { t, lang, locale } from '$lib/i18n/store';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];

	const scheduleQuery = browser ? useQuery(api.settings.getMenuSchedule, {}) : null;

	// Dynamic tab title
	function formatTabTitle(sched: any, currentLang: string): string {
		if (!sched) return 'FULALA.CZ | TV';
		const weekLabel = currentLang === 'cs' ? 'Týden' : 'Week';
		const s = new Date(sched.startDate);
		const e = new Date(sched.endDate);
		const dateStr = currentLang === 'cs'
			? `${s.getDate()}.–${e.getDate()}. ${s.toLocaleString('cs-CZ', { month: 'long' })} ${sched.year}`
			: `${s.toLocaleString('en-US', { month: 'short' })} ${s.getDate()}–${e.getDate()}, ${sched.year}`;
		return `FULALA.CZ | TV · ${weekLabel} #${sched.weekNumber} · ${dateStr}`;
	}

	$: tabTitle = formatTabTitle($scheduleQuery, $lang);

	// Current time for display
	let currentTime = '';

	onMount(() => {
		const updateTime = () => {
			const now = new Date();
			currentTime = now.toLocaleTimeString($lang === 'cs' ? 'cs-CZ' : 'en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: $lang !== 'cs'
			});
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>{tabTitle}</title>
	<meta name="description" content="Fulala live menu display" />
</svelte:head>

<AnalyticsTracker displayType="tv" />

<main class="tv-page">
	<header class="tv-header">
		<div class="logo">
			<h1 class="title">FULALA.CZ</h1>
			<p class="tagline">Fresh Noodles & Dumplings & Snacks</p>
			<MenuScheduleBanner />
		</div>
		<div class="header-right">
			<LanguageToggle />
			<div class="currency-lens-wrapper">
				<CurrencyLens />
			</div>
			<time class="clock" datetime={currentTime}>{currentTime}</time>
		</div>
	</header>

	<div class="tv-top-info">
		<CustomerInfo />
		<AllergenLegend />
	</div>

	{#if menu.length === 0}
		<div class="loading">{$t.loading}</div>
	{:else}
		<div class="tv-menu-flow">
			{#each menu as category (category._id)}
				<div class="tv-section">
					<Category {category} items={category.items} />
				</div>
			{/each}
		</div>
	{/if}

	<footer class="tv-footer">
		<p>{$t.pricesNote}</p>
	</footer>
</main>

<style>
	.tv-page {
		min-height: 100vh;
		padding: 2rem 3rem;
		display: flex;
		flex-direction: column;
		background: var(--color-bg, var(--bg, #FFFFFF));
		font-size: 20px;
	}

	.tv-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-4);
		border-bottom: 3px solid var(--color-accent, var(--accent));
		margin-bottom: 2rem;
	}

	.logo {
		display: flex;
		flex-direction: column;
	}

	.title {
		font-family: var(--font-headline, serif);
		font-size: 3rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		line-height: 1;
		color: var(--color-text, var(--text));
	}

	.tagline {
		font-family: var(--font-body, sans-serif);
		font-size: 1rem;
		color: var(--color-text-muted, var(--text-muted));
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
		font-family: var(--font-price, monospace);
		font-size: 2rem;
		font-weight: 500;
		color: var(--color-text-muted, var(--text-muted));
		font-variant-numeric: tabular-nums;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		color: var(--color-text-muted, var(--text-muted));
	}

	/* 3-column flow layout for TV display */
	.tv-menu-flow {
		flex: 1;
		columns: 3;
		column-gap: 3rem;
	}

	.tv-section {
		break-inside: avoid;
		margin-bottom: 2.5rem;
	}

	.tv-top-info {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border, #E8E8E4);
	}

	.tv-footer {
		padding-top: var(--space-4);
		border-top: 1px solid var(--color-border, var(--border));
		margin-top: 2rem;
		text-align: center;
	}

	.tv-footer p {
		font-family: var(--font-body, sans-serif);
		font-size: 0.875rem;
		color: var(--color-text-muted, var(--text-muted));
	}

	/* Single-screen TV (landscape) */
	@media (max-width: 1200px) {
		.tv-menu-flow {
			columns: 2;
		}
	}

	@media (max-width: 768px) {
		.tv-menu-flow {
			columns: 1;
		}
	}

	/* 3x portrait 4K TVs (6480px total width) */
	@media (min-width: 4000px) {
		.tv-page {
			padding: 4rem 6rem;
			font-size: 2rem;
		}

		.title {
			font-size: 5rem;
		}

		.tagline {
			font-size: 1.5rem;
		}

		.clock {
			font-size: 3rem;
		}

		.tv-menu-flow {
			column-gap: 6rem;
		}

		.tv-section {
			margin-bottom: 4rem;
		}
	}
</style>
