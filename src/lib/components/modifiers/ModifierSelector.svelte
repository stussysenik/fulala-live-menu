<script lang="ts">
	/**
	 * Modifier sheet — renders the item's option groups (required groups
	 * first) and blocks add-to-cart until every required group is picked.
	 * Validation runs the same domain function the order mutations run, so
	 * "the button enabled" and "the server accepts" can never disagree.
	 */
	import { createEventDispatcher } from 'svelte';
	import type { Doc } from '../../../../convex/_generated/dataModel';
	import PriceDisplay from '../PriceDisplay.svelte';
	import DietaryTags from '../DietaryTags.svelte';
	import {
		validateSelections,
		legacyToOptionGroups,
		type OptionSelections,
	} from '$lib/domain/optionValidation';

	export let item: Doc<'menuItems'>;
	export let isOpen: boolean = false;

	const dispatch = createEventDispatcher<{
		close: void;
		addToOrder: {
			item: Doc<'menuItems'>;
			quantity: number;
			selectedModifiers: {
				noodleType?: string;
				temperature?: string;
				spiceLevel?: string;
				brothType?: string;
				fryingDegree?: string;
				sugarLevel?: string;
				addOns?: string[];
			};
		};
	}>();

	let quantity = 1;
	// Group key → picked value(s); the shape validateSelections speaks.
	let selections: OptionSelections = {};

	// Required groups render first — a customer scrolling top-to-bottom hits
	// the blocking choices before the optional ones.
	$: groups = [...legacyToOptionGroups(item)].sort(
		(a, b) => Number(b.required) - Number(a.required)
	);

	$: issues = validateSelections(groups, selections);
	$: missingGroups = issues
		.filter((i) => i.code === 'missing-required')
		.map((i) => {
			const group = groups.find((g) => g.key === i.groupKey);
			return group?.label ?? labelForGroup(i.groupKey);
		});
	$: canAdd = issues.length === 0;

	function pickSingle(key: string, value: string) {
		// Clicking the selected value again deselects (matters for optional groups).
		selections = { ...selections, [key]: selections[key] === value ? '' : value };
	}

	function toggleMulti(key: string, value: string) {
		const current = Array.isArray(selections[key]) ? (selections[key] as string[]) : [];
		selections = {
			...selections,
			[key]: current.includes(value)
				? current.filter((v) => v !== value)
				: [...current, value],
		};
	}

	function isPicked(key: string, value: string): boolean {
		const sel = selections[key];
		return Array.isArray(sel) ? sel.includes(value) : sel === value;
	}

	// Display metadata for known group keys — icons and bilingual labels.
	// Unknown (custom) group keys fall back to plain text.
	const modifierConfig = {
		temperature: {
			label: 'Temperature',
			options: [
				{ value: 'hot', icon: '🔥', label: 'Hot' },
				{ value: 'cold', icon: '❄️', label: 'Cold' },
				{ value: 'room-temp', icon: '🌡️', label: 'Room Temp' },
			],
		},
		noodleType: {
			label: 'Noodle Type',
			options: [
				{ value: 'thin', icon: '🧵', label: 'Thin (细面)' },
				{ value: 'flat', icon: '📏', label: 'Flat (河粉)' },
				{ value: 'thick', icon: '🔲', label: 'Thick (粗面)' },
				{ value: 'hand-pulled', icon: '🤲', label: 'Hand-Pulled (拉面)' },
				{ value: 'rice', icon: '🍚', label: 'Rice (米粉)' },
				{ value: 'glass', icon: '✨', label: 'Glass (粉丝)' },
				{ value: 'egg', icon: '🥚', label: 'Egg (蛋面)' },
			],
		},
		fryingDegree: {
			label: 'Crispiness',
			options: [
				{ value: 'light', icon: '☁️', label: 'Light' },
				{ value: 'golden', icon: '⭐', label: 'Golden' },
				{ value: 'crispy', icon: '💥', label: 'Extra Crispy' },
			],
		},
		brothType: {
			label: 'Broth Type',
			options: [
				{ value: 'clear', icon: '💧', label: 'Clear (清汤)' },
				{ value: 'bone', icon: '🦴', label: 'Bone (骨汤)' },
				{ value: 'spicy', icon: '🌶️', label: 'Spicy (麻辣)' },
				{ value: 'tomato', icon: '🍅', label: 'Tomato (番茄)' },
				{ value: 'coconut', icon: '🥥', label: 'Coconut (椰子)' },
			],
		},
		spiceLevel: {
			label: 'Spice Level',
			options: [
				{ value: 'mild', icon: '🌶️', label: 'Mild' },
				{ value: 'medium', icon: '🌶️🌶️', label: 'Medium' },
				{ value: 'hot', icon: '🌶️🌶️🌶️', label: 'Hot' },
				{ value: 'extra-hot', icon: '🔥', label: 'Extra Hot' },
			],
		},
	};

	const GROUP_LABELS: Record<string, string> = {
		temperature: 'Temperature',
		noodleType: 'Noodle Type',
		fryingDegree: 'Crispiness',
		brothType: 'Broth Type',
		spiceLevel: 'Spice Level',
		sugarLevel: 'Sugar Level',
		addOns: 'Add-ons',
	};

	function labelForGroup(key: string): string {
		return (
			GROUP_LABELS[key] ??
			key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
		);
	}

	function optionMeta(groupKey: string, value: string): { icon?: string; label: string } {
		const known = modifierConfig[groupKey as keyof typeof modifierConfig];
		const option = known?.options.find((o) => o.value === value);
		if (option) return option;
		if (groupKey === 'temperature') {
			return value === 'iced'
				? { icon: '❄️', label: 'Iced' }
				: { icon: undefined, label: value };
		}
		return { label: value };
	}

	// Priced add-ons still come from the legacy drinkOptions list (the only
	// place option prices live today).
	$: drinkAddOns = item.drinkOptions?.addOns ?? [];

	function addOnPrice(name: string): number {
		return drinkAddOns.find((a) => a.name === name)?.price ?? 0;
	}

	function handleClose() {
		dispatch('close');
	}

	// Map group-keyed selections back to the fixed-key shape order lines
	// store. Custom group keys beyond these would need the order schema to
	// grow with them — today's menu only uses the known keys.
	function handleAddToOrder() {
		if (!canAdd) return;
		const single = (key: string): string | undefined => {
			const sel = selections[key];
			return typeof sel === 'string' && sel !== '' ? sel : undefined;
		};
		const addOns = Array.isArray(selections.addOns) ? (selections.addOns as string[]) : [];

		dispatch('addToOrder', {
			item,
			quantity,
			selectedModifiers: {
				noodleType: single('noodleType'),
				temperature: single('temperature'),
				spiceLevel: single('spiceLevel'),
				brothType: single('brothType'),
				fryingDegree: single('fryingDegree'),
				sugarLevel: single('sugarLevel'),
				addOns: addOns.length > 0 ? addOns : undefined,
			},
		});
		quantity = 1;
		selections = {};
	}

	$: addOnTotal = (Array.isArray(selections.addOns) ? (selections.addOns as string[]) : [])
		.reduce((sum, name) => sum + addOnPrice(name), 0);

	$: totalPrice = (item.price + addOnTotal) * quantity;
