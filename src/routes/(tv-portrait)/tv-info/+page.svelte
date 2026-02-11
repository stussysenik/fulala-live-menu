<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';
	import { EU_ALLERGENS } from '$lib/allergens';

	const menuQuery = browser ? useQuery(api.menu.getFullMenu) : null;
	$: menu = $menuQuery ?? [];

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
</script>

<svelte:head>
	<title>FULALA.CZ | Info & Allergens</title>
</svelte:head>

<div class="tv-info-page">
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
						<div class="tv-info-card-content">
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
		padding-bottom: 16px;
		border-bottom: 4px solid var(--color-accent, #E83636);
		margin-bottom: 20px;
	}

	/* Customer info cards */
	.tv-info-cards {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.tv-info-card {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 24px 28px;
		background: var(--color-surface, #FFFFFF);
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
		margin-bottom: 6px;
	}

	.tv-info-card-title-en {
		font-weight: 500;
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-info-card-desc {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: calc(var(--tv-info-body-size, 36px) * 0.8);
		color: var(--color-text-muted, #6B6B6B);
		line-height: 1.3;
	}

	.tv-info-card-desc-en {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: calc(var(--tv-info-body-size, 36px) * 0.72);
		color: var(--color-text-muted, #6B6B6B);
		opacity: 0.7;
		margin-top: 4px;
	}

	.tv-isic-card {
		border-left: 5px solid #56C1BD;
	}

	.tv-isic-card .tv-info-card-title {
		color: #006B6E;
	}

	.tv-isic-logo {
		width: 80px;
		height: auto;
		flex-shrink: 0;
	}

	/* Allergen legend */
	.tv-allergen-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px 40px;
	}

	.tv-allergen-item {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 8px 0;
	}

	.tv-allergen-subtype {
		padding-left: 24px;
	}

	.tv-allergen-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--tv-info-allergen-badge-size, 44px);
		height: var(--tv-info-allergen-badge-size, 44px);
		padding: 0 4px;
		border-radius: 50%;
		border: 2.5px solid var(--color-accent, #E83636);
		font-size: var(--tv-info-allergen-number-size, 28px);
		font-family: var(--font-price, 'DM Mono', monospace);
		font-weight: 600;
		color: var(--color-accent, #E83636);
		flex-shrink: 0;
	}

	.tv-allergen-number-sub {
		font-size: 24px;
		min-width: calc(var(--tv-info-allergen-badge-size, 44px) * 0.85);
		height: calc(var(--tv-info-allergen-badge-size, 44px) * 0.85);
	}

	.tv-allergen-icon {
		font-size: var(--tv-info-allergen-icon-size, 32px);
		width: 36px;
		text-align: center;
		flex-shrink: 0;
	}

	.tv-allergen-names {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.tv-allergen-name-cs {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-info-allergen-name-size, 30px);
		color: var(--color-text, #2C2C2C);
		font-weight: 500;
	}

	.tv-allergen-name-en {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-info-allergen-name-en-size, 26px);
		color: var(--color-text-muted, #6B6B6B);
	}

	.tv-allergen-subtype .tv-allergen-name-cs {
		font-size: calc(var(--tv-info-allergen-name-size, 30px) * 0.9);
		font-weight: 400;
	}

	.tv-allergen-subtype .tv-allergen-name-en {
		font-size: 24px;
	}
</style>
