<script lang="ts">
	import { onMount } from 'svelte';
	import MenuItem from './MenuItem.svelte';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import { lang } from '$lib/i18n/store';

	export let category: Doc<'categories'>;
	export let items: Doc<'menuItems'>[];

	$: displayTitle = $lang === 'cs' && category.displayNameLocal
		? category.displayNameLocal
		: category.displayName;

	$: sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
	$: availableItems = sortedItems.filter((item) => item.isAvailable);
	$: unavailableItems = sortedItems.filter((item) => !item.isAvailable);

	let sectionEl: HTMLElement;
	let visible = false;

	onMount(() => {
		if (!sectionEl) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visible = true;
						observer.disconnect();
					}
				});
			},
			{ rootMargin: '20px', threshold: 0.1 }
		);
		observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

{#if category.isActive}
	<section
		bind:this={sectionEl}
		class="category"
		class:animate-in={visible}
		aria-labelledby="category-{category._id}"
	>
		<div class="category-header">
			<h2 id="category-{category._id}" class="category-title">
				{displayTitle}
			</h2>
			{#if category.subtitle}
				<p class="category-subtitle">{category.subtitle}</p>
			{/if}
		</div>
		<ul class="items" role="list">
			{#each availableItems as item (item._id)}
				<li>
					<MenuItem {item} />
				</li>
			{/each}
			{#each unavailableItems as item (item._id)}
				<li>
					<MenuItem {item} />
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.category {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-item-gap, var(--space-3));
	}

	.category-header {
		padding-bottom: var(--space-2);
		border-bottom: 3px solid var(--color-accent, #E83636);
		/* Slide-in animation */
		opacity: 0;
		transform: translateX(-20px);
		transition:
			opacity var(--anim-duration-normal, 400ms) var(--anim-ease-enter, ease),
			transform var(--anim-duration-normal, 400ms) var(--anim-ease-enter, ease);
	}

	.category.animate-in .category-header {
		opacity: 1;
		transform: translateX(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.category-header {
			opacity: 1;
			transform: none;
		}
	}

	.category-title {
		font-family: var(--font-headline, var(--font));
		font-size: var(--text-headline, var(--text-xl));
		font-weight: 600;
		color: var(--color-text, var(--text));
		line-height: 1.25;
		letter-spacing: 0.03em;
	}

	.category-subtitle {
		font-family: var(--font-body, var(--font));
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, var(--text-muted));
		margin-top: 0.25rem;
		letter-spacing: 0.02em;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-item-gap, var(--space-2));
	}

	.items li {
		list-style: none;
	}
</style>