</script>

{#if isOpen}
	<div class="modal-backdrop" on:click={handleClose} on:keydown={(e) => e.key === 'Escape' && handleClose()}>
		<div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true">
			<button class="close-btn" on:click={handleClose} aria-label="Close">
				&times;
			</button>

			<header class="modal-header">
				<h2>{item.name}</h2>
				{#if item.description}
					<p class="item-description">{item.description}</p>
				{/if}
				{#if item.dietaryTags && item.dietaryTags.length > 0}
					<div class="dietary-tags">
						<DietaryTags tags={item.dietaryTags} />
					</div>
				{/if}
			</header>

			<div class="modal-body">
				{#each groups as group (group.key)}
					<div class="modifier-section">
						<h3>
							{group.label ?? labelForGroup(group.key)}
							{#if group.required}
								<span class="required-badge">required</span>
							{/if}
						</h3>
						<div class="modifier-options">
							{#each group.values as value}
								{@const meta = optionMeta(group.key, value)}
								{@const price = group.key === 'addOns' ? addOnPrice(value) : 0}
								<button
									class="modifier-option"
									class:selected={isPicked(group.key, value)}
									on:click={() =>
										group.multi ? toggleMulti(group.key, value) : pickSingle(group.key, value)}
								>
									{#if meta.icon}
										<span class="option-icon">{meta.icon}</span>
									{/if}
									<span class="option-label">{meta.label}</span>
									{#if price > 0}
										<span class="option-price">+<PriceDisplay {price} /></span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<footer class="modal-footer">
				<div class="quantity-controls">
					<button
						class="qty-btn"
						on:click={() => (quantity = Math.max(1, quantity - 1))}
						disabled={quantity <= 1}
					>
						-
					</button>
					<span class="qty-value">{quantity}</span>
					<button class="qty-btn" on:click={() => (quantity += 1)}>+</button>
				</div>

				<button class="add-btn" disabled={!canAdd} on:click={handleAddToOrder}>
					<span>
						{#if canAdd}
							Add to Order
						{:else}
							Choose {missingGroups.join(', ')}
						{/if}
					</span>
					<span class="price-total">
						<PriceDisplay price={totalPrice} />
					</span>
				</button>
			</footer>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4, 1rem);
	}

	.modal-content {
		background: var(--color-surface, white);
		border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		animation: slideUp 0.2s ease;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@media (min-width: 600px) {
		.modal-backdrop {
			align-items: center;
		}

		.modal-content {
			border-radius: var(--radius-lg, 12px);
		}
	}

	.close-btn {
		position: absolute;
		top: var(--space-3, 0.75rem);
		right: var(--space-3, 0.75rem);
		width: 32px;
		height: 32px;
		border: none;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		font-size: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-header {
		padding: var(--space-4, 1rem);
		border-bottom: 1px solid var(--color-border, #e5e5e5);
	}

	.modal-header h2 {
		font-size: var(--text-xl, 1.25rem);
		font-weight: 600;
		margin: 0 0 var(--space-2, 0.5rem);
		padding-right: 32px;
	}

	.item-description {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin: 0 0 var(--space-2, 0.5rem);
	}

	.modal-body {
		padding: var(--space-4, 1rem);
	}

	.modifier-section {
		margin-bottom: var(--space-4, 1rem);
	}

	.modifier-section:last-child {
		margin-bottom: 0;
	}

	.modifier-section h3 {
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
		margin: 0 0 var(--space-2, 0.5rem);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.required-badge {
		font-size: var(--text-xs, 0.75rem);
		font-weight: 600;
		color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.1);
		border-radius: 999px;
		padding: 1px 8px;
		margin-left: var(--space-2, 0.5rem);
		text-transform: none;
		letter-spacing: 0;
	}

	.add-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.modifier-options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2, 0.5rem);
	}

	.modifier-option {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		border: 2px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		background: var(--color-surface, white);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.modifier-option:hover {
		border-color: var(--color-accent, #c45a3b);
	}

	.modifier-option.selected {
		border-color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.1);
	}

	.option-icon {
		font-size: 1.2em;
	}

	.option-label {
		font-size: var(--text-sm, 0.875rem);
		font-weight: 500;
	}

	.option-price {
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-text-muted, #666);
	}

	.modifier-option.sugar {
		flex: 1;
		justify-content: center;
		min-width: 60px;
	}

	.modal-footer {
		padding: var(--space-4, 1rem);
		border-top: 1px solid var(--color-border, #e5e5e5);
		display: flex;
		gap: var(--space-4, 1rem);
		align-items: center;
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		background: rgba(0, 0, 0, 0.05);
		border-radius: var(--radius-md, 8px);
		padding: var(--space-1, 0.25rem);
	}

	.qty-btn {
		width: 36px;
		height: 36px;
		border: none;
		background: var(--color-surface, white);
		border-radius: var(--radius-sm, 4px);
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.qty-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.qty-btn:not(:disabled):hover {
		background: var(--color-accent, #c45a3b);
		color: white;
	}

	.qty-value {
		min-width: 36px;
		text-align: center;
		font-weight: 600;
		font-size: var(--text-lg, 1.125rem);
	}

	.add-btn {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
		background: var(--color-accent, #c45a3b);
		color: white;
		border: none;
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.add-btn:hover {
		opacity: 0.9;
	}

	.price-total {
		font-weight: 700;
	}
</style>
