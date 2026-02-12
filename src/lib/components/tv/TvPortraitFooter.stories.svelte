<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TvPortraitFooter from './TvPortraitFooter.svelte';
	import '$lib/styles/tv-portrait.css';

	const { Story } = defineMeta({
		title: 'TV/TvPortraitFooter',
		component: TvPortraitFooter,
		parameters: { layout: 'fullscreen' },
	});
</script>

<Story name="Default" />
