<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PriceTag from './PriceTag.svelte';
	import '$lib/styles/tv-portrait.css';

	const { Story } = defineMeta({
		title: 'Atoms/PriceTag',
		component: PriceTag,
		parameters: { layout: 'padded' },
	});
</script>

<Story name="Single price" args={{ price: 289 }} />

<Story name="With portion" args={{ price: 89, quantity: '3ks' }} />

<Story
	name="Price tiers"
	args={{
		price: 179,
		priceTiers: [
			{ quantity: '4ks', price: 119 },
			{ quantity: '6ks', price: 179 },
			{ quantity: '12ks', price: 359 },
		],
	}}
/>
