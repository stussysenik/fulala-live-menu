<script lang="ts">
	import { browser } from '$app/environment';
	import Category from '$lib/components/Category.svelte';
	import AnalyticsTracker from '$lib/components/AnalyticsTracker.svelte';
	import CurrencyLens from '$lib/components/CurrencyLens.svelte';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../convex/_generated/api';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import { onMount } from 'svelte';

	type CategoryDoc = Doc<'categories'>;
	type MenuItemDoc = Doc<'menuItems'>;

	// Only subscribe to data on the client
	const categoriesQuery = browser ? useQuery(api.menu.getCategories) : null;
	const menuItemsQuery = browser ? useQuery(api.menu.getMenuItems) : null;

	$: categories = ($categoriesQuery ?? []) as CategoryDoc[];
	$: menuItems = ($menuItemsQuery ?? []) as MenuItemDoc[];

	$: categoriesWithItems = categories.map((category: CategoryDoc) => ({
		...category,
		items: menuItems.filter((item: MenuItemDoc) => item.categoryId === category._id)
	}));

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
		{#if categories.length === 0}
			<div class="loading" aria-live="polite">
				<p>Loading menu...</p>
			</div>
		{:else}
			<div class="menu-columns">
				{#each categoriesWithItems as category (category._id)}
					<div class="column-item">
						<Category {category} items={category.items} />
					</div>
				{/each}
			</div>
		{/if}
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

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		font-size: 1.5rem;
		color: var(--text-muted);
	}

	.menu-columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: var(--space-5);
		align-items: start;
	}

	.column-item {
		break-inside: avoid;
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
		.menu-columns {
			grid-template-columns: 1fr;
		}

		.tv-page {
			font-size: 28px;
		}

		.title {
			font-size: 4rem;
		}
	}

	/* Landscape TV adjustments */
	@media (min-width: 1600px) {
		.menu-columns {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
