<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ItemPhoto from './ItemPhoto.svelte';
	import '$lib/styles/tv-portrait.css';

	const { Story } = defineMeta({
		title: 'Atoms/ItemPhoto',
		component: ItemPhoto,
		parameters: { layout: 'padded' },
	});
</script>

<Story
	name="With photo"
	args={{ src: '/images/menu/dumplings-pork-cabbage.webp', alt: 'Pork dumplings' }}
/>

<Story name="Branded placeholder (no photo)" args={{ alt: 'Item awaiting photography' }} />
