<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../convex/_generated/api';
	import AnalyticsTracker from '$lib/components/AnalyticsTracker.svelte';
	import CurrencyLens from '$lib/components/CurrencyLens.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import MenuScheduleBanner from '$lib/components/MenuScheduleBanner.svelte';
	import CustomerInfo from '$lib/components/CustomerInfo.svelte';
	import AllergenLegend from '$lib/components/AllergenLegend.svelte';
	import Category from '$lib/components/Category.svelte';
	import { t, lang, locale } from '$lib/i18n/store';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];

	const scheduleQuery = browser ? useQuery(api.settings.getMenuSchedule, {}) : null;
	$: schedule = $scheduleQuery;

	// Dynamic tab title with schedule dates
	function formatTabTitle(sched: any, currentLang: string): string {
		if (!sched) return 'FULALA.CZ | Menu';
		const weekLabel = currentLang === 'cs' ? 'Týden' : 'Week';
		const s = new Date(sched.startDate);
		const e = new Date(sched.endDate);
		const dateStr = currentLang === 'cs'
			? `${s.getDate()}.–${e.getDate()}. ${s.toLocaleString('cs-CZ', { month: 'long' })} ${sched.year}`
			: `${s.toLocaleString('en-US', { month: 'short' })} ${s.getDate()}–${e.getDate()}, ${sched.year}`;
		return `FULALA.CZ | Menu · ${weekLabel} #${sched.weekNumber} · ${dateStr}`;
	}

	$: tabTitle = formatTabTitle($scheduleQuery, $lang);
</script>

<svelte:head>
	<title>{tabTitle}</title>
	<meta name="description" content="Fresh noodles & dumplings - Fulala restaurant menu" />
</svelte:head>

<AnalyticsTracker displayType="mobile" />

<main class="page">
	<header class="header">
		<h1 class="title">FULALA.CZ</h1>
		<p class="subtitle">Fresh Noodles & Dumplings & Snacks</p>
		<MenuScheduleBanner />
		<div class="header-controls">
			<LanguageToggle />
			<CurrencyLens />
		</div>
	</header>

	<div class="top-info">
		<CustomerInfo />
		<AllergenLegend />
	</div>

	{#if menu.length === 0}
		<div class="skeleton-menu">
			{#each [1, 2] as _cat}
				<div class="skeleton-category">
					<div class="skeleton-header"></div>
					{#each [1, 2, 3] as _item}
						<div class="skeleton-item">
							<div class="skeleton-name"></div>
							<div class="skeleton-price"></div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<div class="menu-flow">
			{#each menu as category (category._id)}
				<div class="menu-section">
					<Category {category} items={category.items} />
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	.page {
		margin: 0 auto;
		padding: var(--space-4);
		min-height: 100vh;
		background: var(--color-bg, var(--bg, #FFFFFF));
	}

	.header {
		text-align: center;
		margin-bottom: var(--space-5);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border, var(--border));
	}

	.title {
		font-family: var(--font-headline, serif);
		font-size: var(--text-3xl);
		font-weight: 700;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-1);
		color: var(--color-text, var(--text));
	}

	.subtitle {
		font-family: var(--font-body, sans-serif);
		font-size: var(--text-sm);
		color: var(--color-text-muted, var(--text-muted));
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.header-controls {
		margin-top: var(--space-3);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
	}

	/* Skeleton loading states */
	.skeleton-menu {
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
	}

	.skeleton-category {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.skeleton-header {
		height: 1.75rem;
		width: 60%;
		background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e4 50%, #f0f0ee 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 4px;
		border-bottom: 3px solid var(--color-accent, #E83636);
		padding-bottom: 0.5rem;
	}

	.skeleton-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		gap: 1rem;
	}

	.skeleton-name {
		height: 1rem;
		width: 55%;
		background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e4 50%, #f0f0ee 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 4px;
	}

	.skeleton-price {
		height: 1rem;
		width: 60px;
		background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e4 50%, #f0f0ee 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 4px;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	/* Mobile: single column, max-width for readability */
	.menu-flow {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-category-gap, 2.5rem);
		max-width: 600px;
		margin: 0 auto;
	}

	.menu-section {
		break-inside: avoid;
	}

	/* Tablet: still single column but wider */
	@media (min-width: 768px) {
		.menu-flow {
			max-width: 700px;
		}
	}

	/* Desktop / large: 2 columns */
	@media (min-width: 1100px) {
		.page {
			padding: 2rem 3rem;
		}

		.menu-flow {
			max-width: 100%;
			columns: 2;
			column-gap: 3rem;
		}

		.menu-section {
			break-inside: avoid;
			margin-bottom: 2.5rem;
		}

		.title {
			font-size: 2.5rem;
		}
	}

	/* 3-column TV layout
	   Targeted at 3x LG 43UR78003LK (1920×1080 CSS each, DPR 2, portrait via CSS rotation)
	   Total CSS viewport: 3240 × 1080
	   Each column: ~1080px width at 9:16 per screen */
	@media (min-width: 1600px) {
		.page {
			padding: 2.5rem 4rem;
		}

		.menu-flow {
			columns: 3;
			column-gap: 4rem;
		}

		.menu-section {
			margin-bottom: 3rem;
		}

		.header {
			margin-bottom: 2.5rem;
		}

		.title {
			font-size: 3rem;
		}

		.subtitle {
			font-size: 1rem;
		}
	}

	/* Ultra-wide: 3x portrait TV setup (3240px CSS) — dead on real hardware, DPR 2 */
	@media (min-width: 4000px) {
		.page {
			padding: 4rem 6rem;
			font-size: 1.75rem;
		}

		.menu-flow {
			column-gap: 6rem;
		}

		.menu-section {
			margin-bottom: 4rem;
		}

		.title {
			font-size: 5rem;
			letter-spacing: 0.08em;
		}

		.subtitle {
			font-size: 1.75rem;
			letter-spacing: 0.15em;
		}
	}

	.top-info {
		max-width: 600px;
		margin: 0 auto var(--spacing-category-gap, 2.5rem);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.top-info {
			max-width: 700px;
		}
	}

	@media (min-width: 1100px) {
		.top-info {
			max-width: 100%;
		}
	}
</style>
