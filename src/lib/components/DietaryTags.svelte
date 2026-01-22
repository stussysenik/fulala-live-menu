<script lang="ts">
	// Dietary tag type matching schema
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

	export let tags: DietaryTag[];
	export let compact: boolean = false;

	// Tag configuration with icons, labels, and colors
	const tagConfig: Record<
		DietaryTag,
		{ icon: string; label: string; color: string; bgColor: string }
	> = {
		vegetarian: {
			icon: '🥬',
			label: 'Vegetarian',
			color: '#16a34a',
			bgColor: '#dcfce7',
		},
		vegan: {
			icon: '🌱',
			label: 'Vegan',
			color: '#15803d',
			bgColor: '#bbf7d0',
		},
		'contains-seafood': {
			icon: '🦐',
			label: 'Seafood',
			color: '#0284c7',
			bgColor: '#e0f2fe',
		},
		'contains-pork': {
			icon: '🐷',
			label: 'Pork',
			color: '#db2777',
			bgColor: '#fce7f3',
		},
		'contains-beef': {
			icon: '🐄',
			label: 'Beef',
			color: '#b91c1c',
			bgColor: '#fee2e2',
		},
		'contains-chicken': {
			icon: '🐔',
			label: 'Chicken',
			color: '#ca8a04',
			bgColor: '#fef9c3',
		},
		'contains-nuts': {
			icon: '🥜',
			label: 'Nuts',
			color: '#a16207',
			bgColor: '#fef3c7',
		},
		'gluten-free': {
			icon: 'GF',
			label: 'Gluten-Free',
			color: '#7c3aed',
			bgColor: '#ede9fe',
		},
		'dairy-free': {
			icon: 'DF',
			label: 'Dairy-Free',
			color: '#0891b2',
			bgColor: '#cffafe',
		},
		halal: {
			icon: '☪️',
			label: 'Halal',
			color: '#059669',
			bgColor: '#d1fae5',
		},
		kosher: {
			icon: '✡️',
			label: 'Kosher',
			color: '#4338ca',
			bgColor: '#e0e7ff',
		},
	};

	// Filter to only show valid tags
	$: validTags = tags.filter((tag) => tag in tagConfig);
</script>

<div class="dietary-tags" class:compact>
	{#each validTags as tag}
		{@const config = tagConfig[tag]}
		<span
			class="tag"
			class:text-tag={config.icon === 'GF' || config.icon === 'DF'}
			style:--tag-color={config.color}
			style:--tag-bg={config.bgColor}
			title={config.label}
		>
			<span class="tag-icon">{config.icon}</span>
			{#if !compact}
				<span class="tag-label">{config.label}</span>
			{/if}
		</span>
	{/each}
</div>

<style>
	.dietary-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1, 0.25rem);
		align-items: center;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1, 0.25rem);
		padding: 2px 6px;
		background: var(--tag-bg);
		color: var(--tag-color);
		border-radius: 12px;
		font-size: var(--text-xs, 0.75rem);
		line-height: 1.4;
		white-space: nowrap;
	}

	.tag.text-tag {
		font-weight: 700;
		padding: 2px 8px;
	}

	.tag-icon {
		font-size: 1em;
	}

	.tag.text-tag .tag-icon {
		font-family: var(--font-body, system-ui);
		font-size: var(--text-xs, 0.75rem);
	}

	.tag-label {
		font-family: var(--font-body, system-ui);
		font-weight: 500;
	}

	/* Compact mode - icons only */
	.compact .tag {
		padding: 2px 4px;
		border-radius: 4px;
		font-size: 0.9em;
	}

	.compact .tag.text-tag {
		padding: 1px 4px;
		font-size: var(--text-xs, 0.75rem);
	}
</style>
