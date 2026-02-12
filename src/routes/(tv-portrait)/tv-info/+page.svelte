<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';

	const customerInfo = browser ? useQuery(api.settings.getCustomerInfo, {}) : null;

	interface InfoSection {
		title: string;
		titleLocal?: string;
		description: string;
		descriptionLocal?: string;
	}

	const drinks = [
		{ nameCS: 'Wang Lao Ji', nameCN: '王老吉', nameEN: 'Herbal Tea', image: '/images/drinks/wanglaoji.webp' },
		{ nameCS: 'Domácí limonáda', nameEN: 'Lemonade', image: '/images/drinks/lemonade.webp' },
		{ nameCS: 'Tsingtao', nameCN: '青岛啤酒', nameEN: 'Beer', image: '/images/drinks/tsingtao.webp' },
		{ nameCS: 'Káva', nameEN: 'Coffee', image: '/images/drinks/coffee.webp' },
		{ nameCS: 'Kofola', nameEN: 'Soft Drink', image: '/images/drinks/kofola.webp' },
	];
</script>

<svelte:head>
	<title>FULALA.CZ | Info & Nápoje / Drinks</title>
</svelte:head>

<div class="tv-info-page">
	<!-- Customer info / discounts -->
	{#if $customerInfo?.sections?.length}
		<section class="tv-info-section tv-customer">
			<div class="tv-info-cards">
				{#each $customerInfo.sections as section}
					<div class="tv-info-card">
						<div class="tv-info-card-content">
							<div class="tv-info-card-title">
								{section.titleLocal || section.title}
								{#if section.titleLocal}
									<span class="tv-info-card-title-en">/ {section.title}</span>
								{/if}
							</div>
							<div class="tv-info-card-desc">
								{section.descriptionLocal || section.description}
								{#if section.descriptionLocal && section.description}
									<span class="tv-info-card-desc-en">/ {section.description}</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Drinks section -->
	<section class="tv-info-section tv-drinks">
		<h2 class="tv-section-title">Nápoje / Drinks</h2>
		<div class="tv-drinks-grid">
			{#each drinks as drink}
				<div class="tv-drink-card">
					<div class="tv-drink-image">
						<img src={drink.image} alt={drink.nameCS} loading="eager" />
					</div>
					<div class="tv-drink-name">
						{drink.nameCS}
						{#if drink.nameCN}
							<span class="tv-drink-cn">{drink.nameCN}</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.tv-info-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--tv-section-gap, 36px);
		min-height: 0;
		justify-content: space-evenly;
	}

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

	/* Customer info cards — all equally styled */
	.tv-info-cards {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tv-info-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px 24px;
		border: 2px solid var(--color-border, #E8E8E4);
		border-radius: 12px;
	}

	.tv-info-card-content {
		flex: 1;
		min-width: 0;
	}

	.tv-info-card-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-info-body-size, 36px);
		font-weight: 700;
		color: var(--color-text, #2C2C2C);
		margin-bottom: 4px;
	}

	.tv-info-card-title-en {
		font-weight: 500;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-info-card-desc {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.3;
	}

	.tv-info-card-desc-en {
		color: var(--color-text-muted, #6B6B6B);
		opacity: 0.7;
	}

	/* Drinks section */
	.tv-drinks-grid {
		display: flex;
		gap: 24px;
		justify-content: space-evenly;
	}

	.tv-drink-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		flex: 1;
		max-width: 180px;
	}

	.tv-drink-image {
		width: 120px;
		height: 120px;
		border-radius: var(--tv-image-radius, 12px);
		overflow: hidden;
		background: #f5f5f5;
	}

	.tv-drink-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.tv-drink-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
		text-align: center;
		line-height: 1.2;
	}

	.tv-drink-cn {
		display: block;
		font-size: var(--tv-quantity-size, 26px);
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}
</style>
