<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BilingualName from './BilingualName.svelte';
	import '$lib/styles/tv-portrait.css';

	const { Story } = defineMeta({
		title: 'Atoms/BilingualName',
		component: BilingualName,
		parameters: { layout: 'padded' },
	});
</script>

<Story
	name="All three languages"
	args={{
		name: 'Steamed Pork & Chinese Cabbage Dumplings',
		nameLocal: 'Vepřové knedlíčky s čínským zelím',
		nameChinese: '猪肉白菜饺子',
	}}
/>

<Story
	name="Chinese hidden"
	args={{
		name: 'Steamed Pork & Chinese Cabbage Dumplings',
		nameLocal: 'Vepřové knedlíčky s čínským zelím',
		nameChinese: '猪肉白菜饺子',
		showChinese: false,
	}}
/>

<Story name="English only" args={{ name: 'Chongqin noodles' }} />
