<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TvPortraitHeader from './TvPortraitHeader.svelte';
	import '$lib/styles/tv-portrait.css';

	const { Story } = defineMeta({
		title: 'TV/TvPortraitHeader',
		component: TvPortraitHeader,
		parameters: { layout: 'fullscreen' },
	});
</script>

<Story name="With Clock" args={{ currentTime: '16:45:08' }} />

<Story name="No Clock" args={{ currentTime: '' }} />
