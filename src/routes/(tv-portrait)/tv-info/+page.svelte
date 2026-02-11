<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import { EU_ALLERGENS } from '$lib/allergens';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];

	// Extract featured items across all categories
	$: featuredItems = menu.flatMap((c: any) => c.items.filter((i: any) => i.isFeatured && i.isAvailable));

	// Collect all used allergen codes
	$: usedAllergenNumbers = [...new Set(
		menu.flatMap((c: any) => c.items.flatMap((i: any) => i.allergenNumbers ?? []))
	)].sort((a: number, b: number) => a - b);

	// Filter EU_ALLERGENS to only show used ones
	$: usedAllergens = EU_ALLERGENS.filter(a => usedAllergenNumbers.includes(a.number));

	// Get used sub-type codes
	$: usedAllergenCodes = [...new Set(
		menu.flatMap((c: any) => c.items.flatMap((i: any) => i.allergenCodes ?? []))
	)];

	const customerInfo = browser ? useQuery(api.settings.getCustomerInfo, {}) : null;

	interface InfoSection {
		title: string;
		titleLocal?: string;
		description: string;
		descriptionLocal?: string;
	}

	function isStudentSection(section: InfoSection): boolean {
		const text = `${section.title} ${section.titleLocal ?? ''} ${section.description}`.toLowerCase();
		return text.includes('isic') || text.includes('student') || text.includes('studenti');
	}

	function formatPrice(price: number): string {
		return `${price} Kč`;
	}
</script>

<svelte:head>
	<title>FULALA.CZ | Info & Highlights</title>
</svelte:head>

