<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TvMenuItem from './TvMenuItem.svelte';
	import '$lib/styles/tv-portrait.css';

	const { Story } = defineMeta({
		title: 'TV/TvMenuItem',
		component: TvMenuItem,
		parameters: { layout: 'fullscreen' },
	});

	const baseItem = {
		_id: 'mock_1',
		_creationTime: Date.now(),
		name: 'Steamed Pork & Chinese Cabbage Dumplings',
		nameLocal: 'Vepřové knedlíčky s čínským zelím',
		nameChinese: '猪肉白菜饺子',
		price: 179,
		categoryId: 'cat_1',
		isAvailable: true,
		sortOrder: 1,
		addedAt: Date.now(),
		lastModifiedAt: Date.now(),
		modificationCount: 0,
		imageUrl: '/images/menu/dumplings-pork-cabbage.webp',
		allergenCodes: ['1a', '6'],
		quantity: '6ks',
		isFeatured: true,
	};
</script>

<Story name="Default" args={{ item: baseItem }} />

<Story name="Featured" args={{ item: { ...baseItem, isFeatured: true } }} />

<Story name="Sweet" args={{ item: { ...baseItem, name: 'Steamed Custard Bun', nameLocal: 'Parní buchta s vanilkovým krémem', nameChinese: '奶黄包', price: 89, quantity: '3ks', isSweet: true, isFeatured: false, allergenCodes: ['1a', '3', '7'] } }} />

<Story name="Gluten Free" args={{ item: { ...baseItem, name: 'Gluten-Free Thick Rice Noodles with Minced Pork', nameLocal: 'Bezlepkové rýžové nudle s mletým vepřovým', nameChinese: '猪肉米线', price: 289, quantity: undefined, isGlutenFree: true, isFeatured: false, allergenCodes: [] } }} />

<Story name="Price Tiers (Salty)" args={{ item: { ...baseItem, priceTiers: [{ quantity: '4ks', price: 119 }, { quantity: '6ks', price: 179 }, { quantity: '12ks', price: 359 }] } }} />

<Story name="Price Tiers (Sweet)" args={{ item: { ...baseItem, name: 'Steamed Custard Bun', nameLocal: 'Parní buchta s vanilkovým krémem', nameChinese: '奶黄包', price: 89, quantity: '3ks', isSweet: true, isFeatured: false, allergenCodes: ['1a', '3', '7'], priceTiers: [{ quantity: '3ks', price: 89 }, { quantity: '6ks', price: 179 }, { quantity: '9ks', price: 269 }] } }} />

<Story name="Sold Out" args={{ item: { ...baseItem, isAvailable: false } }} />
