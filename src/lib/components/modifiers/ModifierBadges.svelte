<script lang="ts">
	// Types matching schema
	type Temperature = 'hot' | 'cold' | 'room-temp';
	type NoodleType = 'thin' | 'flat' | 'thick' | 'hand-pulled' | 'rice' | 'glass' | 'egg';
	type FryingDegree = 'light' | 'golden' | 'crispy';
	type BrothType = 'clear' | 'bone' | 'spicy' | 'tomato' | 'coconut';
	type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';

	interface Modifiers {
		temperature?: Temperature[];
		noodleType?: NoodleType[];
		fryingDegree?: FryingDegree[];
		brothType?: BrothType[];
		spiceLevel?: SpiceLevel[];
	}

	export let modifiers: Modifiers | undefined;
	export let compact: boolean = false;

	// Modifier configurations
	const modifierConfig = {
		temperature: {
			icon: '🌡️',
			label: 'Temperature',
			options: {
				hot: { icon: '🔥', label: 'Hot' },
				cold: { icon: '❄️', label: 'Cold' },
				'room-temp': { icon: '🌡️', label: 'Room Temp' },
			},
		},
		noodleType: {
			icon: '🍜',
			label: 'Noodles',
			options: {
				thin: { icon: '🧵', label: 'Thin (细面)' },
				flat: { icon: '📏', label: 'Flat (河粉)' },
				thick: { icon: '🔲', label: 'Thick (粗面)' },
				'hand-pulled': { icon: '🤲', label: 'Hand-Pulled (拉面)' },
				rice: { icon: '🍚', label: 'Rice (米粉)' },
				glass: { icon: '✨', label: 'Glass (粉丝)' },
				egg: { icon: '🥚', label: 'Egg (蛋面)' },
			},
		},
		fryingDegree: {
			icon: '🍳',
			label: 'Crispiness',
			options: {
				light: { icon: '☁️', label: 'Light' },
				golden: { icon: '⭐', label: 'Golden' },
				crispy: { icon: '💥', label: 'Crispy' },
			},
		},
		brothType: {
			icon: '🥣',
			label: 'Broth',
			options: {
				clear: { icon: '💧', label: 'Clear (清汤)' },
				bone: { icon: '🦴', label: 'Bone (骨汤)' },
				spicy: { icon: '🌶️', label: 'Spicy (麻辣)' },
				tomato: { icon: '🍅', label: 'Tomato (番茄)' },
				coconut: { icon: '🥥', label: 'Coconut (椰子)' },
			},
		},
		spiceLevel: {
			icon: '🌶️',
			label: 'Spice',
			options: {
				mild: { icon: '🌶️', label: 'Mild' },
				medium: { icon: '🌶️🌶️', label: 'Medium' },
				hot: { icon: '🌶️🌶️🌶️', label: 'Hot' },
				'extra-hot': { icon: '🔥🌶️🔥', label: 'Extra Hot' },
			},
		},
	};

	function getOptionConfig(configOptions: any, value: string) {
		return configOptions[value];
	}

	// Get active modifiers
	$: activeModifiers = modifiers
		? Object.entries(modifiers)
				.filter(([_, values]) => values && values.length > 0)
				.map(([key, values]) => ({
					key: key as keyof typeof modifierConfig,
					values: values as string[],
					config: modifierConfig[key as keyof typeof modifierConfig],
				}))
		: [];
</script>

{#if activeModifiers.length > 0}
	<div class="modifier-badges" class:compact>
		{#each activeModifiers as modifier}
			<div class="modifier-group">
				<span class="modifier-label" title={modifier.config.label}>
					{modifier.config.icon}
				</span>
				<div class="modifier-options">
					{#each modifier.values as value}
						{@const optionConfig = getOptionConfig(modifier.config.options, value)}
						{#if optionConfig}
							<span class="option-badge" title={optionConfig.label}>
								{#if compact}
									{optionConfig.icon}
								{:else}
									{optionConfig.icon} {optionConfig.label}
								{/if}
							</span>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.modifier-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2, 0.5rem);
	}

	.modifier-group {
		display: flex;
		align-items: center;
		gap: var(--space-1, 0.25rem);
		padding: 2px 6px;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 6px;
		font-size: var(--text-xs, 0.75rem);
	}

	.modifier-label {
		font-size: 1em;
		opacity: 0.7;
	}

	.modifier-options {
		display: flex;
		gap: var(--space-1, 0.25rem);
	}

	.option-badge {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 1px 4px;
		background: var(--color-surface, white);
		border-radius: 4px;
		font-size: var(--text-xs, 0.75rem);
		white-space: nowrap;
	}

	/* Compact mode - icons only */
	.compact .modifier-group {
		padding: 2px 4px;
	}

	.compact .option-badge {
		padding: 0;
		background: transparent;
	}
</style>