<div class="tv-info-page">
	<!-- Featured items -->
	{#if featuredItems.length > 0}
		<section class="tv-info-section tv-featured">
			<h2 class="tv-section-title">Doporučujeme / Featured</h2>
			<div class="tv-featured-list">
				{#each featuredItems as item (item._id)}
					<div class="tv-featured-card">
						{#if item.imageUrl}
							<div class="tv-featured-image">
								<img src={item.imageUrl} alt={item.name} loading="eager" decoding="async" />
							</div>
						{/if}
						<div class="tv-featured-info">
							<h3 class="tv-featured-name">{item.nameLocal || item.name}</h3>
							{#if item.nameChinese}
								<span class="tv-featured-chinese">{item.nameChinese}</span>
							{/if}
							{#if item.nameLocal}
								<p class="tv-featured-name-en">{item.name}</p>
							{/if}
						</div>
						<div class="tv-featured-price-col">
							{#if item.quantity}
								<span class="tv-featured-quantity">{item.quantity}</span>
							{/if}
							<span class="tv-featured-price">{formatPrice(item.price)}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Customer info / discounts -->
	{#if $customerInfo?.sections?.length}
		<section class="tv-info-section tv-customer">
			<h2 class="tv-section-title">Informace / Info</h2>
			<div class="tv-info-cards">
				{#each $customerInfo.sections as section}
					<div class="tv-info-card" class:tv-isic-card={isStudentSection(section)}>
						{#if isStudentSection(section)}
							<img src="/images/isic-logo.png" alt="ISIC" class="tv-isic-logo" />
						{/if}
						<div class="tv-info-card-title">
							{section.titleLocal || section.title}
							{#if section.titleLocal}
								<span class="tv-info-card-title-en">/ {section.title}</span>
							{/if}
						</div>
						<div class="tv-info-card-desc">
							{section.descriptionLocal || section.description}
						</div>
						{#if section.descriptionLocal && section.description}
							<div class="tv-info-card-desc-en">{section.description}</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Allergen legend (only used allergens) -->
	{#if usedAllergens.length > 0}
		<section class="tv-info-section tv-allergens">
			<h2 class="tv-section-title">Alergeny / Allergens</h2>
			<div class="tv-allergen-grid">
				{#each usedAllergens as allergen}
					<div class="tv-allergen-item">
						<span class="tv-allergen-number">{allergen.number}</span>
						<span class="tv-allergen-icon">{allergen.icon}</span>
						<div class="tv-allergen-names">
							<span class="tv-allergen-name-cs">{allergen.nameCZ}</span>
							<span class="tv-allergen-name-en">{allergen.name}</span>
						</div>
					</div>
					{#if allergen.subTypes}
						{#each allergen.subTypes.filter(s => usedAllergenCodes.includes(s.code)) as sub}
							<div class="tv-allergen-item tv-allergen-subtype">
								<span class="tv-allergen-number tv-allergen-number-sub">{sub.code}</span>
								<span class="tv-allergen-icon"></span>
								<div class="tv-allergen-names">
									<span class="tv-allergen-name-cs">{sub.nameCZ}</span>
									<span class="tv-allergen-name-en">{sub.name}</span>
								</div>
							</div>
						{/each}
					{/if}
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.tv-info-page {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--tv-section-gap, 40px);
		min-height: 0;
	}

	.tv-info-section {
		flex-shrink: 0;
	}

	.tv-section-title {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: var(--tv-info-title-size, 40px);
		font-weight: 700;
		color: var(--color-text, #2C2C2C);
		line-height: 1.2;
		padding-bottom: 12px;
		border-bottom: 4px solid var(--color-accent, #E83636);
		margin-bottom: 16px;
	}

	/* Featured items */
	.tv-featured-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tv-featured-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 16px;
		background: color-mix(in srgb, var(--color-accent, #E83636) 4%, var(--color-surface, #FFFFFF));
		border-radius: 12px;
		border-left: 5px solid var(--color-accent, #E83636);
	}

	.tv-featured-image {
		width: 100px;
		height: 100px;
		border-radius: 10px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.tv-featured-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.tv-featured-info {
		flex: 1;
		min-width: 0;
	}

	.tv-featured-name {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 36px;
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
		line-height: 1.2;
	}

	.tv-featured-chinese {
		font-size: 30px;
		color: var(--color-text-muted, #6B6B6B);
		display: block;
		margin-top: 2px;
	}

	.tv-featured-name-en {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 26px;
		color: var(--color-text-muted, #6B6B6B);
		margin-top: 2px;
	}

	.tv-featured-price-col {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
		gap: 2px;
	}

	.tv-featured-quantity {
		font-size: 24px;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-featured-price {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: 44px;
		font-weight: 600;
		color: var(--color-price, #16a34a);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		line-height: 1;
	}

	/* Customer info cards */
	.tv-info-cards {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tv-info-card {
		padding: 20px 24px;
		background: var(--color-surface, #FFFFFF);
		border: 2px solid var(--color-border, #E8E8E4);
		border-radius: 12px;
	}

	.tv-info-card-title {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-info-body-size, 28px);
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
		font-size: calc(var(--tv-info-body-size, 28px) * 0.85);
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.3;
	}

	.tv-info-card-desc-en {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: calc(var(--tv-info-body-size, 28px) * 0.8);
		color: var(--color-text-muted, #6B6B6B);
		opacity: 0.7;
		margin-top: 2px;
	}

	.tv-isic-card {
		border-left: 5px solid #56C1BD;
	}

	.tv-isic-card .tv-info-card-title {
		color: #006B6E;
	}

	.tv-isic-logo {
		width: 64px;
		height: auto;
		margin-bottom: 8px;
	}

	/* Allergen legend */
	.tv-allergen-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px 32px;
	}

	.tv-allergen-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 0;
	}

	.tv-allergen-subtype {
		padding-left: 20px;
	}

	.tv-allergen-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 36px;
		height: 36px;
		padding: 0 4px;
		border-radius: 50%;
		border: 2px solid var(--color-accent, #E83636);
		font-size: 18px;
		font-family: var(--font-price, 'DM Mono', monospace);
		font-weight: 600;
		color: var(--color-accent, #E83636);
		flex-shrink: 0;
	}

	.tv-allergen-number-sub {
		font-size: 15px;
		min-width: 32px;
		height: 32px;
	}

	.tv-allergen-icon {
		font-size: 24px;
		width: 28px;
		text-align: center;
		flex-shrink: 0;
	}

	.tv-allergen-names {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.tv-allergen-name-cs {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 22px;
		color: var(--color-text, #2C2C2C);
		font-weight: 500;
	}

	.tv-allergen-name-en {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 19px;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-allergen-subtype .tv-allergen-name-cs {
		font-size: 20px;
		font-weight: 400;
	}

	.tv-allergen-subtype .tv-allergen-name-en {
		font-size: 17px;
	}
</style>
