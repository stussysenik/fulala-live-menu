<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Types matching schema
	type Temperature = 'hot' | 'cold' | 'room-temp';
	type NoodleType = 'thin' | 'flat' | 'thick' | 'hand-pulled' | 'rice' | 'glass' | 'egg';
	type FryingDegree = 'light' | 'golden' | 'crispy';
	type BrothType = 'clear' | 'bone' | 'spicy' | 'tomato' | 'coconut';
	type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';
	type DietaryTag =
		| 'vegetarian'
		| 'vegan'
		| 'contains-seafood'
		| 'contains-pork'
		| 'contains-beef'
		| 'contains-chicken'
		| 'contains-nuts'
		| 'gluten-free'
		| 'dairy-free'
		| 'halal'
		| 'kosher';

	interface Modifiers {
		temperature?: Temperature[];
		noodleType?: NoodleType[];
		fryingDegree?: FryingDegree[];
		brothType?: BrothType[];
		spiceLevel?: SpiceLevel[];
	}

	interface DrinkOptions {
		temperatures: ('hot' | 'iced')[];
		defaultTemp?: string;
		sugarLevels?: string[];
		addOns?: Array<{ name: string; price: number }>;
	}

	export let modifiers: Modifiers | undefined = undefined;
	export let dietaryTags: DietaryTag[] | undefined = undefined;
	export let drinkOptions: DrinkOptions | undefined = undefined;
	export let itemCode: string | undefined = undefined;

	const dispatch = createEventDispatcher<{
		change: {
			modifiers: Modifiers | undefined;
			dietaryTags: DietaryTag[] | undefined;
			drinkOptions: DrinkOptions | undefined;
			itemCode: string | undefined;
		};
	}>();

	// Local state
	let localModifiers: Modifiers = modifiers ?? {};
	let localDietaryTags: DietaryTag[] = dietaryTags ?? [];
	let localDrinkOptions: DrinkOptions | null = drinkOptions ?? null;
	let localItemCode = itemCode ?? '';
	let isDrinkItem = !!drinkOptions;

	// All available options
	const modifierOptions = {
		temperature: [
			{ value: 'hot' as const, label: 'Hot 🔥' },
			{ value: 'cold' as const, label: 'Cold ❄️' },
			{ value: 'room-temp' as const, label: 'Room Temp 🌡️' },
		],
		noodleType: [
			{ value: 'thin' as const, label: 'Thin (细面)' },
			{ value: 'flat' as const, label: 'Flat (河粉)' },
			{ value: 'thick' as const, label: 'Thick (粗面)' },
			{ value: 'hand-pulled' as const, label: 'Hand-Pulled (拉面)' },
			{ value: 'rice' as const, label: 'Rice (米粉)' },
			{ value: 'glass' as const, label: 'Glass (粉丝)' },
			{ value: 'egg' as const, label: 'Egg (蛋面)' },
		],
		fryingDegree: [
			{ value: 'light' as const, label: 'Light ☁️' },
			{ value: 'golden' as const, label: 'Golden ⭐' },
			{ value: 'crispy' as const, label: 'Crispy 💥' },
		],
		brothType: [
			{ value: 'clear' as const, label: 'Clear (清汤)' },
			{ value: 'bone' as const, label: 'Bone (骨汤)' },
			{ value: 'spicy' as const, label: 'Spicy (麻辣)' },
			{ value: 'tomato' as const, label: 'Tomato (番茄)' },
			{ value: 'coconut' as const, label: 'Coconut (椰子)' },
		],
		spiceLevel: [
			{ value: 'mild' as const, label: 'Mild 🌶️' },
			{ value: 'medium' as const, label: 'Medium 🌶️🌶️' },
			{ value: 'hot' as const, label: 'Hot 🌶️🌶️🌶️' },
			{ value: 'extra-hot' as const, label: 'Extra Hot 🔥' },
		],
	};

	const dietaryOptions: Array<{ value: DietaryTag; label: string }> = [
		{ value: 'vegetarian', label: '🥬 Vegetarian' },
		{ value: 'vegan', label: '🌱 Vegan' },
		{ value: 'contains-seafood', label: '🦐 Contains Seafood' },
		{ value: 'contains-pork', label: '🐷 Contains Pork' },
		{ value: 'contains-beef', label: '🐄 Contains Beef' },
		{ value: 'contains-chicken', label: '🐔 Contains Chicken' },
		{ value: 'contains-nuts', label: '🥜 Contains Nuts' },
		{ value: 'gluten-free', label: 'GF Gluten-Free' },
		{ value: 'dairy-free', label: 'DF Dairy-Free' },
		{ value: 'halal', label: '☪️ Halal' },
		{ value: 'kosher', label: '✡️ Kosher' },
	];

	const defaultSugarLevels = ['0%', '30%', '50%', '70%', '100%'];

	function toggleModifier<T>(
		key: keyof Modifiers,
		value: T
	) {
		const current = (localModifiers[key] as T[] | undefined) ?? [];
		const newValues = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];

		localModifiers = {
			...localModifiers,
			[key]: newValues.length > 0 ? newValues : undefined,
		};
		emitChange();
	}

	function toggleDietaryTag(tag: DietaryTag) {
		if (localDietaryTags.includes(tag)) {
			localDietaryTags = localDietaryTags.filter((t) => t !== tag);
		} else {
			localDietaryTags = [...localDietaryTags, tag];
		}
		emitChange();
	}

	function toggleDrinkItem() {
		isDrinkItem = !isDrinkItem;
		if (isDrinkItem) {
			localDrinkOptions = {
				temperatures: ['hot', 'iced'],
				sugarLevels: defaultSugarLevels,
				addOns: [],
			};
		} else {
			localDrinkOptions = null;
		}
		emitChange();
	}

	function toggleDrinkTemp(temp: 'hot' | 'iced') {
		if (!localDrinkOptions) return;

		const current = localDrinkOptions.temperatures;
		const newTemps = current.includes(temp)
			? current.filter((t) => t !== temp)
			: [...current, temp];

		localDrinkOptions = {
			...localDrinkOptions,
			temperatures: newTemps as ('hot' | 'iced')[],
		};
		emitChange();
	}

	let newAddOnName = '';
	let newAddOnPrice = 0;

	function addDrinkAddOn() {
		if (!localDrinkOptions || !newAddOnName.trim()) return;

		localDrinkOptions = {
			...localDrinkOptions,
			addOns: [
				...(localDrinkOptions.addOns ?? []),
				{ name: newAddOnName.trim(), price: newAddOnPrice },
			],
		};
		newAddOnName = '';
		newAddOnPrice = 0;
		emitChange();
	}

	function removeDrinkAddOn(index: number) {
		if (!localDrinkOptions?.addOns) return;

		localDrinkOptions = {
			...localDrinkOptions,
			addOns: localDrinkOptions.addOns.filter((_, i) => i !== index),
		};
		emitChange();
	}

	function emitChange() {
		// Clean up empty modifier arrays
		const cleanedModifiers = Object.fromEntries(
			Object.entries(localModifiers).filter(([_, v]) => v && (v as unknown[]).length > 0)
		) as Modifiers;

		dispatch('change', {
			modifiers: Object.keys(cleanedModifiers).length > 0 ? cleanedModifiers : undefined,
			dietaryTags: localDietaryTags.length > 0 ? localDietaryTags : undefined,
			drinkOptions: localDrinkOptions ?? undefined,
			itemCode: localItemCode.trim() || undefined,
		});
	}

	function handleItemCodeChange() {
		emitChange();
	}
