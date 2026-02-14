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
	<title>FULALA.CZ | Info & Nápoje / Drinks ♥</title>
</svelte:head>

<div class="vi-info-page">
	<!-- Customer info / discounts -->
	{#if $customerInfo?.sections?.length}
		<section class="vi-section vi-customer">
			<div class="vi-info-cards">
				{#each $customerInfo.sections as section}
					<div
						class="vi-info-card"
						class:vi-card-kids={getCardType(section) === 'kids'}
						class:vi-card-students={getCardType(section) === 'students'}
						class:vi-card-seniors={getCardType(section) === 'seniors'}
					>
						<div class="vi-card-icon">
							{#if getCardType(section) === 'students'}
								<img src="/images/isic-logo.png" alt="ISIC" class="vi-isic-logo" />
							{:else if getCardType(section) === 'kids'}
								<svg viewBox="0 0 48 48" fill="none" stroke="#D4551A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="18" cy="12" r="5" />
									<path d="M18 18c-5.5 0-9 4-9 8.5V30h18v-3.5c0-4.5-3.5-8.5-9-8.5z" />
									<circle cx="35" cy="18" r="3.5" />
									<path d="M35 22c-3 0-5.5 2.5-5.5 5.5V30h11v-2.5c0-3-2.5-5.5-5.5-5.5z" />
									<path d="M27 26c2-1 4-1 3.5 0" stroke-width="1.8" opacity="0.6" />
									<path d="M8 38c4 0 6-2 10-2s6 2 10 2 6-2 10-2" stroke-width="1.5" opacity="0.3" />
								</svg>
							{:else if getCardType(section) === 'seniors'}
								<svg viewBox="0 0 48 48" fill="none" stroke="#1B4F8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<circle cx="20" cy="10" r="5" />
									<path d="M20 16c-5 0-8.5 3.5-8.5 8v4h17v-4c0-4.5-3.5-8-8.5-8z" />
									<path d="M16 28v10M24 28v10" stroke-width="2" />
									<path d="M34 14v24c0 2-1 3-2.5 3" stroke-width="2.5" />
									<path d="M32 14h4" stroke-width="2" />
								</svg>
							{/if}
						</div>
						<div class="vi-info-card-content">
							<div class="vi-info-card-title">
								{section.titleLocal || section.title}
								{#if section.titleLocal}
									<span class="vi-info-card-title-en">/ {section.title}</span>
								{/if}
							</div>
							<div class="vi-info-card-desc">
								{section.descriptionLocal || section.description}
								{#if section.descriptionLocal && section.description}
									<span class="vi-info-card-desc-en">/ {section.description}</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Heart divider -->
	<div class="vi-heart-divider" aria-hidden="true">
		<span>♥</span>
	</div>

	<!-- Extras section (noodle add-ons) -->
	<section class="vi-section vi-extras">
		<h3 class="vi-extras-title">EXTRA</h3>
		<div class="vi-extras-grid">
			{#each extras as extra}
				<div class="vi-extras-item">
					<span class="vi-extras-name">
						{extra.nameCS}
						<span class="vi-extras-name-en">/ {extra.nameEN}</span>
					</span>
					<span class="vi-extras-price">{extra.price} Kč</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Heart divider -->
	<div class="vi-heart-divider" aria-hidden="true">
		<span>♥</span>
	</div>

	<!-- Drinks section -->
	<section class="vi-section vi-drinks">
		<h2 class="vi-section-title">Nápoje / Drinks</h2>
		<div class="vi-drinks-grid">
			{#each drinks as drink}
				<div class="vi-drink-card">
					<div class="vi-drink-image">
						<img src={drink.image} alt={drink.nameCS} loading="eager" />
					</div>
					<div class="vi-drink-name">
						{drink.nameCS}
						{#if drink.nameCN}
							<span class="vi-drink-cn">{drink.nameCN}</span>
						{/if}
					</div>
					{#if drink.price}
						<div class="vi-drink-price">{drink.price} Kč</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.vi-info-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--tv-section-gap, 36px);
		min-height: 0;
		justify-content: space-evenly;
	}

	/* ── Gradient section title (red → gold) ──────────────── */
	.vi-section-title {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: var(--tv-info-title-size, 44px);
		font-weight: 700;
		color: var(--color-text, #2C2C2C);
		line-height: 1.2;
		padding-bottom: 12px;
		border-bottom: none;
		background-image: linear-gradient(90deg, var(--color-accent, #E83636), #D4A76A);
		background-size: 100% 4px;
		background-position: bottom;
		background-repeat: no-repeat;
		margin-bottom: 16px;
	}

	/* ── Heart dividers ──────────────────────────────────── */
	.vi-heart-divider {
		text-align: center;
		line-height: 1;
		flex-shrink: 0;
	}

	.vi-heart-divider span {
		color: var(--color-accent, #E83636);
		font-size: 20px;
		opacity: 0.3;
	}

	/* ── Customer info cards — warm-tinted borders ────────── */
	.vi-info-cards {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.vi-info-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px 24px;
		border: 2px solid var(--color-border, #E8D8D0);
		border-radius: 12px;
		border-left: 5px solid var(--color-border, #E8D8D0);
		background: color-mix(in srgb, var(--color-surface, #FFFAF5) 80%, transparent);
	}

	.vi-card-kids {
		border-left-color: #E8621F;
	}

	.vi-card-kids .vi-info-card-title {
		color: #D4551A;
	}

	.vi-card-students {
		border-left-color: #56C1BD;
	}

	.vi-card-students .vi-info-card-title {
		color: #006B6E;
	}

	.vi-card-seniors {
		border-left-color: #2E6EB5;
	}

	.vi-card-seniors .vi-info-card-title {
		color: #1B4F8A;
	}

	.vi-card-icon {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.vi-card-icon svg {
		width: 48px;
		height: 48px;
	}

	.vi-isic-logo {
		height: 48px;
		max-width: 48px;
		object-fit: contain;
		border-radius: 4px;
	}

	.vi-info-card-content {
		flex: 1;
		min-width: 0;
	}

	.vi-info-card-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-info-body-size, 36px);
		font-weight: 700;
		color: var(--color-text, #2C2C2C);
		margin-bottom: 4px;
	}

	.vi-info-card-title-en {
		font-weight: 500;
		color: var(--color-text-muted, #6B6B6B);
	}

	.vi-info-card-desc {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.3;
	}

	.vi-info-card-desc-en {
		color: var(--color-text-muted, #6B6B6B);
		opacity: 0.7;
	}

	/* ── Extras section ──────────────────────────────────── */
	.vi-extras {
		flex-shrink: 0;
		padding-top: 12px;
		border-top: 2px solid var(--color-border, #E8D8D0);
	}

	.vi-extras-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-tag-size, 24px);
		font-weight: 700;
		color: var(--color-accent, #E83636);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 8px;
	}

	.vi-extras-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 4px 32px;
	}

	.vi-extras-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.vi-extras-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		color: var(--color-text, #2C2C2C);
		font-weight: 500;
	}

	.vi-extras-name-en {
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}

	.vi-extras-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-price, #B8860B);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	/* ── Drinks section ──────────────────────────────────── */
	.vi-drinks-grid {
		display: flex;
		gap: 24px;
		justify-content: space-evenly;
	}

	.vi-drink-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		flex: 1;
		max-width: 180px;
	}

	.vi-drink-image {
		width: 120px;
		height: 120px;
		border-radius: var(--tv-image-radius, 12px);
		overflow: hidden;
		background: color-mix(in srgb, var(--color-surface, #FFFAF5) 60%, #f5f5f5);
	}

	.vi-drink-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.vi-drink-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
		text-align: center;
		line-height: 1.2;
	}

	.vi-drink-cn {
		display: block;
		font-size: var(--tv-quantity-size, 26px);
		font-weight: 400;
		color: var(--color-text-muted, #6B6B6B);
	}

	.vi-drink-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-item-name-secondary, 28px);
		font-weight: 600;
		color: var(--color-price, #B8860B);
		font-variant-numeric: tabular-nums;
	}
</style>
