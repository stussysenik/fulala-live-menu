<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SectionTitle from './SectionTitle.svelte';
	import '$lib/styles/tv-portrait.css';

	const { Story } = defineMeta({
		title: 'Atoms/SectionTitle',
		component: SectionTitle,
		parameters: { layout: 'padded' },
	});
</script>

<Story name="Default" args={{ title: 'Nápoje / Drinks' }} />