</script>

<div class="modifier-editor">
	<!-- Item Code -->
	<section class="editor-section">
		<h3>Item Code</h3>
		<p class="section-desc">For dim sum grid numbering (e.g., S1, F2, N3)</p>
		<input
			type="text"
			bind:value={localItemCode}
			on:input={handleItemCodeChange}
			placeholder="e.g., S1"
			class="item-code-input"
		/>
	</section>

	<!-- Dietary Tags -->
	<section class="editor-section">
		<h3>Dietary Tags</h3>
		<div class="tag-grid">
			{#each dietaryOptions as option}
				<button
					type="button"
					class="tag-btn"
					class:selected={localDietaryTags.includes(option.value)}
					on:click={() => toggleDietaryTag(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
	</section>

	<!-- Food Modifiers -->
	<section class="editor-section">
		<h3>Food Modifiers</h3>
		<p class="section-desc">Select which options customers can choose from</p>

		{#each Object.entries(modifierOptions) as [key, options]}
			<div class="modifier-group">
				<h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</h4>
				<div class="option-grid">
					{#each options as option}
						<button
							type="button"
							class="option-btn"
							class:selected={(localModifiers[key as keyof Modifiers] as string[] | undefined)?.includes(
								option.value
							)}
							on:click={() => toggleModifier(key as keyof Modifiers, option.value)}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</section>

	<!-- Drink Options -->
	<section class="editor-section">
		<h3>Drink Options</h3>
		<label class="toggle-row">
			<input type="checkbox" checked={isDrinkItem} on:change={toggleDrinkItem} />
			<span>This is a drink item</span>
		</label>

		{#if isDrinkItem && localDrinkOptions}
			<div class="drink-config">
				<div class="modifier-group">
					<h4>Temperature</h4>
					<div class="option-grid">
						<button
							type="button"
							class="option-btn"
							class:selected={localDrinkOptions.temperatures.includes('hot')}
							on:click={() => toggleDrinkTemp('hot')}
						>
							🔥 Hot
						</button>
						<button
							type="button"
							class="option-btn"
							class:selected={localDrinkOptions.temperatures.includes('iced')}
							on:click={() => toggleDrinkTemp('iced')}
						>
							❄️ Iced
						</button>
					</div>
				</div>

				<div class="modifier-group">
					<h4>Add-ons</h4>
					{#if localDrinkOptions.addOns && localDrinkOptions.addOns.length > 0}
						<ul class="addon-list">
							{#each localDrinkOptions.addOns as addOn, index}
								<li>
									<span>{addOn.name}</span>
									<span>+{(addOn.price / 100).toFixed(2)}</span>
									<button type="button" class="remove-btn" on:click={() => removeDrinkAddOn(index)}>
										×
									</button>
								</li>
							{/each}
						</ul>
					{/if}
					<div class="addon-form">
						<input
							type="text"
							bind:value={newAddOnName}
							placeholder="Add-on name"
							class="addon-name"
						/>
						<input
							type="number"
							bind:value={newAddOnPrice}
							placeholder="Price (cents)"
							class="addon-price"
							min="0"
						/>
						<button
							type="button"
							class="add-btn"
							on:click={addDrinkAddOn}
							disabled={!newAddOnName.trim()}
						>
							Add
						</button>
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>

<style>
	.modifier-editor {
		display: flex;
		flex-direction: column;
		gap: var(--space-5, 1.5rem);
	}

	.editor-section {
		padding: var(--space-4, 1rem);
		background: rgba(0, 0, 0, 0.02);
		border-radius: var(--radius-md, 8px);
	}

	.editor-section h3 {
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		margin: 0 0 var(--space-2, 0.5rem);
	}

	.section-desc {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin: 0 0 var(--space-3, 0.75rem);
	}

	.item-code-input {
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		width: 100px;
		text-transform: uppercase;
	}

	.tag-grid,
	.option-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2, 0.5rem);
	}

	.tag-btn,
	.option-btn {
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		border: 2px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		background: var(--color-surface, white);
		font-size: var(--text-sm, 0.875rem);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.tag-btn:hover,
	.option-btn:hover {
		border-color: var(--color-accent, #c45a3b);
	}

	.tag-btn.selected,
	.option-btn.selected {
		border-color: var(--color-accent, #c45a3b);
		background: rgba(196, 90, 59, 0.1);
	}

	.modifier-group {
		margin-top: var(--space-4, 1rem);
	}

	.modifier-group h4 {
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		margin: 0 0 var(--space-2, 0.5rem);
		text-transform: capitalize;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		cursor: pointer;
	}

	.toggle-row input {
		width: 18px;
		height: 18px;
	}

	.drink-config {
		margin-top: var(--space-4, 1rem);
		padding-top: var(--space-4, 1rem);
		border-top: 1px solid var(--color-border, #e5e5e5);
	}

	.addon-list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-3, 0.75rem);
	}

	.addon-list li {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-2, 0.5rem);
		background: var(--color-surface, white);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-sm, 4px);
		margin-bottom: var(--space-1, 0.25rem);
	}

	.addon-list li span:first-child {
		flex: 1;
	}

	.remove-btn {
		width: 24px;
		height: 24px;
		border: none;
		background: rgba(220, 38, 38, 0.1);
		color: #dc2626;
		border-radius: 50%;
		cursor: pointer;
		font-size: 16px;
	}

	.addon-form {
		display: flex;
		gap: var(--space-2, 0.5rem);
	}

	.addon-name {
		flex: 1;
		padding: var(--space-2, 0.5rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-sm, 4px);
	}

	.addon-price {
		width: 80px;
		padding: var(--space-2, 0.5rem);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-sm, 4px);
	}

	.add-btn {
		padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
		background: var(--color-accent, #c45a3b);
		color: white;
		border: none;
		border-radius: var(--radius-sm, 4px);
		cursor: pointer;
	}

	.add-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
