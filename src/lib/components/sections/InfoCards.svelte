<script lang="ts">
	/**
	 * Section: customer info cards (kids / students / seniors discounts).
	 *
	 * Layer rule: sections fetch their own data via queries and compose
	 * atoms/markup; pages are just config. Extracted verbatim from tv-info —
	 * card content comes from the `customer-info` site settings, card color
	 * coding is derived from the title keywords.
	 */
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

	function getCardType(section: InfoSection): string {
		const text = `${section.title} ${section.titleLocal ?? ''}`.toLowerCase();
		if (text.includes('kid') || text.includes('děti') || text.includes('family') || text.includes('rodina')) return 'kids';
		if (text.includes('student') || text.includes('isic')) return 'students';
		if (text.includes('senior') || text.includes('senioř')) return 'seniors';
		return 'default';
	}
</script>

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

<style>
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
</style>
