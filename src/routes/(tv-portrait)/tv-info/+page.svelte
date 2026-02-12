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

	const extras = [
		{ nameCS: '+ Vařené vejce', nameEN: 'Boiled Egg', price: 29 },
		{ nameCS: '+ Na měkko', nameEN: 'Over-Easy Egg', price: 29 },
		{ nameCS: '+ Nudle', nameEN: 'Extra Noodles', price: 49 },
		{ nameCS: '+ Kuřecí', nameEN: 'Chicken', price: 79 },
		{ nameCS: '+ Vepřové', nameEN: 'Pork', price: 79 },
		{ nameCS: '+ Hovězí', nameEN: 'Beef', price: 99 },
	];

	const drinks = [
		{ nameCS: 'Wang Lao Ji', nameCN: '王老吉', nameEN: 'Herbal Tea', image: '/images/drinks/wanglaoji.webp', price: 85 },
		{ nameCS: 'Domácí limonáda', nameEN: 'Lemonade', image: '/images/drinks/lemonade.webp', price: 89 },
		{ nameCS: 'Tsingtao', nameCN: '青岛啤酒', nameEN: 'Beer', image: '/images/drinks/tsingtao.webp', price: 79 },
		{ nameCS: 'Káva', nameEN: 'Coffee', image: '/images/drinks/coffee.webp', price: 65 },
		{ nameCS: 'Kofola', nameEN: 'Soft Drink', image: '/images/drinks/kofola.webp', price: 65 },
	];

	function getCardType(section: InfoSection): string {
		const text = `${section.title} ${section.titleLocal ?? ''}`.toLowerCase();
		if (text.includes('kid') || text.includes('děti') || text.includes('family') || text.includes('rodina')) return 'kids';
		if (text.includes('student') || text.includes('isic')) return 'students';
		if (text.includes('senior') || text.includes('senioř')) return 'seniors';
		return 'default';
	}
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
					<div
						class="tv-info-card"
						class:tv-card-kids={getCardType(section) === 'kids'}
						class:tv-card-students={getCardType(section) === 'students'}
						class:tv-card-seniors={getCardType(section) === 'seniors'}
					>
						<div class="tv-card-icon">
							{#if getCardType(section) === 'students'}
								<img src="/images/isic-logo.png" alt="ISIC" class="tv-isic-logo" />
							{:else if getCardType(section) === 'kids'}
								<!-- Hand-drawn family icon: parent + child holding hands -->
								<svg viewBox="0 0 48 48" fill="none" stroke="#D4551A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="18" cy="12" r="5" />
									<path d="M18 18c-5.5 0-9 4-9 8.5V30h18v-3.5c0-4.5-3.5-8.5-9-8.5z" />
									<circle cx="35" cy="18" r="3.5" />
									<path d="M35 22c-3 0-5.5 2.5-5.5 5.5V30h11v-2.5c0-3-2.5-5.5-5.5-5.5z" />
									<path d="M27 26c2-1 4-1 3.5 0" stroke-width="1.8" opacity="0.6" />
									<path d="M8 38c4 0 6-2 10-2s6 2 10 2 6-2 10-2" stroke-width="1.5" opacity="0.3" />
								</svg>
							{:else if getCardType(section) === 'seniors'}
								<!-- Hand-drawn senior with walking cane -->
								<svg viewBox="0 0 48 48" fill="none" stroke="#1B4F8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="20" cy="10" r="5" />
									<path d="M20 16c-5 0-8.5 3.5-8.5 8v4h17v-4c0-4.5-3.5-8-8.5-8z" />
									<path d="M16 28v10M24 28v10" stroke-width="2" />
									<path d="M34 14v24c0 2-1 3-2.5 3" stroke-width="2.5" />
									<path d="M32 14h4" stroke-width="2" />
								</svg>
							{/if}
						</div>
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

	<!-- Extras section (noodle add-ons) -->
	<section class="tv-info-section tv-extras">
		<h3 class="tv-extras-title">EXTRA</h3>
		<div class="tv-extras-grid">
			{#each extras as extra}
				<div class="tv-extras-item">
					<span class="tv-extras-name">
						{extra.nameCS}
						<span class="tv-extras-name-en">/ {extra.nameEN}</span>
					</span>
					<span class="tv-extras-price">{extra.price} Kč</span>
				</div>
			{/each}
		</div>
	</section>

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
					{#if drink.price}
						<div class="tv-drink-price">{drink.price} Kč</div>
					{/if}
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

	/* Customer info cards — color-coded by type */
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
		border-left: 5px solid var(--color-border, #E8E8E4);
	}

	.tv-card-kids {
		border-left-color: #E8621F;
	}

	.tv-card-kids .tv-info-card-title {
		color: #D4551A;
	}

	.tv-card-students {
		border-left-color: #56C1BD;
	}

	.tv-card-students .tv-info-card-title {
		color: #006B6E;
	}

	.tv-card-seniors {
		border-left-color: #2E6EB5;
	}

	.tv-card-seniors .tv-info-card-title {
		color: #1B4F8A;
	}

	.tv-card-icon {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tv-card-icon svg {
		width: 48px;
		height: 48px;
	}

	.tv-isic-logo {
		height: 48px;
		max-width: 48px;
		object-fit: contain;
		border-radius: 4px;
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

	/* Extras section */
	.tv-extras {
		flex-shrink: 0;
		padding-top: 12px;
		border-top: 2px solid var(--color-border, #E8E8E4);
	}

	.tv-extras-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-tag-size, 24px);
		font-weight: 700;
		color: var(--color-accent, #E83636);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 8px;
	}

	.tv-extras-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px 32px;
	}

	.tv-extras-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.tv-extras-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		color: var(--color-text, #2C2C2C);
		font-weight: 500;
	}

	.tv-extras-name-en {
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-extras-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-price, #16a34a);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
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
		gap: 8px;
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

	.tv-drink-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-price, #16a34a);
		font-variant-numeric: tabular-nums;
	}
</style>
